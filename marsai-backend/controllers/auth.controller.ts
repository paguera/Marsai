import { Request, Response } from "express";
import { body } from "express-validator";
import authService from "../services/auth.service";
import Users from "../models/auth.model";

export const UserLoginSchema = [
  body("email")
    .trim()
    .notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("Format d'email invalide")
    .isLength({ max: 255 }).withMessage("L'email est trop long"),
  body("password")
    .notEmpty().withMessage("Le mot de passe est requis"),
];

export const UserRegisterSchema = [
  body("email")
    .trim()
    .notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("Format d'email invalide")
    .isLength({ max: 255 }).withMessage("L'email est trop long"),
  body("password")
    .notEmpty().withMessage("Le mot de passe est requis")
    .isLength({ min: 8 }).withMessage("Le mot de passe doit faire au moins 8 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/).withMessage("Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial"),
  body("firstname")
    .trim()
    .isLength({ min: 2 }).withMessage("Prénom requis (2 caractères min)")
    .isLength({ max: 255 }).withMessage("Le prénom est trop long"),
  body("lastname")
    .trim()
    .isLength({ min: 2 }).withMessage("Nom requis (2 caractères min)")
    .isLength({ max: 255 }).withMessage("Le nom est trop long"),
];

const addUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.message === "ALREADY_EXISTS") {
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }
    console.error("Erreur addUser :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }
    console.error("Erreur loginUser :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getMe = async (req: any, res: Response) => {
  try {
    const user = await Users.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Erreur getMe :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

export default { addUser, loginUser, getMe };
