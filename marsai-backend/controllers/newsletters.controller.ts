import { Request, Response } from "express";
import NewsletterModel from "../models/newsletter.model";
import sendEmail from "../services/email";
import subscribersModel from "../models/subscribers.model";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_marsai";

export const addNewsletter = async (req: Request, res: Response) => {
  try {
    const { object, content } = req.body;
    if (!object || !content) {
      return res.status(400).json({ error: "L'objet et le contenu sont requis." });
    }
    const result = await NewsletterModel.addNewsletter({ object, content });
    res.status(201).json({ message: "Newsletter créée avec succès", data: result });
  } catch (err) {
    console.error("Erreur addNewsletter :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

export const getAllNewsletters = async (req: Request, res: Response) => {
  try {
    const result = await NewsletterModel.getAllNewsletters();
    res.status(200).json({ message: "Newsletters récupérées", data: result });
  } catch (err) {
    console.error("Erreur getAllNewsletters :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

export const sendNewsletterByIdToAllSubscribers = async (
  req: Request,
  res: Response,
) => {
  const newsletterId: string = req.body.newsletterId;
  const baseUrl = process.env.BASE_URL || "https://marsai.paguera.fr";

  try {
    const newsletterResults: any =
      await NewsletterModel.getNewsletterById(newsletterId);

    if (!newsletterResults) {
      return res
        .status(404)
        .json({ error: "Newsletter introuvable avec cet identifiant." });
    }

    const nl = newsletterResults;
    const subscribers: any = await subscribersModel.getAllSubscribers();

    const sendPromises = subscribers.map(async (subscriber: any) => {
      try {
        const unsubscribeToken = sign(
          { email: subscriber.email },
          JWT_SECRET,
          { expiresIn: "30d" }
        );
        const unsubscribeLink = `${baseUrl}/subscribers/unsubscribe/${unsubscribeToken}`;

        const customizedHtml = `
          ${nl.content}
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">
            Vous recevez cet email car vous êtes inscrit à notre newsletter. 
            <br>
            <a href="${unsubscribeLink}">Se désinscrire de la newsletter</a> (valable 30 jours)
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

    res
      .status(200)
      .json({ message: "Processus d'envoi de newsletter terminé avec succès" });
  } catch (err) {
    console.error("Erreur sendNewsletter :", err);
    return res
      .status(500)
      .json({ error: "Une erreur interne est survenue lors de l'envoi." });
  }
};

export default {
  addNewsletter,
  getAllNewsletters,
  sendNewsletterByIdToAllSubscribers,
};
