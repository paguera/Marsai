import { Request, Response } from "express";
import tagsModel from "../models/tags.model";

async function getAllTags(req: Request, res: Response) {
  let category: string = '';
  // Gestion robuste des paramètres de route pour 'category'
  const params = req.params.category;
  if (typeof params === 'string' && params.length > 0) {
    category = params;
  } else {
    console.error("Catégorie manquante ou invalide dans les paramètres de la requête.");
    return res.status(400).send("Erreur: La catégorie est requise.");
  }
    try {
      const results = await tagsModel.getAllTagsByCategory(category);
      res.status(200).json(results);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des tags: " + error.message);
      res.status(500).send("Erreur: " + error.message);
    }
}

async function addTag(req: Request, res: Response) {
  const { name, movie_id } = req.body.data || {};
  if (!name || !movie_id) {
    return res.status(400).send("Missing tag name or movie_id");
  }
  
  try {
    const results = await tagsModel.insertTag(name, movie_id);
    return res.status(200).json(results);
  } catch (error: any) {
    console.error("Error while inserting tag: " + error.message);
    return res.status(500).send("Erreur: " + error.message);
  }
}

export default {  getAllTags, addTag };
