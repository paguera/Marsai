import eventsModel from "../models/events.model";
import { sign } from "jsonwebtoken";
import sendEmail from "./email"; // Importe la fonction pour envoyer des emails.

const JWT_SECRET = process.env.JWT_SECRET as string; // Clé secrète JWT, nécessaire pour créer des tokens sécurisés.
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"; // URL de base de l'application pour construire les liens.

class BookingService {
  /**
   * Gère le processus de réservation d'un événement.
   * @param data Les informations du participant et de l'événement (firstname, lastname, email, event_id).
   * @returns L'objet résultat de la réservation réussie.
   */
  async bookEvent(data: any, baseUrlParam?: string) {
    const { firstname, lastname, email, event_id } = data;
    const baseUrl = baseUrlParam || process.env.BASE_URL || "http://localhost:5011";

    // 1. Vérification de l'existence de la réservation : empêche les doubles inscriptions.
    const isAlreadyBooked = await eventsModel.checkBookingExists(email, event_id);
    if (isAlreadyBooked) {
      throw new Error("ALREADY_BOOKED"); // Lève une erreur spécifique si l'email est déjà enregistré pour cet événement.
    }

    // 2. Ajout de la réservation en base de données.
    const result = await eventsModel.addBooking({
      participant: { firstname, lastname, email },
      event_id,
    });

    // 3. Récupération des détails de l'événement pour la confirmation.
    const event = await eventsModel.getOne(event_id);

    // 4. Création du jeton de désinscription (unbookingToken) : sécurise le lien d'annulation.
    const unbookingToken = sign(
      { email: email, bookingId: result.bookingId, eventId: event_id }, // Payload contient les identifiants nécessaires à l'annulation.
      JWT_SECRET
    );
    const unbookLink = `${baseUrl}/events/unbook/${unbookingToken}`; // Construction du lien complet de désinscription.

    // 5. Création du corps HTML personnalisé pour l'email.
    const customizedHtml = `
      <h1>Confirmation de réservation</h1>
      <p>Bonjour ${firstname} ${lastname},</p>
      <p>Votre réservation pour l'événement <strong>${event.title}</strong> est confirmée.</p>
      <ul>
        <li><strong>Lieu :</strong> ${event.location}</li>
        <li><strong>Date :</strong> ${event.start_at}</li>
      </ul>
      <hr style="margin-top: 30px;">
      <p style="font-size: 12px; color: #666;">
        Vous souhaitez annuler ? <a href="${unbookLink}">Cliquez ici pour vous désinscrire de cet événement</a>.
      </p>
    `;

    // 6. Envoi de l'email de confirmation.
    try {
      await sendEmail({
        to: email,
        subject: `Confirmation de réservation : ${event.title}`,
        textBody: `Votre réservation pour "${event.title}" est confirmée.\nLien d'annulation : ${unbookLink}`,
        htmlBody: customizedHtml,
        attachments: [],
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de confirmation :", error);
      console.warn(`[Fallback] La réservation pour "${event.title}" est confirmée.\nLien d'annulation : ${unbookLink}`);
    }
    // 7. Retourne les informations de la réservation créée.
    return result;
  }
}

export default new BookingService(); // Exportation d'une instance du service.
