import { db } from "../config/database";

// Fonction pour récupérer tous les tags disponibles
const getAllTagsByCategory = async (category: string) => {
  let status = category;
  // Mapping frontend category names to DB status
  if (category === "selection" || category === "best") {
    status = "Accepted";
  } else if (category === "Accepted" || category === "Pending" || category === "Rejected") {
    status = category;
  }

  const query = `
      SELECT DISTINCT t.id, t.name AS tag_name
      FROM tag t
      JOIN movie_tag mt ON t.id = mt.tag_id
      JOIN movie m ON mt.movie_id = m.id
      WHERE m.status = ?`;
  const [rows] = await db.query(query, [status]);
  return rows;
};

// Fonction pour insérer un nouveau tag et l'associer à un film
const insertTag = async (tagname: string, movie_id: number) => {
  if (!tagname || !movie_id) {
    throw new Error("Invalid input");
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const insertTagQuery = `INSERT INTO tag (name) VALUES (?)`;
    const [tagResult]: any = await connection.query(insertTagQuery, [tagname]);
    const lastInsertedId = tagResult.insertId;

    const insertMovieTagQuery = `INSERT INTO movie_tag (movie_id, tag_id) VALUES (?, ?)`;
    const [movieTagResult] = await connection.query(insertMovieTagQuery, [
      movie_id,
      lastInsertedId,
    ]);

    await connection.commit();
    return movieTagResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  getAllTagsByCategory,
  insertTag,
};

