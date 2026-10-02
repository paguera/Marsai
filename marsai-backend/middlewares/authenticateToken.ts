import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_marsai";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

/**
 * Middleware d'authentification par jeton JWT (Bearer Token).
 */
const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Accès refusé. Jeton d'authentification manquant." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Jeton d'authentification invalide." });
  }

  jwt.verify(token, JWT_SECRET.trim(), (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: "Jeton expiré ou invalide." });
    }

    req.user = decoded;
    next();
  });
};

export default authenticateToken;
