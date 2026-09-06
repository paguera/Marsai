import { Request, Response } from "express";
import { Movie, RatingData } from "../interfaces/movies.interfaces";
import movieModel from "../models/movies.model";
import { validationResult } from "express-validator";
import movieService from "../services/movie.service";

const addMovie = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const movieFile = files['movie']?.[0];
    const image1 = files['image1']?.[0];
    const image2 = files['image2']?.[0];
    const image3 = files['image3']?.[0];

    if (!movieFile || !image1 || !image2 || !image3) {
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
      duration: data.duration ? parseInt(data.duration) : 0,
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
    console.error("ERREUR ADD MOVIE :", error.message);
    return res.status(500).json({ error: "Server error: " + error.message });
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
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
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
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
  }
};

const getMoviesSum = async (req: Request, res: Response) => {
  try {
    const total = await movieModel.getMoviesSum();
    res.json({ total });
  } catch (error: any) {
    return res.status(500).json({
      error: "Erreur de base de données lors de la récupération du total.",
    });
  }
};

const getMovieDetails = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
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
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
  }
};

const getMovieCollaborators = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }
  try {
    const results = await movieModel.getMovieCollaborators(movieId);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR SQL DETAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
  }
};

const getMovieRatings = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }
  try {
    const results = await movieModel.getMovieRatings(movieId);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
  }
};

const getMovieTags = async (req: any, res: Response) => {
  const movieId = req.params.id ? parseInt(req.params.id, 10) : undefined;
  if (movieId === undefined || isNaN(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }
  try {
    const results = await movieModel.getMovieTags(movieId);
    res.status(200).json(results);
  } catch (error: any) {
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
  }
};

const getDirectorsSum = async (req: Request, res: Response) => {
  try {
    const total = await movieModel.getDirectorsSum();
    res.json({ total });
  } catch (error: any) {
    return res.status(500).json({
      error: "Erreur de base de données lors de la récupération du total.",
    });
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
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
  }
};

const changeMovieStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await movieModel.changeMovieStatus([status, id]);
    res.status(201).json({ message: "Status changé avec succes" });
  } catch (error: any) {
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res.status(500).json({ error: "Database error: " + error.message });
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
    console.error("Unexpected error : " + err.message);
    return res.status(500).send("Erreur inattendue : " + err.message);
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
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    console.error("ERREUR SQL DÉTAILLÉE :", error.message);
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res
      .status(500)
      .json({ error: "Erreur de base de données : " + error.message });
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
    return res.status(500).json({ error: "Erreur Serveur : " + err.message });
  }
};
const getAcceptedMoviesCount = async (req: Request, res: Response) => {
  try {
    const results = await movieModel.getAcceptedMoviesCount();
    res.status(200).json(results);
  } catch (err: any) {
    return res.status(500).json({ error: "Erreur Serveur : " + err.message });
  }
};
const getHybridCount = async (req: Request, res: Response) => {
  try {
    const results = await movieModel.getHybridCount();
    res.status(200).json(results);
  } catch (err: any) {
    return res.status(500).json({ error: "Erreur Serveur : " + err.message });
  }
};
const getFullAICount = async (req: Request, res: Response) => {
  try {
    const results = await movieModel.getFullAICount();
    res.status(200).json(results);
  } catch (err: any) {
    return res.status(500).json({ error: "Erreur Serveur : " + err.message });
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
    return res.status(500).json({ error: "Erreur serveur : " + err.message });
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
    return res.status(500).json({ error: "Erreur serveur : " + err.message });
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
    return res.status(500).json({ error: "Erreur serveur : " + err.message });
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
    return res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
}

async function getCountriesTotal(req: Request, res: Response) {
  try {
    const results = await movieModel.getTotalCountries();
    res.status(200).json(results);
  } catch(err: any) {
    return res.status(500).json({error: "Erreur serveur : " + err.message});
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
