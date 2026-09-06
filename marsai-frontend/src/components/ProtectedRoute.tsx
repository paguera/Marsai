import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccessDenied from "../pages/AccessDenied";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

/**
 * Composant de sécurisation des routes de l'application.
 * Vérifie l'authentification de l'utilisateur ainsi que ses rôles autorisés.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, token } = useAuth();

  // Si l'utilisateur n'est pas authentifié, redirection vers la page de connexion
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles spécifiques sont requis et que l'utilisateur n'en dispose pas, l'accès est refusé
  if (allowedRoles && !allowedRoles.some((role) => user.role.includes(role))) {
    return <AccessDenied />;
  }

  // Rendu des routes enfants ou de l'Outlet (pour le routage imbriqué)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
