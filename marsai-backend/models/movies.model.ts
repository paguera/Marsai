import { db } from "../config/database";
import { Tag } from "../interfaces/tag.interface";
import * as moviesInterfaces from "../interfaces/movies.interfaces";
import { Collaborator } from "../interfaces/collaborator.interface";

const postMovie = async (data: moviesInterfaces.Movie, conn?: any) => {
  const query = "INSERT INTO movie SET ?";
  const [result]: any = await (conn || db).query(query, [data]);
  return result;
};

const addCollaborator = async (collaboratorData: any, conn?: any) => {
  const query = "INSERT INTO collaborator SET ?";
  const [result] = await (conn || db).query(query, [collaboratorData]);
  return result;
};

const addImage = async (movie_id: number, path: string, conn?: any) => {
  const query = "INSERT INTO image (movie_id, path) VALUES (?, ?)";
  const [result] = await (conn || db).query(query, [movie_id, path]);
  return result;
};

const getTagByName = async (name: string, conn?: any) => {
  const query = "SELECT id FROM tag WHERE name = ?";
  const [rows]: any = await (conn || db).query(query, [name]);
  return rows[0];
};

const createTag = async (name: string, conn?: any) => {
  const query = "INSERT INTO tag (name) VALUES (?)";
  const [result]: any = await (conn || db).query(query, [name]);
  return result.insertId;
};

const linkMovieTag = async (movie_id: number, tag_id: number, conn?: any) => {
  const query = "INSERT IGNORE INTO movie_tag (movie_id, tag_id) VALUES (?, ?)";
  const [result] = await (conn || db).query(query, [movie_id, tag_id]);
  return result;
};

const getAllMovies = async (limit: number, offset: number) => {
  const query = "SELECT * FROM movie LIMIT ? OFFSET ?";
  const [rows] = await db.query(query, [limit, offset]);
  return rows;
};

