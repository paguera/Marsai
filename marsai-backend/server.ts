import "dotenv/config"; // Charger les variables d'environnement
import { connect } from "./config/database"; // Importer la fonction de connexion à la base de données
import express, { Request, Response, Application } from "express"; // Importer Express
import path from "path"; // Pour gérer les chemins de fichiers
import cors, { CorsOptions } from "cors"; // Pour gérer les requêtes CORS

// Importer les routes
import movieRoutes from "./routes/movies.routes";
import eventsRoutes from "./routes/events.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import juryRoutes from "./routes/jury.routes";
import subscribersRoutes from "./routes/subscribers.routes";
import newsletterRoutes from "./routes/newsletters.routes";
import tagsRoutes from "./routes/tags.routes";

import helmet from "helmet";
import { globalLimiter } from "./middlewares/rateLimiter";

// Initialiser l'application Express
const app: Application = express();

// Masquer la signature d'Express
app.disable("x-powered-by");

// En-têtes de sécurité HTTP (Protection XSS, Clickjacking, MIME sniffing, HSTS)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Limiteur de requêtes global anti-DoS
app.use(globalLimiter);

// Middleware : Parser les requêtes JSON (limité à 10mb pour éviter les payload DoS)
app.use(express.json({ limit: "10mb" }));

// Configuration CORS
const isProduction = process.env.NODE_ENV === "production";
const whitelist: string[] = [
  process.env.FRONT_URL,
  "https://marsai.paguera.fr",
  "http://100.80.76.84:8080",
  "http://nas:8080",
].filter(Boolean) as string[];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (Postman, scripts locaux sécurisés)
    if (!origin) return callback(null, true);

    // Vérifier si l'origine est dans la liste blanche
    if (whitelist.includes(origin)) return callback(null, true);

    // Autoriser les adresses IP locales uniquement hors production
    if (!isProduction) {
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1") ||
        origin.startsWith("http://0.0.0.0") ||
        origin.startsWith("http://192.168.")
      ) {
        return callback(null, true);
      }
    }

    // Bloquer les autres origines
    callback(null, false);
  },
  credentials: true, // Autoriser les cookies et les en-têtes d'authentification
};

// Appliquer le middleware CORS
app.use(cors(corsOptions));

// Définir les routes
app.use("/events", eventsRoutes);
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/jury", juryRoutes);
app.use("/newsletter", subscribersRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/images", express.static(path.join(__dirname, "uploads/images")));
app.use("/uploads/videos", express.static(path.join(__dirname, "uploads/videos")));
app.use("/subscribers", subscribersRoutes);
app.use("/newsletters", newsletterRoutes);
app.use("/tags", tagsRoutes);

// Middleware de gestion d'erreur centralisé (Empêche toute fuite d'informations sensibles)
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error("Erreur non gérée capturée par Express :", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: isProduction
      ? "Une erreur interne est survenue."
      : err.message || "Erreur serveur.",
  });
});

// Fonction principale pour démarrer le serveur
async function startServer() {
  try {
    // Étape 1 : Connexion à la base de données
    await connect(); // Attendre que la connexion soit réussie
    console.log("Connexion à la base de données réussie");

    // Étape 2 : Démarrer le serveur
    const PORT = process.env.PORT || 3000; // Utiliser le port de l'environnement ou 3000 par défaut
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error: any) {
    // Étape 3 : Gérer les erreurs de connexion
    console.error(
      "Échec de la connexion à la base de données:",
      error.message,
    );
    process.exit(1); // Arrêter le processus en cas d'erreur
  }
}

// Lancer le serveur
startServer();
