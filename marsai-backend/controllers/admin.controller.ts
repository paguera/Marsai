import { Request, Response } from "express";
import adminModel from "../models/admin.model";
import authModel from "../models/auth.model";

const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const results = await adminModel.deleteEvent(id);
    res.json(results);
  } catch (err: any) {
    console.error("Erreur deleteEvent:", err);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const results = await adminModel.getAllUsers();
    res.json(results);
  } catch (err: any) {
    console.error("Erreur getAllUsers:", err);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const promoteToAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "ID utilisateur invalide" });
  }
  try {
    const user = await authModel.getUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    if (user.role === "ADMIN") {
      return res
        .status(400)
        .json({ error: "L'utilisateur est déjà un administrateur" });
    } else if (user.role === "JURY") {
      const results = await adminModel.updateToAdmin(userId);
      res.json(results);
    } else {
      const results = await adminModel.promoteToAdmin(userId);
      res.json(results);
    }
  } catch (err: any) {
    console.error("Erreur promoteToAdmin:", err);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const promoteToJury = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "ID utilisateur invalide" });
  }
  try {
    const user = await authModel.getUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    if (user.role === "JURY") {
      return res.status(400).json({ error: "L'utilisateur est déjà un jury" });
    } else if (user.role === "ADMIN") {
      const results = await adminModel.updateToJury(userId);
      res.json(results);
    } else {
      const results = await adminModel.promoteToJury(userId);
      res.json(results);
    }
  } catch (err: any) {
    console.error("Erreur promoteToJury:", err);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const deleteUser = async (req: any, res: Response) => {
  const { id } = req.params;
  if (req.user && String(req.user.userId) === String(id)) {
    return res.status(400).json({ error: "Impossible de supprimer votre propre compte administrateur." });
  }
  try {
    const results = await adminModel.deleteUser(id);
    res.json(results);
  } catch (err) {
    console.error("Erreur deleteUser:", err);
    res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

export default {
  deleteEvent,
  getAllUsers,
  promoteToAdmin,
  promoteToJury,
  deleteUser,
};