const getBestMovies = async (limit: number, offset: number) => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    JOIN rating AS r ON m.id = r.movie_id
    GROUP BY m.id
    ORDER BY average_rating DESC
    LIMIT ? OFFSET ?`;
  const [rows] = await db.query(query, [limit, offset]);
  return rows;
};

const getSelectedMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE m.status = 'Accepted'
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getSelectedMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    JOIN movie_tag AS mt ON mt.movie_id = m.id
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE mt.tag_id = ? AND m.status = 'Accepted'
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getPendingMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE m.status = 'Pending'
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getPendingMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    JOIN movie_tag ON movie_tag.movie_id = m.id
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE movie_tag.tag_id = ? AND m.status = 'Pending'
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getPendingHybridMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE m.status = 'Pending' AND is_hybrid = true
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getPendingFullAIMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE m.status = 'Pending' AND is_hybrid = false
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getPendingHybridMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    JOIN movie_tag ON movie_tag.movie_id = m.id
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE movie_tag.tag_id = ? AND m.status = 'Pending' AND is_hybrid = true
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getPendingFullAIMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    JOIN movie_tag ON movie_tag.movie_id = m.id
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE movie_tag.tag_id = ? AND m.status = 'Pending' AND is_hybrid = false
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getSelectedHybridMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE m.status = 'Accepted' AND is_hybrid = true
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getSelectedFullAIMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE m.status = 'Accepted' AND is_hybrid = false
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getSelectedHybridMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    JOIN movie_tag ON movie_tag.movie_id = m.id
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE movie_tag.tag_id = ? AND m.status = 'Accepted' AND is_hybrid = true
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getSelectedFullAIMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie AS m
    JOIN movie_tag ON movie_tag.movie_id = m.id
    LEFT JOIN rating AS r ON m.id = r.movie_id
    WHERE movie_tag.tag_id = ? AND m.status = 'Accepted' AND is_hybrid = false
    GROUP BY m.id
    LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getRejectedHybridMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT m.* FROM movie AS m WHERE m.status = 'Rejected' AND is_hybrid = true LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getRejectedFullAIMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT m.* FROM movie AS m WHERE m.status = 'Rejected' AND is_hybrid = false LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getRejectedHybridMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT m.* FROM movie AS m JOIN movie_tag ON movie_tag.movie_id = m.id WHERE movie_tag.tag_id = ? AND m.status = 'Rejected' AND is_hybrid = true LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getRejectedFullAIMoviesByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT m.* FROM movie AS m JOIN movie_tag ON movie_tag.movie_id = m.id WHERE movie_tag.tag_id = ? AND m.status = 'Rejected' AND is_hybrid = false LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getMoviesSum = async () => {
  const query = "SELECT COUNT(*) as total FROM movie";
  const [rows]: any = await db.query(query);
  return rows[0].total;
};

const getMovieDetails = async (movieId: number | undefined) => {
  const query = `
    SELECT m.*, AVG(r.note) AS average_rating
    FROM movie m
    LEFT JOIN rating r ON m.id = r.movie_id
    WHERE m.id = ?
    GROUP BY m.id
  `;
  const [rows]: any = await db.query(query, [movieId]);
  return rows[0];
};

const getMovieCollaborators = async (movieId: number | undefined) => {
  const query = "SELECT * FROM collaborator WHERE movie_id = ?";
  const [rows] = await db.query(query, [movieId]);
  return rows;
};

const getMovieRatings = async (movieId: number) => {
  const query = "SELECT * FROM rating WHERE movie_id = ?";
  const [rows] = await db.query(query, [movieId]);
  return rows;
};

const getUserRatingForMovie = async (userId: number, movieId: number) => {
  const query = "SELECT * FROM rating WHERE user_id = ? AND movie_id = ?";
  const [rows]: any = await db.query(query, [userId, movieId]);
  return rows[0];
};

const checkDuplicateMovie = async (englishTitle: string, originalTitle: string, directorEmail: string) => {
  const query = `
    SELECT m.id
    FROM movie m
    JOIN collaborator c ON c.movie_id = m.id
    WHERE m.english_title = ? AND m.original_title = ? AND c.email = ?
  `;
  const [rows]: any = await db.query(query, [englishTitle, originalTitle, directorEmail]);
  return rows.length > 0;
};

const getMovieImages = async (movieId: number) => {
  const query = "SELECT * FROM image WHERE movie_id = ?";
  const [rows] = await db.query(query, [movieId]);
  return rows;
};

const postMovieRating = async (ratingData: moviesInterfaces.RatingData) => {
  const sql = "INSERT INTO rating SET ?";
  const [result] = await db.query(sql, [ratingData]);
  return result;
};

const getMovieTags = async (movieId: number) => {
  const query = `
    SELECT t.name
    FROM movie_tag mt
    JOIN tag t ON mt.tag_id = t.id
    WHERE mt.movie_id = ?
  `;
  const [rows] = await db.query(query, [movieId]);
  return rows;
};

const getDirectorsSum = async () => {
  const query = "SELECT COUNT(*) as total FROM collaborator";
  const [rows]: any = await db.query(query);
  return rows[0].total;
};

const changeMovieStatus = async ([status, id]: any) => {
  const query = "UPDATE movie SET status = ? WHERE id = ?";
  const [result] = await db.query(query, [status, id]);
  return result;
};

async function getAllMoviesByTag(tag: number, limit: number, offset: number) {
  const query =
    "SELECT movie.* FROM movie JOIN movie_tag ON movie_tag.movie_id = movie.id WHERE movie_tag.tag_id = ? LIMIT ? OFFSET ?";
  const [rows] = await db.query(query, [tag, limit, offset]);
  return rows;
}

async function getAllMoviesByLimit(limit: number, offset: number) {
  const query = "SELECT movie.* FROM movie LIMIT ? OFFSET ?";
  const [rows] = await db.query(query, [limit, offset]);
  return rows;
}

const getRejectedMovies = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT m.* FROM movie AS m WHERE m.status = 'Rejected' LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getAcceptedMoviesCount = async (): Promise<{ total: number }[]> => {
  const query = `SELECT COUNT(*) as total FROM movie WHERE movie.status = 'Accepted'`;
  const [rows]: any = await db.query(query);
  return rows;
};

const getHybridCount = async (): Promise<{ total: number }[]> => {
  const query = `SELECT COUNT(*) as total FROM movie WHERE movie.is_hybrid = true`;
  const [rows]: any = await db.query(query);
  return rows;
};

const getFullAICount = async (): Promise<{ total: number }[]> => {
  const query = `SELECT COUNT(*) as total FROM movie WHERE movie.is_hybrid = false`;
  const [rows]: any = await db.query(query);
  return rows;
};

const getHybrid = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT * FROM movie WHERE is_hybrid = true LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getHybridByTag = async (
  limit: number,
  offset: number,
  tag: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT * FROM movie JOIN movie_tag ON movie_tag.movie_id = movie.id WHERE movie_tag.tag_id = ? AND is_hybrid = true LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};

const getFullAI = async (
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT * FROM movie WHERE is_hybrid = false LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [limit, offset]);
  return rows;
};

const getFullAIByTag = async (
  tag: number,
  limit: number,
  offset: number,
): Promise<moviesInterfaces.Movie[]> => {
  const query = `SELECT * FROM movie JOIN movie_tag ON movie_tag.movie_id = movie.id WHERE movie_tag.tag_id = ? AND is_hybrid = false LIMIT ? OFFSET ?`;
  const [rows]: any = await db.query(query, [tag, limit, offset]);
  return rows;
};
const getTotalCountries = async (): Promise<number> => {
  const query = `SELECT COUNT(DISTINCT country) AS countries FROM collaborator`;
  const [rows]: any = await db.query(query);
  return rows[0].countries;
};


export default {
  postMovie,
  addCollaborator,
  addImage,
  getTagByName,
  createTag,
  linkMovieTag,
  getAllMovies,
  getAllMoviesByTag,
  getAllMoviesByLimit,
  getMovieTags,
  getBestMovies,
  getSelectedMovies,
  getSelectedMoviesByTag,
  getSelectedHybridMovies,
  getSelectedFullAIMovies,
  getSelectedHybridMoviesByTag,
  getSelectedFullAIMoviesByTag,
  getPendingMovies,
  getPendingMoviesByTag,
  getPendingHybridMovies,
  getPendingFullAIMovies,
  getPendingHybridMoviesByTag,
  getPendingFullAIMoviesByTag,
  getRejectedMovies,
  getAcceptedMoviesCount,
  getRejectedHybridMovies,
  getRejectedFullAIMovies,
  getRejectedHybridMoviesByTag,
  getRejectedFullAIMoviesByTag,
  getHybrid,
  getHybridByTag,
  getFullAI,
  getFullAIByTag,
  getHybridCount,
  getFullAICount,
  getMoviesSum,
  getMovieDetails,
  getMovieImages,
  getMovieRatings,
  getUserRatingForMovie,
  checkDuplicateMovie,
  getMovieCollaborators,
  getDirectorsSum,
  postMovieRating,
  getTotalCountries,
  changeMovieStatus,
};
