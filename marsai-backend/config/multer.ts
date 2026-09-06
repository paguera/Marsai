import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Configuration du stockage de fichiers avec Multer.
 * Définit la destination dynamique des fichiers ainsi que la génération de noms uniques
 * pour éviter les collisions de fichiers sur le serveur.
 */
const storage = multer.diskStorage({
  // Détermination dynamique du dossier de destination en fonction du type de fichier
  destination: (req, file, callback) => {
    let dest = "uploads/";
    
    // Les vidéos sont stockées dans uploads/videos/, les images dans uploads/images/
    if (file.fieldname === "movie") {
      dest += "videos/";
    } else if (file.fieldname.startsWith("image")) {
      dest += "images/";
    }

    // Création récursive du dossier si celui-ci n'existe pas encore
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    callback(null, dest);
  },
  // Génération d'un nom de fichier unique basé sur le nom d'origine et un horodatage
  filename: (req, file, callback) => {
    // Remplacement des espaces par des underscores dans le nom d'origine
    const name = file.originalname.split(" ").join("_").split(".")[0];
    const extension = path.extname(file.originalname);
    
    // Combinaison : NomNettoyé_Timestamp.extension (garantit l'unicité du fichier)
    callback(null, name + "_" + Date.now() + extension);
  },
});

/**
 * Filtre de validation pour restreindre les types de fichiers acceptés.
 * Sécurise le serveur en interdisant le téléversement de scripts malveillants ou de formats invalides.
 */
const fileFilter = (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedVideoExtensions = [".mp4", ".mov", ".avi", ".mkv"];
  const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  
  const extension = path.extname(file.originalname).toLowerCase();

  // Validation basée sur le champ d'envoi du formulaire (fieldname)
  if (file.fieldname === "movie") {
    if (allowedVideoExtensions.includes(extension)) {
      callback(null, true); // Fichier accepté
    } else {
      callback(new Error("Format vidéo non supporté (MP4, MOV, AVI, MKV uniquement)"));
    }
  } else if (file.fieldname.startsWith("image")) {
    if (allowedImageExtensions.includes(extension)) {
      callback(null, true); // Fichier accepté
    } else {
      callback(new Error("Format image non supporté (JPG, JPEG, PNG, WEBP uniquement)"));
    }
  } else {
    callback(null, true);
  }
};

/**
 * Initialisation du middleware de téléchargement Multer.
 * Configure le stockage, le filtre de validation, et définit une taille de fichier maximale.
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // Limite stricte à 500 Mo par fichier
  }
});

export default upload;
