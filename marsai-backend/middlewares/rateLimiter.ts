import rateLimit from "express-rate-limit";

/**
 * Limiteur global pour l'ensemble des routes de l'API.
 * Protège contre les attaques DoS et le scraping intensif.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limite chaque IP à 500 requêtes par fenêtre
  standardHeaders: true, // Retourne les headers `RateLimit-*` standard
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*` dépréciés
  message: {
    error: "Trop de requêtes effectuées depuis cette adresse IP, veuillez réessayer plus tard.",
  },
});

/**
 * Limiteur strict pour les routes d'authentification (/auth/login).
 * Protège contre le credential stuffing et la force brute.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 tentatives échouées/réussies par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Trop de tentatives de connexion. Veuillez patienter 15 minutes avant de réessayer.",
  },
});

/**
 * Limiteur pour les actions déclenchant des envois d'e-mails (/events/book, /subscribers/subscribe).
 * Protège contre l'email bombing et la saturation SMTP.
 */
export const emailActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Trop de requêtes d'envoi. Veuillez patienter avant de renouveler cette action.",
  },
});

/**
 * Limiteur pour les soumissions lourdes de médias (/movies POST).
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Limite de soumission atteinte. Veuillez réessayer ultérieurement.",
  },
});
