import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticateToken";

/**
 * Middleware d'autorisation basé sur les rôles utilisateur (RBAC).
 */
const authorizedRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès interdit : privilèges insuffisants." });
    }
    next();
  };
};

export default authorizedRoles;