import movieModel from "../models/movies.model";
import { Movie } from "../interfaces/movies.interfaces";
import { db } from "../config/database";

class MovieService {
  /**
   * Crée un film complet avec son réalisateur, ses collaborateurs, ses images et ses tags associés.
   * Cette méthode s'exécute dans une transaction de base de données (ACID) afin de garantir
   * l'intégrité des données en cas d'erreur.
   */
  async createFullMovie(
    movieData: Movie,
    directorData: any,
    extraCollaboratorsJson: string,
    imagePaths: string[],
    tagsString: string
  ) {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      // 1. Enregistrement du film principal
      const movieResult: any = await movieModel.postMovie(movieData, conn);
      const movieId = movieResult.insertId;

      // 2. Enregistrement du réalisateur en tant que collaborateur principal
      await movieModel.addCollaborator({
        movie_id: movieId,
        ...directorData
      }, conn);

      // 3. Enregistrement des autres collaborateurs s'ils sont renseignés
      if (extraCollaboratorsJson) {
        try {
          const extraCollaborators = JSON.parse(extraCollaboratorsJson);
          if (Array.isArray(extraCollaborators)) {
            for (const collab of extraCollaborators) {
              await movieModel.addCollaborator({
                movie_id: movieId,
                gender: "Other",
                firstname: collab.firstname,
                lastname: collab.lastname,
                contribution: collab.job,
                email: "",
                birthdate: "2000-01-01",
                country: "Unknown",
                phone: ""
              }, conn);
            }
          }
        } catch (e) {
          console.error("Erreur de parsing des collaborateurs supplémentaires :", e);
        }
      }

      // 4. Enregistrement des images additionnelles
      for (const path of imagePaths) {
        await movieModel.addImage(movieId, path, conn);
      }

      // 5. Enregistrement et liaison des tags associés
      if (tagsString) {
        const tagNames = tagsString.split(",").map((t: string) => t.trim().toLowerCase());
        for (const tagName of tagNames) {
          if (!tagName) continue;
          let tag = await movieModel.getTagByName(tagName, conn);
          let tagId;
          if (!tag) {
            tagId = await movieModel.createTag(tagName, conn);
          } else {
            tagId = tag.id;
          }
          await movieModel.linkMovieTag(movieId, tagId, conn);
        }
      }

      // Validation de la transaction si toutes les étapes réussissent
      await conn.commit();
      return movieId;
    } catch (error) {
      // Annulation de toutes les insertions en cas d'erreur
      await conn.rollback();
      throw error;
    } finally {
      // Libération de la connexion vers le pool
      conn.release();
    }
  }
}

export default new MovieService();
