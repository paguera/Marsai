import { Request, Response } from "express";
import adminModel from "../models/admin.model";
import authModel from "../models/auth.model";

const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const results = await adminModel.deleteEvent(id);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const results = await adminModel.getAllUsers();
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const results = await adminModel.deleteUser(id);
    res.json(results);
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

export default {
  deleteEvent,
  getAllUsers,
  promoteToAdmin,
  promoteToJury,
  deleteUser,
};
