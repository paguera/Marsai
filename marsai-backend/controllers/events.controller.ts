import { Request, Response } from "express";
import eventsModel from "../models/events.model";
import { verify } from "jsonwebtoken";
import sendEmail from "../services/email";
import { body, validationResult } from "express-validator";
import bookingService from "../services/booking.service";

const JWT_SECRET = process.env.JWT_SECRET || ''; // Clé secrète JWT pour la vérification des tokens.

// --- Règles de validation (Schema validation) ---

// Règles express-validator pour la création/mise à jour d'un événement
export const CreateEventSchema = [
  body('title').trim().isLength({ max: 50 }).withMessage("Titre trop long"), // Le titre doit faire au maximum 50 caractères.
  body('description').trim().isLength({ min: 10 }).withMessage("10 caractères minimum"), // La description doit faire au moins 10 caractères.
  body('status').isIn(["Scheduled", "Cancelled", "Completed"]).withMessage("Statut invalide"), // Le statut doit être l'un des trois états prédéfinis.
  body('start_at').notEmpty().withMessage("Date requise"), // La date de début ne doit pas être vide.
  body('duration').isNumeric().withMessage("La durée doit être un nombre"), // La durée doit être un nombre.
  body('location').trim().notEmpty().withMessage("Le lieu est requis"), // Le lieu doit être spécifié.
];

// Règles express-validator pour la création d'une réservation
export const CreateReservationSchema = [
  body('firstname').trim().isLength({ min: 2 }).withMessage("Prénom trop court"), // Prénom minimum de 2 caractères.
  body('lastname').trim().isLength({ min: 2 }).withMessage("Nom trop court"), // Nom minimum de 2 caractères.
  body('email').trim().isEmail().withMessage("Email invalide"), // L'email doit être valide.
  body('event_id').isInt().withMessage("ID événement invalide"), // L'ID de l'événement doit être un entier.
];

// --- Contrôleur pour la gestion des événements ---

/**
 * Ajoute un nouvel événement dans la base de données après validation des données.
 */
const addEvent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Retourne les erreurs de validation 400.
  }

  try {
    const event = req.body;
    await eventsModel.addEvent(event);
    return res.status(201).json({ message: "Event ajouté avec succès" });
  } catch (error: any) {
    console.error("Database error:", error.message);
    return res.status(500).json({ error: "Database error" }); // Gestion des erreurs de base de données.
  }
};

/**
 * Récupère la liste complète des événements.
 */
const getAll = async (req: Request, res: Response) => {
  try {
    const results = await eventsModel.getAll();
    res.json(results);
  } catch (error: any) {
    console.error("Database error:", error.message);
    return res.status(500).json({ error: "Database error" });
  }
};

/**
 * Récupère les détails d'un événement spécifique par son ID.
 */
const getOne = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const results = await eventsModel.getOne(id);
    res.json(results);
  } catch (error: any) {
    console.error("Database error:", error.message);
    return res.status(500).json({ error: "Database error" });
  }
};

/**
 * Calcule et retourne la somme totale des participants inscrits à tous les événements.
 */
const getParticipantSum = async (req: Request, res: Response) => {
  try {
    const total = await eventsModel.getParticipantSum();
    res.json({ total });
  } catch (error: any) {
    console.error("Database error:", error.message);
    return res.status(500).json({
      error: "Erreur de base de données lors de la récupération du total.",
    });
  }
};

/**
 * Supprime un événement de la base de données par son ID.
 */
const deleteOne = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const results = await eventsModel.deleteOne(id);
    res.json(results);
  } catch (error: any) {
    console.error("Database error:", error.message);
    return res.status(500).json({ error: "Database error" });
  }
};

/**
 * Récupère la liste de toutes les réservations existantes.
 */
const getReservations = async (req: Request, res: Response) => {
  try {
    const results = await eventsModel.getReservations();
    res.json(results);
  } catch (error: any) {
    console.error("Database error:", error.message);
    return res.status(500).json({ error: "Database error" });
  }
};

/**
 * Traite la réservation d'un participant pour un événement donné.
 * Utilise bookingService pour la logique métier (vérification de disponibilité, etc.).
 */
const addReservation = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const result = await bookingService.bookEvent(req.body, baseUrl);
    return res.status(201).json({
      message: "Réservation réussie",
      participantId: result.participantId,
      bookingId: result.bookingId,
    });
  } catch (error: any) {
    if (error.message === "ALREADY_BOOKED") {
      return res.status(400).json({
        error: "Cet email est déjà inscrit pour cet événement.",
      });
    }
    console.error("Erreur de réservation :", error.message);
    return res.status(500).json({
      error: "Erreur lors de la réservation : " + error.message,
    });
  }
};

/**
 * Annule une réservation en utilisant un token JWT contenant les identifiants nécessaires.
 * Redirige en GET ou répond par JSON en POST.
 */
const removeReservation = async (req: Request, res: Response) => {
  const token = req.params.token as string;
  try {
    // 1. Décoder le token pour récupérer les infos utilisateur/booking
    const decoded: any = verify(token, JWT_SECRET);
    const email = decoded.email;
    const eventId = decoded.eventId;
    const bookingId = decoded.bookingId;

    // 2. Récupérer les détails de l'événement pour l'email de confirmation
    const event = await eventsModel.getOne(eventId);
    // 3. Supprimer la réservation de la base de données
    await eventsModel.removeBooking(bookingId);
    let emailSentSuccessfully = true;
    try {
      // 4. Envoyer l'email de confirmation d'annulation (dans un bloc try/catch séparé)
      await sendEmail({
        to: email,
        subject: `Annulation de votre réservation`,
        textBody: `Bonjour,\n\nVotre réservation pour l'événement ${event.title} a été annulée.`,
        htmlBody: `<p>Bonjour,</p><p>Votre réservation pour l'événement <strong>${event.title}</strong> a été annulée avec succès.</p>`,
        attachments: [],
      });
    } catch (error: any) {
      console.warn("Avertissement : Échec de l'envoi de l'email d'annulation. Le traitement de la réservation continue.", error.message);
      emailSentSuccessfully = false;
    }
    
    // 5. Gérer la réponse HTTP selon la méthode de requête
    if (req.method === "GET") {
      return res.redirect(process.env.FRONT_URL + `/unbooked-success`); // Redirection en GET
    }
    
    if (!emailSentSuccessfully) {
        // Si l'email échoue, on renvoie 202 (Accepté) pour indiquer que la suppression DB est OK, mais on informe le client du problème d'email.
        return res.status(202).json({ 
            message: "Réservation annulée avec succès, mais l'envoi de l'email a échoué. Veuillez vérifier vos paramètres de messagerie.",
            bookingId: bookingId
        });
    }
    
    return res.status(200).json({ message: "Réservation annulée avec succès." }); // Réponse JSON en POST
  } catch (error: any) {
    console.error("Erreur lors de l'annulation :", error.message);
    return res.status(500).json({
      error: "Erreur lors de l'annulation de la réservation : " + error.message,
    });
  }
};

export default {
  getAll,
  getOne,
  deleteOne,
  addEvent,
  getParticipantSum,
  getReservations,
  addReservation,
  removeReservation,
};
