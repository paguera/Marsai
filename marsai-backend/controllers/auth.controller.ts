import { Request, Response } from "express";
import { body } from "express-validator";
import authService from "../services/auth.service";
import Users from "../models/auth.model";

export const UserLoginSchema = [
    body('email')
        .trim()
        .notEmpty().withMessage("L'email est requis")
        .isEmail().withMessage("Format d'email invalide")
        .isLength({ max: 255 }).withMessage("L'email est trop long"),
    body('password')
        .notEmpty().withMessage("Le mot de passe est requis"),
];

export const UserRegisterSchema = [
    body('email')
        .trim()
        .notEmpty().withMessage("L'email est requis")
        .isEmail().withMessage("Format d'email invalide")
        .isLength({ max: 255 }).withMessage("L'email est trop long"),
    body('password')
        .notEmpty().withMessage("Le mot de passe est requis")
        .isLength({ min: 6 }).withMessage("Le mot de passe doit faire au moins 6 caractères")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/).withMessage("Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial"),
    body('firstname')
        .trim()
        .isLength({ min: 2 }).withMessage("Prénom requis (2 caractères min)")
        .isLength({ max: 255 }).withMessage("Le prénom est trop long"),
    body('lastname')
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
    console.error("Erreur lors de la création de l'utilisateur :", error.message);
    return res.status(500).send("Erreur serveur");
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).send("Email ou mot de passe incorrect");
    }
    console.error("Erreur login:", error.message);
    return res.status(500).send("Erreur serveur");
  }
};

const getMe = async (req: any, res: Response) => {
  try {
    // Récupération de l'utilisateur en base de données via l'ID stocké dans le jeton JWT par le middleware
    const user = await Users.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Déstructuration d'objet avec l'opérateur de reste (rest operator) :
    // - 'password: _' extrait la clé 'password' de l'objet 'user' et la renomme en '_' (underscore).
    //   L'utilisation de l'underscore est une convention de nommage indiquant que cette variable est volontairement ignorée.
    // - '...userWithoutPassword' regroupe toutes les autres clés de l'objet 'user' (comme l'email, le rôle, etc.)
    //   dans un nouvel objet distinct nommé 'userWithoutPassword'.
    // Cette syntaxe permet d'exclure proprement le mot de passe avant de renvoyer les données utilisateur.
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Erreur getMe:", error.message);
    return res.status(500).send("Erreur serveur");
  }
};

export default { addUser, loginUser, getMe };
