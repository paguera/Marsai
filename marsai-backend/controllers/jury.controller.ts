import { Request, Response } from "express";
import juryModel from "../models/jury.model";

const getRatingCount = async (req: Request, res: Response) => {
  try {
    const total = await juryModel.getRatingCount();
    res.json({ total });
  } catch (err: any) {
    console.error("Erreur getRatingCount :", err);
    return res.status(500).json({
      error: "Une erreur interne est survenue.",
    });
  }
};

export default {
  getRatingCount,
};
