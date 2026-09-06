// interfaces/movies.interfaces.ts
import { body, ValidationChain } from 'express-validator';

export interface Movie {
  original_title: string;
  english_title: string;
  movie_path: string;
  cover_image: string;
  duration: number;
  is_hybrid: boolean;
  original_synopsis: string;
  english_synopsis: string;
  creative_process: string;
  ia_tools: string;
  has_subs?: boolean;
  status?: "Pending" | "Cancelled" | "Accepted";
}

// Définition des règles de validation pour express-validator
export const validateSubmitMovieForm: ValidationChain[] = [
  // PAGE 1
  body('director_gender').trim().notEmpty().withMessage("Le genre est requis"),
  body('director_firstname').trim().isLength({ min: 2 }).withMessage("Le prénom est requis"),
  body('director_lastname').trim().isLength({ min: 2 }).withMessage("Le nom est requis"),
  body('director_email').trim().isEmail().withMessage("Format d'email invalide"),
  body('director_birthdate').trim().notEmpty().withMessage("La date de naissance est requise"),
  body('director_job').trim().isLength({ min: 2 }).withMessage("Le métier est requis"),
  body('director_country').trim().notEmpty().withMessage("Le pays est requis"),
  body('director_city').trim().notEmpty().withMessage("La ville est requise"),
  body('director_phone').trim().matches(/^\+?[0-9]{10,15}$/).withMessage("Téléphone invalide"),
  
  // PAGE 2
  body('original_title').trim().notEmpty().withMessage("Le titre original est requis"),
  body('english_title').trim().notEmpty().withMessage("Le titre anglais est requis"),
  body('original_synopsis').trim().isLength({ min: 10 }).withMessage("Le synopsis est trop court"),
  body('english_synopsis').trim().isLength({ min: 10 }).withMessage("Le synopsis anglais est trop court"),
  body('ia_tools').trim().notEmpty().withMessage("Veuillez préciser les outils IA utilisés"),
  body('tags').trim().notEmpty().withMessage("Au moins un tag est requis"),
  
  // Validation personnalisée pour les fichiers (Multer)
  body('movie').custom((value, { req }) => {
    if (!req.files || !req.files['movie']) {
      throw new Error("Le fichier vidéo est obligatoire");
    }
    return true;
  }),
  body('image1').custom((value, { req }) => {
    if (!req.files || !req.files['image1']) {
      throw new Error("L'image de couverture est obligatoire");
    }
    return true;
  }),
  body('image2').custom((value, { req }) => {
    if (!req.files || !req.files['image2']) {
      throw new Error("La deuxième image est obligatoire");
    }
    return true;
  }),
  body('image3').custom((value, { req }) => {
    if (!req.files || !req.files['image3']) {
      throw new Error("La troisième image est obligatoire");
    }
    return true;
  }),

  // PAGE 3
  body('numberCollaborators').optional().isNumeric().withMessage("Le nombre de collaborateurs doit être un nombre"),
];

export interface RatingData {
  note: number;
  comment?: string;
  user_id: number;
  movie_id: number;
}
