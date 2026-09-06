// Fichier de contrôleurs pour la gestion des newsletters
// Importation des modules nécessaires
import { Request, Response } from "express";
import NewsletterModel from "../models/newsletter.model";
import sendEmail from "../services/email";
import subscribersModel from "../models/subscribers.model";
import { sign } from "jsonwebtoken";

// Ajout d'une newsletter dans la base de données
// Créé une nouvelle newsletter à partir des données reçues dans la requête
export const addNewsletter = async (req: Request, res: Response) => {
  try {
    const result = await NewsletterModel.addNewsletter({
      object: req.body.object,
      content: req.body.content,
    });
    res.status(201).json({ message: "Newsletter créée", data: result });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send("Erreur serveur lors de la création de la newsletter.");
  }
};

// Récupération de toutes les newsletters
// Retourne la liste de toutes les newsletters enregistrées
export const getAllNewsletters = async (req: Request, res: Response) => {
  try {
    const result = await NewsletterModel.getAllNewsletters();
    res.status(200).json({ message: "Newsletters récupérées", data: result });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send("Erreur serveur lors de la récupération des newsletters.");
  }
};

// Envoi d'une newsletter à tous les abonnés
// Traite la demande d'envoi d'une newsletter spécifique à tous les utilisateurs inscrits
export const sendNewsletterByIdToAllSubscribers = async (
  req: Request,
  res: Response,
) => {
  const newsletterId: string = req.body.newsletterId;

  try {
    // Récupère la newsletter avec l'ID spécifié depuis la base de données
    const newsletterResults: any =
      await NewsletterModel.getNewsletterById(newsletterId);

    if (!newsletterResults || newsletterResults.length === 0) {
      console.error(
        "Échec de la recherche de la newsletter avec l'ID : " + newsletterId,
      );
      return res
        .status(404)
        .send("Newsletter non trouvée avec l'ID : " + newsletterId);
    }

    const nl = newsletterResults;

    // Récupère tous les abonnés
    const subscribers: any = await subscribersModel.getAllSubscribers();

    // Pour chaque email, appelle le service d'envoi d'email
    async function sendNewsletters(nl: any, subscribers: any[]) {
      const sendPromises = subscribers.map(async (subscriber: any) => {
        try {
          const unsubscribeToken = sign(
            { email: subscriber.email },
            process.env.JWT_SECRET as string,
          );
          const unsubscribeLink = `${process.env.BASE_URL}/subscribers/unsubscribe/${unsubscribeToken}`;

          const customizedHtml = `
            ${nl.content}
            <hr style="margin-top: 30px;">
            <p style="font-size: 12px; color: #666;">
              Vous recevez cet email car vous êtes inscrit à notre newsletter. 
              <br>
              <a href="${unsubscribeLink}">Se désinscrire de la newsletter</a>
            </p>
          `;

          await sendEmail({
            to: subscriber.email,
            subject: nl.object,
            textBody: `${nl.content}\n\nPour vous désinscrire : ${unsubscribeLink}`,
            htmlBody: customizedHtml,
            attachments: [],
          });
        } catch (err) {
          console.error(
            "Échec d'envoi de l'email à : " + subscriber.email,
            err,
          );
        }
      });

      await Promise.all(sendPromises);
    }

    await sendNewsletters(nl, subscribers);

    res
      .status(200)
      .json({ message: "Processus d'envoi de newsletter terminé" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send("Erreur serveur lors du processus d'envoi de newsletter");
  }
};

export default {
  addNewsletter,
  getAllNewsletters,
  sendNewsletterByIdToAllSubscribers,
};
