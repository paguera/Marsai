import eventsModel from "../models/events.model";
import { sign } from "jsonwebtoken";
import sendEmail from "./email";
import { escapeHtml } from "../utils/sanitize";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_marsai";

class BookingService {
  /**
   * Gère le processus de réservation d'un événement.
   * @param data Les informations du participant et de l'événement (firstname, lastname, email, event_id).
   * @returns L'objet résultat de la réservation réussie.
   */
  async bookEvent(data: any, baseUrlParam?: string) {
    const { firstname, lastname, email, event_id } = data;
    const baseUrl = baseUrlParam || process.env.BASE_URL || "http://localhost:3000";

    // 1. Vérification de l'existence de la réservation : empêche les doubles inscriptions.
    const isAlreadyBooked = await eventsModel.checkBookingExists(email, event_id);
    if (isAlreadyBooked) {
      throw new Error("ALREADY_BOOKED");
    }

    // 2. Ajout de la réservation en base de données.
    const result = await eventsModel.addBooking({
      participant: { firstname, lastname, email },
      event_id,
    });

    // 3. Récupération des détails de l'événement pour la confirmation.
    const event = await eventsModel.getOne(event_id);

    // 4. Création du jeton de désinscription sécurisé avec expiration
    const unbookingToken = sign(
      { email: email, bookingId: result.bookingId, eventId: event_id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const unbookLink = `${baseUrl}/events/unbook/${unbookingToken}`;

    // 5. Échappement des variables pour prévenir toute injection HTML dans les e-mails
    const safeFirstname = escapeHtml(firstname);
    const safeLastname = escapeHtml(lastname);
    const safeTitle = escapeHtml(event?.title || "Événement MarsAI");
    const safeLocation = escapeHtml(event?.location || "Lieu non précisé");
    const safeStartAt = escapeHtml(String(event?.start_at || ""));

    const customizedHtml = `
      <h1>Confirmation de réservation</h1>
      <p>Bonjour ${safeFirstname} ${safeLastname},</p>
      <p>Votre réservation pour l'événement <strong>${safeTitle}</strong> est confirmée.</p>
      <ul>
        <li><strong>Lieu :</strong> ${safeLocation}</li>
        <li><strong>Date :</strong> ${safeStartAt}</li>
      </ul>
      <hr style="margin-top: 30px;">
      <p style="font-size: 12px; color: #666;">
        Vous souhaitez annuler ? <a href="${unbookLink}">Cliquez ici pour vous désinscrire de cet événement</a> (lien valable 7 jours).
      </p>
    `;

    // 6. Envoi de l'email de confirmation.
    try {
      await sendEmail({
        to: email,
        subject: `Confirmation de réservation : ${event?.title || "Événement MarsAI"}`,
        textBody: `Votre réservation pour "${event?.title || "Événement MarsAI"}" est confirmée.\nLien d'annulation : ${unbookLink}`,
        htmlBody: customizedHtml,
        attachments: [],
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de confirmation :", error);
      console.warn(`[Fallback] La réservation pour "${event?.title}" est confirmée.\nLien d'annulation : ${unbookLink}`);
    }
    // 7. Retourne les informations de la réservation créée.
    return result;
  }
}

export default new BookingService();
