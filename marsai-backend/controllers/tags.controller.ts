import { Request, Response } from "express";
import tagsModel from "../models/tags.model";

async function getAllTags(req: Request, res: Response) {
  let category: string = "";
  const params = req.params.category;
  if (typeof params === "string" && params.length > 0) {
    category = params;
  } else {
    return res.status(400).json({ error: "La catégorie est requise." });
  }

  try {
    const results = await tagsModel.getAllTagsByCategory(category);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("Erreur getAllTags :", error);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

async function addTag(req: Request, res: Response) {
  const { name, movie_id } = req.body.data || req.body || {};
  if (!name || !movie_id || isNaN(Number(movie_id))) {
    return res.status(400).json({ error: "Nom du tag ou identifiant de film manquant/invalide." });
  }

  try {
    const results = await tagsModel.insertTag(name, Number(movie_id));
    return res.status(200).json(results);
  } catch (error: any) {
    console.error("Erreur addTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

export default { getAllTags, addTag };
