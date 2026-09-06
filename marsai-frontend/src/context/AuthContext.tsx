// Ce fichier définit le contexte d'authentification pour l'application de manière globale.
// Il fournit des fonctionnalités de connexion, de déconnexion et de gestion de l'état utilisateur via un token.
import { jwtDecode } from "jwt-decode";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

// Interfaces définies :
// - User : contient les données de l'utilisateur (email, firstname, lastname, role)
interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
}

// - AuthContextType : structure du contexte d'authentification
// Interface pour la valeur du contexte
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (formData: unknown) => Promise<void>;
  logout: () => void;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Créer le composant fournisseur
// - AuthProvider : gère l'état global de l'authentification
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  // Fonction pour récupérer les données de l'utilisateur à partir du token d'authentification
  async function fetchUserData(authToken: string): Promise<User | null> {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data as User;
      } else if (response.status === 401 || response.status === 403) {
        // Token invalide ou expiré
        localStorage.removeItem("token");
        setToken(null);
      }
    } catch (error) {
      console.error(
        "Échec de la récupération des données utilisateur :",
        error,
      );
    }
    return null;
  }

  // Effet secondaire qui s'exécute lorsque le token change
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          // Si le token est expiré, on déconnecte
          if (decoded.exp && decoded.exp < currentTime) {
            logout();
            return;
          }

          if (!user) {
            const userData = await fetchUserData(token);
            setUser(userData);
          }
        } catch (error: any) {
          console.error("Token malformé :", error);
          logout();
        }
      } else {
        setUser(null);
      }
    };
    initAuth();
  }, [token]);

  const login = async (formData: unknown) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);

        if (data.user.role.includes("ADMIN")) {
          navigate("/dashboard");
        } else if (data.user.role.includes("JURY")) {
          navigate("/movies/jury");
        }
      } else {
        alert("Identifiants incorrects !");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur réseau lors de la connexion.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// - useAuth : permet aux composants enfants d'accéder au contexte d'authentification,
//   de stocker le token dans localStorage et de rediriger en fonction du rôle
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
