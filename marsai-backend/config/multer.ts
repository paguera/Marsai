import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

/**
 * Configuration du stockage de fichiers avec Multer.
 * Définit la destination dynamique des fichiers ainsi que la génération de noms aléatoires sécurisés
 * pour éviter les collisions et toute tentative de Path Traversal.
 */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    let dest = path.join(process.cwd(), "uploads");

    if (file.fieldname === "movie") {
      dest = path.join(dest, "videos");
    } else if (file.fieldname.startsWith("image")) {
      dest = path.join(dest, "images");
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    callback(null, dest);
  },
  filename: (req, file, callback) => {
    // Génère un nom aléatoire sécurisé (16 bytes hex = 32 caractères)
    const randomName = crypto.randomBytes(16).toString("hex");
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomName}_${Date.now()}${extension}`);
  },
});

/**
 * Filtre de validation strict pour restreindre les types de fichiers acceptés.
 */
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) => {
  const allowedVideoExtensions = [".mp4", ".mov", ".avi", ".mkv"];
  const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const extension = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  if (file.fieldname === "movie") {
    if (
      allowedVideoExtensions.includes(extension) &&
      (mimetype.startsWith("video/") || mimetype === "application/octet-stream")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Format vidéo non supporté (MP4, MOV, AVI, MKV uniquement)"));
    }
  } else if (file.fieldname.startsWith("image")) {
    if (
      allowedImageExtensions.includes(extension) &&
      mimetype.startsWith("image/")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Format image non supporté (JPG, JPEG, PNG, WEBP uniquement)"));
    }
  } else {
    callback(new Error("Type de champ inattendu pour le fichier téléversé."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // Limite à 500 Mo par fichier
    files: 5, // Maximum 5 fichiers par requête multipart
  },
});

export default upload;
