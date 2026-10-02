import { Request, Response } from "express";
import eventsModel from "../models/events.model";
import { verify } from "jsonwebtoken";
import sendEmail from "../services/email";
import { body, validationResult } from "express-validator";
import bookingService from "../services/booking.service";
import { escapeHtml } from "../utils/sanitize";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_marsai";

// --- Règles de validation (Schema validation) ---

export const CreateEventSchema = [
  body("title").trim().isLength({ max: 50 }).withMessage("Titre trop long"),
  body("description").trim().isLength({ min: 10 }).withMessage("10 caractères minimum"),
  body("status").isIn(["Scheduled", "Cancelled", "Completed"]).withMessage("Statut invalide"),
  body("start_at").notEmpty().withMessage("Date requise"),
  body("duration").isNumeric().withMessage("La durée doit être un nombre"),
  body("location").trim().notEmpty().withMessage("Le lieu est requis"),
];

export const CreateReservationSchema = [
  body("firstname").trim().isLength({ min: 2 }).withMessage("Prénom trop court"),
  body("lastname").trim().isLength({ min: 2 }).withMessage("Nom trop court"),
  body("email").trim().isEmail().withMessage("Email invalide"),
  body("event_id").isInt().withMessage("ID événement invalide"),
];

// --- Contrôleur pour la gestion des événements ---

const addEvent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = req.body;
    await eventsModel.addEvent(event);
    return res.status(201).json({ message: "Événement ajouté avec succès" });
  } catch (error: any) {
    console.error("Erreur addEvent :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const results = await eventsModel.getAll();
    res.json(results);
  } catch (error: any) {
    console.error("Erreur getAll :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getOne = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const results = await eventsModel.getOne(id);
    if (!results) {
      return res.status(404).json({ error: "Événement non trouvé." });
    }
    res.json(results);
  } catch (error: any) {
    console.error("Erreur getOne :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getParticipantSum = async (req: Request, res: Response) => {
  try {
    const total = await eventsModel.getParticipantSum();
    res.json({ total });
  } catch (error: any) {
    console.error("Erreur getParticipantSum :", error);
    return res.status(500).json({
      error: "Une erreur interne est survenue.",
    });
  }
};

const deleteOne = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const results = await eventsModel.deleteOne(id);
    res.json(results);
  } catch (error: any) {
    console.error("Erreur deleteOne :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getReservations = async (req: Request, res: Response) => {
  try {
    const results = await eventsModel.getReservations();
    res.json(results);
  } catch (error: any) {
    console.error("Erreur getReservations :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

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
    console.error("Erreur de réservation :", error);
    return res.status(500).json({
      error: "Une erreur interne est survenue lors de la réservation.",
    });
  }
};

const removeReservation = async (req: Request, res: Response) => {
  const token = req.params.token as string;
  try {
    const decoded: any = verify(token, JWT_SECRET);
    const email = decoded.email;
    const eventId = decoded.eventId;
    const bookingId = decoded.bookingId;

    const event = await eventsModel.getOne(eventId);
    await eventsModel.removeBooking(bookingId);

    const safeTitle = escapeHtml(event?.title || "l'événement");

    let emailSentSuccessfully = true;
    try {
      await sendEmail({
        to: email,
        subject: `Annulation de votre réservation`,
        textBody: `Bonjour,\n\nVotre réservation pour l'événement ${event?.title || ""} a été annulée.`,
        htmlBody: `<p>Bonjour,</p><p>Votre réservation pour l'événement <strong>${safeTitle}</strong> a été annulée avec succès.</p>`,
        attachments: [],
      });
    } catch (error: any) {
      console.warn("Avertissement : Échec de l'envoi de l'email d'annulation.", error.message);
      emailSentSuccessfully = false;
    }

    if (req.method === "GET") {
      return res.redirect((process.env.FRONT_URL || "https://marsai.paguera.fr") + `/unbooked-success`);
    }

    if (!emailSentSuccessfully) {
      return res.status(202).json({
        message: "Réservation annulée avec succès, mais l'envoi de l'email a échoué.",
        bookingId: bookingId,
      });
    }

    return res.status(200).json({ message: "Réservation annulée avec succès." });
  } catch (error: any) {
    console.error("Erreur lors de l'annulation :", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Ce lien d'annulation a expiré." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Lien d'annulation invalide." });
    }
    return res.status(500).json({
      error: "Une erreur interne est survenue lors de l'annulation.",
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
