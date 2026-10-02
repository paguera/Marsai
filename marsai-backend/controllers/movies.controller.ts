import { Request, Response } from "express";
import { Movie, RatingData } from "../interfaces/movies.interfaces";
import movieModel from "../models/movies.model";
import { validationResult } from "express-validator";
import movieService from "../services/movie.service";
import fs from "fs";

/**
 * Nettoie les fichiers téléversés en cas d'erreur ou d'annulation (Rollback Uploads).
 */
const cleanupFiles = (files?: { [fieldname: string]: Express.Multer.File[] }) => {
  if (!files) return;
  Object.values(files).forEach((fileArray) => {
    fileArray.forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Erreur lors de la suppression du fichier temporaire :", file.path, err);
        });
      }
    });
  });
};

const addMovie = async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    cleanupFiles(files);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const movieFile = files?.["movie"]?.[0];
    const image1 = files?.["image1"]?.[0];
    const image2 = files?.["image2"]?.[0];
    const image3 = files?.["image3"]?.[0];

    if (!movieFile || !image1 || !image2 || !image3) {
      cleanupFiles(files);
      return res.status(400).json({ error: "Tous les fichiers (vidéo + 3 images) sont requis." });
    }
    const data = req.body;

    // Vérification de sécurité pour éviter la double soumission
    const isDuplicate = await movieModel.checkDuplicateMovie(
      data.english_title,
      data.original_title,
      data.director_email
    );
    if (isDuplicate) {
      cleanupFiles(files);
      return res.status(409).json({ error: "Ce film a déjà été soumis par ce réalisateur." });
    }
    const videoUrl = "/uploads/videos/" + movieFile.filename;
    const imageUrl1 = "/uploads/images/" + image1.filename;
    const imageUrl2 = "/uploads/images/" + image2.filename;
    const imageUrl3 = "/uploads/images/" + image3.filename;

    const newMovie: Movie = {
      original_title: data.original_title,
      english_title: data.english_title,
      movie_path: videoUrl,
      cover_image: imageUrl1,
      duration: data.duration ? parseInt(data.duration, 10) : 0,
      is_hybrid: data.is_hybrid,
      original_synopsis: data.original_synopsis,
      english_synopsis: data.english_synopsis,
      creative_process: data.creative_process || "",
      ia_tools: data.ia_tools,
      has_subs: data.hasSubs === "true",
      status: "Pending"
    };

    const directorData = {
      gender: data.director_gender,
      firstname: data.director_firstname,
      lastname: data.director_lastname,
      email: data.director_email,
      birthdate: data.director_birthdate,
      contribution: data.director_job,
      country: data.director_country,
      city: data.director_city,
      phone: data.director_phone
    };

    const movieId = await movieService.createFullMovie(
      newMovie, 
      directorData, 
      data.collaborators, 
      [imageUrl2, imageUrl3], 
      data.tags
    );

    res.status(201).json({ message: "Film et données associés ajoutés avec succès", id: movieId });
  } catch (error: any) {
    cleanupFiles(files);
    console.error("ERREUR ADD MOVIE :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue lors de l'enregistrement du film." });
  }
};

const getAllMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getAllMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getAllMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getBestMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getBestMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getBestMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getMoviesSum = async (req: Request, res: Response) => {
  try {
    const total = await movieModel.getMoviesSum();
    res.json({ total });
  } catch (error: any) {
    console.error("ERREUR getMoviesSum :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getMovieDetails = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "ID de film invalide" });
  }
  try {
    const movie: any = await movieModel.getMovieDetails(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }
    
    // Fetch associated images
    const images = await movieModel.getMovieImages(movieId);
    movie.images = images;
    
    res.status(200).json(movie);
  } catch (error: any) {
    console.error("ERREUR getMovieDetails :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getMovieCollaborators = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "ID de film invalide" });
  }
  try {
    // Protection RGPD : les détails complets (email, tel, birthdate) ne sont exposés qu'aux administrateurs
    const isAdmin = req.user && req.user.role === "ADMIN";
    const results = isAdmin
      ? await movieModel.getMovieCollaboratorsFull(movieId)
      : await movieModel.getMovieCollaborators(movieId);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getMovieCollaborators :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getMovieRatings = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "ID de film invalide" });
  }
  try {
    const results = await movieModel.getMovieRatings(movieId);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getMovieRatings :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getMovieTags = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "ID de film invalide" });
  }
  try {
    const results = await movieModel.getMovieTags(movieId);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getMovieTags :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getDirectorsSum = async (req: Request, res: Response) => {
  try {
    const total = await movieModel.getDirectorsSum();
    res.json({ total });
  } catch (error: any) {
    console.error("ERREUR getDirectorsSum :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const postMovieRating = async (req: any, res: Response) => {
  const { note, comment, movie_id, user_id } = req.body;

  try {
    // Vérifier si le jury a déjà voté pour ce film
    const existingRating = await movieModel.getUserRatingForMovie(user_id, movie_id);
    if (existingRating) {
      return res.status(409).json({ error: "Vous avez déjà évalué ce film." });
    }

    const ratingData: RatingData = {
      note: note,
      comment: comment,
      user_id: user_id,
      movie_id: movie_id,
    };

    const results: any = await movieModel.postMovieRating(ratingData);
    res
      .status(201)
      .json({ message: "Note ajoutée avec succès", id: results.insertId });
  } catch (error: any) {
    console.error("ERREUR postMovieRating :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const changeMovieStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await movieModel.changeMovieStatus([status, id]);
    res.status(201).json({ message: "Status changé avec succes" });
  } catch (error: any) {
    console.error("ERREUR changeMovieStatus :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getAllMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getAllMoviesByTag(tag, limit, offset);
    return res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getAllMoviesByTag :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getSelectedMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getSelectedMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getSelectedMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getSelectedMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getSelectedMoviesByTag(tag, limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getSelectedMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getPendingMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getPendingMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getPendingMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getPendingMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getPendingMoviesByTag(tag, limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getPendingMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getPendingHybridMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getPendingHybridMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getPendingHybridMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getPendingFullAIMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getPendingFullAIMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getPendingFullAIMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getPendingHybridMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getPendingHybridMoviesByTag(
      tag,
      limit,
      offset,
    );
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getPendingHybridMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getPendingFullAIMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getPendingFullAIMoviesByTag(
      tag,
      limit,
      offset,
    );
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getPendingFullAIMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getSelectedHybridMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getSelectedHybridMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getSelectedHybridMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getSelectedFullAIMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getSelectedFullAIMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getSelectedFullAIMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getSelectedHybridMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getSelectedHybridMoviesByTag(
      tag,
      limit,
      offset,
    );
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getSelectedHybridMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getSelectedFullAIMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getSelectedFullAIMoviesByTag(
      tag,
      limit,
      offset,
    );
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getSelectedFullAIMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getRejectedHybridMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getRejectedHybridMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getRejectedHybridMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getRejectedFullAIMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getRejectedFullAIMovies(limit, offset);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getRejectedFullAIMovies :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getRejectedHybridMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getRejectedHybridMoviesByTag(
      tag,
      limit,
      offset,
    );
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getRejectedHybridMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getRejectedFullAIMoviesByTag = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getRejectedFullAIMoviesByTag(
      tag,
      limit,
      offset,
    );
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR getRejectedFullAIMoviesByTag :", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getRejectedMovies = async (
  req: Request,
  res: Response,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getRejectedMovies(limit, offset);
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getRejectedMovies :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getAcceptedMoviesCount = async (req: Request, res: Response) => {
  try {
    const results = await movieModel.getAcceptedMoviesCount();
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getAcceptedMoviesCount :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getHybridCount = async (req: Request, res: Response) => {
  try {
    const results = await movieModel.getHybridCount();
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getHybridCount :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

const getFullAICount = async (req: Request, res: Response) => {
  try {
    const results = await movieModel.getFullAICount();
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getFullAICount :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};

async function getHybridMovies(
  req: Request,
  res: Response,
  limit: number,
  page: number,
) {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getHybrid(limit, offset);
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getHybridMovies :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

async function getHybridMoviesByTag(
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getHybridByTag(limit, offset, tag);
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getHybridMoviesByTag :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

async function getFullAIMovies(
  req: Request,
  res: Response,
  limit: number,
  page: number,
) {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getFullAI(limit, offset);
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getFullAIMovies :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

async function getFullAIMoviesByTag(
  req: Request,
  res: Response,
  limit: number,
  page: number,
  tag: number,
) {
  const offset = (page - 1) * limit;
  try {
    const results = await movieModel.getFullAIByTag(limit, offset, tag);
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getFullAIMoviesByTag :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

async function getCountriesTotal(req: Request, res: Response) {
  try {
    const results = await movieModel.getTotalCountries();
    res.status(200).json(results);
  } catch (err: any) {
    console.error("ERREUR getCountriesTotal :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

export default {
  addMovie,
  getAllMovies,
  getAllMoviesByTag,
  getBestMovies,
  getSelectedMovies,
  getSelectedMoviesByTag,
  getSelectedHybridMovies,
  getSelectedFullAIMovies,
  getSelectedHybridMoviesByTag,
  getSelectedFullAIMoviesByTag,
  getPendingMovies,
  getPendingHybridMovies,
  getPendingFullAIMovies,
  getPendingHybridMoviesByTag,
  getPendingFullAIMoviesByTag,
  getPendingMoviesByTag,
  getRejectedMovies,
  getRejectedHybridMovies,
  getRejectedFullAIMovies,
  getRejectedHybridMoviesByTag,
  getRejectedFullAIMoviesByTag,
  getAcceptedMoviesCount,
  getHybridMovies,
  getHybridMoviesByTag,
  getHybridCount,
  getFullAIMovies,
  getFullAIMoviesByTag,
  getFullAICount,
  getMoviesSum,
  getMovieDetails,
  getMovieRatings,
  getMovieTags,
  getMovieCollaborators,
  getDirectorsSum,
  getCountriesTotal,
  postMovieRating,
  changeMovieStatus,
};
