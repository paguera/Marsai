import path from "path";
import Attachment from "../interfaces/services.interfaces";
import subscribersModel from "../models/subscribers.model";
import sendEmail from "../services/email";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

// subscribing to a newsletter
async function subscribeNewsletter(req: any, res: any): Promise<void> {
  const email = req.body.email;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

  if (!email || typeof email !== "string") {
    console.error("Invalid email address provided for subscription.");
    return res.status(400).send("Invalid email address.");
  }

  try {
    // Check if the email is already subscribed to the newsletter
    const results: any = await subscribersModel.getSubscribersByEmail(email);

    if (results && results.length > 0) {
      console.warn(`L'adresse email ${email} est déjà inscrite à la newsletter.`);
      return res.status(409).send("Email is already subscribed.");
    }

    // Add subscriber to the database
    await subscribersModel.addSubscriber(email);
    console.info(`Inscription réussie de ${email} à la newsletter !`);

    // Generate unsubscribe token
    const unsubscribeToken = sign({ email }, JWT_SECRET);
    const unsubscribeLink = `${baseUrl}/subscribers/unsubscribe/${unsubscribeToken}`;

    const attach: Attachment[] = [
      {
        filename: "Cat.jpg",
        path: path.resolve(__dirname, "../services", "welcome.jpg"),
      },
    ];
    const subject = "Welcome to our Newsletter!";
    const textBody = `Thank you for subscribing to our newsletter!\n\n
  To unsubscribe, please click here: ${unsubscribeLink}`;
    const htmlBody = `<h1>Thank you for subscribing to our newsletter!</h1>
  <p>We are glad to have you on board.</p>
  <p><a href="${unsubscribeLink}">Click here to unsubscribe from our newsletter at any time.</a></p>`;

    // Sending confirmation mail
    try {
      console.info(`Tentative d'envoi du mail de bienvenue à ${email}...`);
      const info = await sendEmail({
        to: email,
        subject: subject,
        textBody: textBody,
        htmlBody: htmlBody,
        attachments: attach,
      });
      console.info(`E-mail de bienvenue envoyé avec succès à ${email}. Message ID : ${info.messageId}`);
      res
        .status(201)
        .send(
          "Successfully subscribed to the newsletter and welcome email sent.",
        );
    } catch (error: any) {
      console.error(`Failed to send Welcome email to ${email}:`, error);
      res
        .status(207)
        .send(
          `Successfully subscribed, but the welcome email could not be sent. Error: ${error.message}`,
        );
    }
  } catch (err: any) {
    console.error(`Server error: ${err.message}`);
    return res.status(500).send("Server error.");
  }
}

//unsubscribing from a newsletter
// Fonction asynchrone pour gérer la désinscription d'un utilisateur du newsletter
async function unsubscribeNewsletter(req: any, res: any): Promise<void> {
  let email: string | undefined;

  // Extraction du token depuis les paramètres de la requête
  const token = req.params.token;

  if (token) {
    try {
      // Vérification du token JWT pour récupérer l'email
      const decoded: any = verify(token, JWT_SECRET);
      email = decoded.email;
    } catch (err: any) {
      // Gestion des erreurs de vérification du token (token invalide ou expiré)
      console.error(
        `Erreur de désinscription (token invalide) : ${err.message}`,
      );
      return res.status(401).send("Lien de désinscription invalide ou expiré.");
    }
  }

  // Vérification de la validité du token et de l'email
  if (!token || !email || typeof email !== "string") {
    console.error("Aucun email ou token valide fourni pour la déscription.");
    return res.status(400).send("Informations manquantes pour la déscription.");
  }

  try {
    // Recherche de l'utilisateur par email dans la base de données
    const results: any = await subscribersModel.getSubscribersByEmail(email);

    if (!results || results.length === 0) {
      // L'utilisateur n'existe pas ou a déjà été désinscrit
      return res.status(404).send("Email non trouvé ou déjà désinscrit");
    }

    // Suppression de l'utilisateur du newsletter's database
    await subscribersModel.removeSubscriber(email);

    // Redirection ou réponse selon la méthode de la requête
    if (req.method === "GET") {
      return res.redirect(process.env.FRONT_URL + `/unsubscribed-success`);
    }

    res
      .status(200)
      .send("L'utilisateur a été correctement désinscrit du newsletter.");
  } catch (err: any) {
    // Gestion des erreurs serveur
    console.error(`Erreur serveur pendant la déscription : ${err.message}`);
    return res.status(500).send("Erreur serveur.");
  }
}
// getting all subscribers
async function getAllSubscribers(req: any, res: any) {
  try {
    const results = await subscribersModel.getAllSubscribers();
    res.status(200).send(results);
  } catch (err: any) {
    console.error(`Failed to get all subscribers: ${err.message}`);
    res.status(500).send("Server error.");
  }
}

async function deleteSubscriberById(req: any, res: any) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send("Invalid subscriber ID.");
  }

  try {
    const result: any = await subscribersModel.removeSubscriberById(id);
    if (result.affectedRows === 0) {
      return res.status(404).send("Subscriber not found.");
    }
    res.status(200).send("Subscriber deleted successfully.");
  } catch (err: any) {
    console.error(`Failed to delete subscriber: ${err.message}`);
    res.status(500).send("Server error.");
  }
}

export default {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllSubscribers,
  deleteSubscriberById,
};
