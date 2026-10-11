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
  let token: string | undefined;

  // 1. Récupération depuis les cookies HTTP
  if (req.cookies && (req.cookies.auth_token || req.cookies.token)) {
    token = req.cookies.auth_token || req.cookies.token;
  }
  // 2. Récupération de secours depuis le header Authorization (Bearer token)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Jeton d'authentification manquant." });
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
