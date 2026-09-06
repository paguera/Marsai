import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Movie, MovieTag } from "../../types-interfaces/Movie";
import { useTranslation } from "react-i18next";
import MovieRating from "./MovieRating";
import { getUploadUrl } from "../../utils/url";

interface JuryMovieCardProps {
  movie: Movie;
  showRating?: boolean;
}

const JuryMovieCard: React.FC<JuryMovieCardProps> = ({
  movie,
  showRating = true,
}) => {
  const { t } = useTranslation(["common", "Galery"]);
  const [tags, setTags] = useState<MovieTag[]>([]);
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/movies/${movie.id}/tags`);
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [movie.id, baseUrl]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full hover:border-primary/30 transition-all duration-300">
      {/* Top: Movie Info */}
      <div className="relative group">
        <Link to={`/movies/${movie.id}`} className="block">
          <div className="h-48 overflow-hidden">
            {movie.cover_image ? (
              <img
                src={getUploadUrl(movie.cover_image)}
                alt={movie.english_title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white/30 italic">
                {t("movies_thumbnails.image_placeholder")}
              </div>
            )}
          </div>
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                movie.status === "Accepted"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              }`}
            >
              {movie.status}
            </span>
          </div>
        </Link>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <Link to={`/movies/${movie.id}`}>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 hover:text-primary transition-colors flex justify-between items-center gap-2">
              <span>{movie.english_title}</span>
              {movie.average_rating !== undefined && movie.average_rating !== null && (
                <span className="text-sm font-bold text-yellow-400 flex items-center gap-1 whitespace-nowrap bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                  ⭐ {parseFloat(movie.average_rating.toString()).toFixed(1)}
                </span>
              )}
            </h3>
          </Link>
          <p className="text-white/60 text-xs line-clamp-2 mb-3">
            {movie.english_synopsis || t("movies_thumbnails.no_synopsis")}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          {showRating ? (
            <MovieRating movieId={parseInt(movie.id.toString())} />
          ) : (
            <Link
              to={`/movies/${movie.id}`}
              className="w-full inline-block text-center py-2 border border-primary/20 text-primary rounded-xl font-bold hover:bg-primary/20 transition-all"
            >
              Voir les détails
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JuryMovieCard;
