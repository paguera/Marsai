import { Request, Response } from "express";
import juryModel from "../models/jury.model";

const getRatingCount = async (req: Request, res: Response) => {
  try {
    const total = await juryModel.getRatingCount();
    res.json({ total });
  } catch (err: any) {
    console.error("Database error:", err.message);
    return res.status(500).json({
      error: "Erreur de base de données lors de la récupération du total.",
    });
  }
};

export default {
  getRatingCount,
};
