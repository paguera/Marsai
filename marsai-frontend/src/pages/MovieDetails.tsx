import { useTranslation } from "react-i18next";
import type {
  Movie,
  MovieCollaborator,
  MovieTag,
  MovieRating,
} from "../types-interfaces/Movie";
import { useEffect, useState, type ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { getUploadUrl } from "../utils/url";

function MovieDetails(): ReactElement | null {
  const { id } = useParams();
  const navigate = useNavigate();

  const { t } = useTranslation(["Galery", "common"]);
  const { user, token } = useAuth();

  const [movieDetails, setMovieDetails] = useState<Movie | any>(null);
  const [movieCollaborators, setMovieCollaborators] = useState<
    MovieCollaborator[]
  >([]);
  const [movieTags, setMovieTags] = useState<MovieTag[]>([]);
  const [movieRatings, setMovieRatings] = useState<MovieRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_API_URL;

        // 1. Fetch Main Details (including images)
        const detailsRes = await fetch(`${baseUrl}/movies/${id}`);
        if (!detailsRes.ok) throw new Error("Not found !");
        const detailsData = await detailsRes.json();

        // 2. Fetch Collaborators
        const collabRes = await fetch(`${baseUrl}/movies/${id}/collaborators`);
        const collaboratorsData = await collabRes.json();

        // 3. Fetch Tags
        const tagsRes = await fetch(`${baseUrl}/movies/${id}/tags`);
        const tagsData = await tagsRes.json();

        // 4. Fetch Ratings (staff only)
        let ratingsData = [];
        if (token && user && (user.role === "ADMIN" || user.role === "JURY")) {
          const ratingsRes = await fetch(`${baseUrl}/movies/${id}/ratings`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (ratingsRes.ok) ratingsData = await ratingsRes.json();
        }

        setMovieDetails(
          Array.isArray(detailsData) ? detailsData[0] : detailsData,
        );
        setMovieCollaborators(collaboratorsData || []);
        setMovieTags(tagsData || []);
        setMovieRatings(ratingsData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [id, token, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-dark gap-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/60 animate-pulse">
          {t("loading.generic", { ns: "common" })}
        </p>
      </div>
    );
  }

  if (error || !movieDetails) {
    navigate("/not-found");
  }

  return (
    <div className="min-h-100vh w-full h-full relative">
      {/* Navigation Top Bar */}
      <div className="max-w-7xl mx-auto my-25">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-brand transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          <span className="font-bold uppercase tracking-widest text-sm text-white">
            {t("previous", { ns: "Galery" })}
          </span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto glass-panel-dark p-8 md:p-12">
        {/* Hero Header */}
        <div className="relative w-full overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black bg-linear-to-r from-brand to-secondary bg-clip-text text-transparent uppercase tracking-tighter">
                  {movieDetails.english_title}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <p className="text-xl text-white/40 italic font-medium">
                    {movieDetails.original_title}
                  </p>
                  {movieDetails.average_rating !== undefined && movieDetails.average_rating !== null && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-sm font-bold text-yellow-400 flex items-center gap-1.5 backdrop-blur-md">
                      <span>⭐</span>
                      <span>{parseFloat(movieDetails.average_rating).toFixed(1)} / 10</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {movieTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium hover:border-brand transition-colors"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
                {movieDetails.english_synopsis}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section aria-label="Lecteur vidéo">
              <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                {movieDetails.movie_path ? (
                  <video
                    src={getUploadUrl(movieDetails.movie_path)}
                    controls
                    className="w-full h-full"
                    preload="none"
                    poster={getUploadUrl(movieDetails.cover_image)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20">
                    <span className="text-6xl">🎬</span>
                    <p>{t("movie_details.no_image", { ns: "Galery" })}</p>
                  </div>
                )}
              </div>
            </section>

            <section aria-label="Galerie d'images">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-brand">🖼️</span>
                {t("movie_details.gallery", { ns: "Galery" })}
              </h2>

              {movieDetails.images && movieDetails.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {movieDetails.images.map((img: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img.path)}
                      className="relative aspect-video rounded-2xl overflow-hidden group border border-white/10 hover:border-brand/50 transition-all duration-300"
                    >
                      <img
                        src={getUploadUrl(img.path)}
                        alt={`${movieDetails.english_title} - Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-bold uppercase tracking-widest text-sm">
                          Voir en grand
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center">
                  <span className="text-4xl mb-4 block">📷</span>
                  <p className="text-white/60 italic">
                    {t("movie_details.no_images", { ns: "Galery" })}
                  </p>
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-brand font-bold uppercase text-xs tracking-widest mb-4">
                  {t("movie_details.original_synopsis", { ns: "Galery" })}
                </h3>
                <p className="text-sm text-white/70 italic leading-relaxed">
                  {movieDetails.original_synopsis}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-brand font-bold uppercase text-xs tracking-widest mb-4">
                  {t("movie_details.creative_process", { ns: "Galery" })}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {movieDetails.creative_process}
                </p>
              </div>
            </section>

            {token && user && (user.role === "ADMIN" || user.role === "JURY") && (
              <section className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <span className="text-brand text-4xl">💬</span>
                  {t("movie_details.ratings", { ns: "Galery" })}
                </h2>

                {movieRatings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {movieRatings.map((rating) => (
                      <div
                        key={rating.id}
                        className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-4">
                          <span className="text-2xl font-black text-brand/20 group-hover:text-brand/40 transition-colors">
                            {rating.note}/10
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed pr-16 italic">
                          "{rating.comment || "Aucun commentaire laissé"}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/5 p-12 rounded-3xl text-center">
                    <p className="text-white/30 italic">
                      {t("movie_details.no_ratings", { ns: "Galery" })}
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="space-y-8">
            <span
              className={`flex justify-center p-4 rounded-full text-sm font-bold uppercase tracking-wider ${
                movieDetails.is_hybrid
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {movieDetails.is_hybrid ? "Hybrid" : "Full AI"}
            </span>
            <aside className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-brand">⚙️</span>{" "}
                {t("movie_details.technicalSpecs", { ns: "Galery" })}
              </h2>
              <div className="space-y-6">
                {[
                  {
                    label: t("movie_details.ia_tools", { ns: "Galery" }),
                    value: movieDetails.ia_tools,
                    icon: "🤖",
                  },
                  // { label: t("movie_details.has_subs", { ns: 'Galery' }), value: movieDetails.has_subs ? t('yes', { ns: 'common' }) : t('no', { ns: 'common' }), icon: "💬" },
                  {
                    label: t("movie_details.submittedAtDate", { ns: "Galery" }),
                    value: new Date(
                      movieDetails.submitted_at,
                    ).toLocaleDateString(),
                    icon: "📅",
                  },
                ].map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="opacity-50 group-hover:scale-110 transition-transform">
                        {spec.icon}
                      </span>
                      <span className="text-sm text-white/60">
                        {spec.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <aside className="bg-white/5 rounded-3xl border border-white/10 p-8 overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-brand">👥</span>{" "}
              {t("movie_details.collaborators", { ns: "Galery" })}
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {movieCollaborators.map((c: any) => (
                <button
                  key={c.id}
                  className="w-full text-left p-4 rounded-xl bg-white/5 border border-transparent hover:border-brand/30 hover:bg-brand/5 transition-all group"
                >
                  <p className="font-bold text-white group-hover:text-brand transition-colors">
                    {c.firstname} {c.lastname}
                  </p>
                  <p className="text-xs text-white/50">{c.contribution}</p>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={getUploadUrl(selectedImage)}
            alt="Fullscreen"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MovieDetails;
