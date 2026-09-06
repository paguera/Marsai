import { Router, Request, Response, NextFunction } from "express";
import movieController from "../controllers/movies.controller";
import { validateSubmitMovieForm } from "../interfaces/movies.interfaces";
import upload from "../config/multer";
import { validate } from "../middlewares/validate";
import authenticateToken from "../middlewares/authenticateToken";
import authorizedRoles from "../middlewares/authorizedRoles";

const router = Router();

// --- Routes spécifiques et non paramétrées en premier ---
router.get("/count", movieController.getMoviesSum);
router.get("/accepted/count", movieController.getAcceptedMoviesCount);
router.get('/countries', movieController.getCountriesTotal);

// --- Validation et interfaçage des paramètres de route ---
/**
 * Intercepteur de paramètre Express pour "id".
 * Sécurise les routes en validant que l'identifiant fourni est strictement numérique.
 */
router.param(
  "id",
  (req: Request, res: Response, next: NextFunction, id: any) => {
    /**
     * Expression régulière pour valider un nombre entier positif :
     * ^   : Début de la chaîne.
     * \d+ : Un ou plusieurs caractères numériques (chiffres de 0 à 9).
     * $   : Fin de la chaîne.
     */
    if (/^\d+$/.test(id)) {
      next(); // L'ID est numérique, la requête continue son parcours dans les middlewares de la route courante.
    } else {
      /**
       * next("route") est un mécanisme Express spécifique qui permet de sortir du middleware
       * de la route courante pour passer directement au traitement des définitions de routes suivantes.
       * Cela évite que des routes textuelles (comme /count) ne soient capturées par le pattern paramétrique /:id.
       */
      next("route");
    }
  },
);

// --- Routes de liste de films ---
const listMoviesHandler = (req: any, res: Response) => {
  const { category, type, tag: tagQuery } = req.query;
  const tag = tagQuery ? parseInt(tagQuery as string) : null;
  const moviesPerPage = parseInt(req.query.limit as string) || 20;
  const currentPage = parseInt(req.query.page as string) || 1;

  // Protection pour les catégories sensibles
  if (category === "pending" || category === "rejected") {
     // Ces catégories nécessitent d'être ADMIN ou JURY (via le middleware injecté dans la route)
     // Si on arrive ici sans être authentifié, c'est que la route n'a pas été protégée
  }

  if (category === "pending") {
    if (tag !== null) {
      if (type === "hybrid") {
        movieController.getPendingHybridMoviesByTag(req, res, moviesPerPage, currentPage, tag);
      } else if (type === "fullAI") {
        movieController.getPendingFullAIMoviesByTag(req, res, moviesPerPage, currentPage, tag);
      } else {
        movieController.getPendingMoviesByTag(req, res, moviesPerPage, currentPage, tag);
      }
    } else {
      if (type === "hybrid") {
        movieController.getPendingHybridMovies(req, res, moviesPerPage, currentPage);
      } else if (type === "fullAI") {
        movieController.getPendingFullAIMovies(req, res, moviesPerPage, currentPage);
      } else {
        movieController.getPendingMovies(req, res, moviesPerPage, currentPage);
      }
    }
  } else if (category === "selection") {
    if (tag !== null) {
      if (type === "hybrid") {
        movieController.getSelectedHybridMoviesByTag(req, res, moviesPerPage, currentPage, tag);
      } else if (type === "fullAI") {
        movieController.getSelectedFullAIMoviesByTag(req, res, moviesPerPage, currentPage, tag);
      } else {
        movieController.getSelectedMoviesByTag(req, res, moviesPerPage, currentPage, tag);
      }
    } else {
      if (type === "hybrid") {
        movieController.getSelectedHybridMovies(req, res, moviesPerPage, currentPage);
      } else if (type === "fullAI") {
        movieController.getSelectedFullAIMovies(req, res, moviesPerPage, currentPage);
      } else {
        movieController.getSelectedMovies(req, res, moviesPerPage, currentPage);
      }
    }
  } else if (category === "rejected") {
    movieController.getRejectedMovies(req, res, moviesPerPage, currentPage);
  } else if (category === "best") {
    movieController.getBestMovies(req, res, moviesPerPage, currentPage);
  } else {
    if (tag !== null) {
      movieController.getAllMoviesByTag(req, res, moviesPerPage, currentPage, tag);
    } else {
      movieController.getAllMovies(req, res, moviesPerPage, currentPage);
    }
  }
};

// Séparation des routes de liste pour appliquer les protections
// 1. Routes publiques
router.get("/", (req, res, next) => {
  const { category } = req.query;
  if (!category || category === "selection" || category === "best") {
    return listMoviesHandler(req, res);
  }
  next(); // Passer aux routes protégées
});

// 2. Routes protégées (ADMIN/JURY)
router.get("/", authenticateToken, authorizedRoles(["ADMIN", "JURY"]), listMoviesHandler);

// --- Routes spécifiques aux films (par ID) ---
router.get("/:id", movieController.getMovieDetails);
router.get("/:id/ratings", authenticateToken, authorizedRoles(["ADMIN", "JURY"]), movieController.getMovieRatings);
router.get("/:id/tags", movieController.getMovieTags);
router.get("/:id/collaborators", movieController.getMovieCollaborators);

// Protection des notations : seul un JURY ou ADMIN peut noter un film (ou n'importe quel connecté si voulu)
router.post("/:id/ratings", authenticateToken, authorizedRoles(["ADMIN", "JURY"]), movieController.postMovieRating);

// --- Création de film (Publique) ---
router.post(
  "/",
  upload.fields([
    { name: "movie", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  validate(validateSubmitMovieForm),
  movieController.addMovie,
);

export default router;
