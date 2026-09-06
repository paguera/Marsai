const jwt = require("jsonwebtoken");
import { Request, Response } from "express";
require("dotenv").config();

// Fonction d'authentification du token
const authenticateToken: any = (
  req: any,
  res: Response,
  next: Function,
): any => {
  // Récupération du token de l'en-tête d'autorisation
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Accès refusé");
  }
  // Extraction du token
  const token = authHeader.split(" ")[1];

  // Vérification du token
  jwt.verify(
    token,
    (process.env.JWT_SECRET as string).trim(),
    (err: Error, decoded: any) => {
      // Gestion des tokens invalides ou expiries
      if (err) {
        return res.status(401).send("Token invalide ou expiré");
      }

      // Le token est valide, on ajoute les informations décodées à la requête
      req.user = decoded;
      next();
    },
  );
};

// Exportation de la fonction d'authentification
export default authenticateToken;
