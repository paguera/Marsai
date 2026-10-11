// Ce fichier définit le contexte d'authentification pour l'application de manière globale.
// Il fournit des fonctionnalités de connexion, de déconnexion et de gestion de l'état utilisateur via un cookie HttpOnly.

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
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (formData: unknown) => Promise<void>;
  logout: () => void;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonction utilitaire pour récupérer un cookie par son nom
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
}

// Créer le composant fournisseur
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => getCookie('auth_token'));
    const navigate = useNavigate();

    // Fonction pour gérer la déconnexion
    const logout = () => {
        document.cookie = 'auth_token=; path=/; HttpOnly; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setToken(null);
        setUser(null);
        navigate("/");
    };

    // Fonction pour récupérer les données de l'utilisateur à partir du token d'authentification
    const fetchUserData = async (authToken: string): Promise<User | null> => {
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
                logout();
            }
        } catch (error) {
            console.error(
                "Échec de la récupération des données utilisateur :",
                error,
            );
        }
        return null;
    };

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Décoder le token pour vérifier sa validité
                    const decoded: any = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    // Si le token est expiré, déconnecter l'utilisateur
                    if (decoded.exp && decoded.exp < currentTime) {
                        logout();
                        return;
                    }

                    // Récupérer les données de l'utilisateur
                    const userData = await fetchUserData(token);
                    setUser(userData);
                } catch (error: any) {
                    console.error("Erreur lors de l'initialisation de l'authentification :", error);
                    setUser(null);
                }
            }
        };
        initAuth();
    }, [token]); // Exécuter quand le token change

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

                // Définir le cookie d'authentification (supposé que `data.token` existe)
                document.cookie = `auth_token=${data.token}; path=/; HttpOnly; SameSite=Lax`;
                setToken(data.token);

                // Mettre à jour l'état utilisateur
                setUser(data.user);

                // Rediriger en fonction du rôle de l'utilisateur
                if (data.user.role.includes("ADMIN")) {
                    navigate("/dashboard");
                } else if (data.user.role.includes("JURY")) {
                    navigate("/movies/jury");
                }
            } else {
                alert("Identifiants incorrects !");
            }
        } catch (error) {
            console.error("Erreur réseau lors de la connexion :", error);
            alert("Erreur réseau lors de la connexion.");
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personnalisé pour accéder au contexte d'authentification
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
    }
    return context;
};
