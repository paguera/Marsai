import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MoviesSidebar from "../components/MoviesSidebar";
import Footer from "../components/Footer";
import MoviesList from "../components/MoviesJury/MoviesList";
import type { MovieTag } from "../types-interfaces/Movie";
import Tags from "../components/Tags";
import MoviesTypeBar, {
  type MovieSectionType,
} from "../components/MoviesTypeBar";

/**
 * Composant principal de la galerie de films pour le public.
 * Interface avec panneau latéral pour naviguer entre les différentes sections.
 */
function Movies() {
  const { t } = useTranslation(["Movies", "Dashboard", "Galery", "common"]);
  const [activeSection, setActiveSection] = useState<string>("selection");
  const [query, setQuery] = useState<string>("");

  const [allTags, setAllTags] = useState<MovieTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<MovieTag | null>(null);
  const [movieType, setMovieType] = useState<MovieSectionType>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch tags
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchTags = async () => {
      try {
        // Réinitialiser les tags et le tag sélectionné avant de fetcher de nouveaux
        setAllTags([]);
        setSelectedTag(null);
        // Harmonisation du paramètre de section pour l'API
        const sectionParam =
          activeSection === "selection" ? "Accepted" : activeSection;
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tags/${sectionParam}`,
        );
        if (response.ok) {
          const data = await response.json();
          setAllTags(data);
        }
      } catch (err: any) {
        console.error("Error fetching tags:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case "selection":
        return (
          <MoviesList
            section="Accepted"
            variant="public"
            search={query}
            type={movieType}
            selected={selectedTag}
          />
        );
      case "best":
        return (
          <MoviesList
            section="best"
            variant="public"
            search={query}
            type={movieType}
            selected={selectedTag}
          />
        );
      default:
        return (
          <MoviesList
            section="Accepted"
            variant="public"
            search={query}
            type={movieType}
            selected={selectedTag}
          />
        );
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "selection":
        return t("selection_title", { ns: "Galery" });
      case "best":
        return t("best_rated", { ns: "Galery" });
      default:
        return "";
    }
  };

  if (loading || allTags.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white text-xl animate-pulse">
          {t("loading.generic", { ns: "common" })}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
        {t("errors.generic", { ns: "common" })}: {error}
      </div>
    );
  }
  return (
    <div className="min-h-100vh w-full h-full relative">
      <div className="flex flex-col my-20">
          <main
            className={`flex-1  transition-all duration-1300 ease-in-out p-6 md:p-12 flex flex-col`}
          >
            <header className="mb-12 border-l-4 border-brand pl-6">
              <h1 className="text-5xl text-white font-black uppercase tracking-tighter drop-shadow-2xl flex flex-col">
                {getSectionTitle()}
              </h1>
              <p className="text-white/50 italic font-medium mt-2 text-lg">
                {t("subtitle", { ns: "Galery" })}
              </p>
            </header>
            <div className="flex-1 p-1 rounded-[2rem] min-h-[10vh] shadow-2xl backdrop-blur-xl transition-all border border-white/5">
              <div className="p-4 md:p-8">
                {/* Filters container plus compact */}
                <div className="bg-dark/50 p-10 rounded-4xl backdrop-blur-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <MoviesSidebar
                      activeSection={activeSection}
                      setActiveSection={setActiveSection}
                    />
                    <MoviesTypeBar
                      activeSection={movieType}
                      setActiveSection={setMovieType}
                    />

                    <div className="w-full md:w-72">
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-brand transition-colors text-sm">
                          🔍
                        </span>
                        <input
                          type="text"
                          placeholder={t("search_placeholder", {
                            ns: "Galery",
                          })}
                          className="w-full bg-white/5 border border-white/10 p-2.5 pl-10 text-white text-sm rounded-2xl focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand transition-all backdrop-blur-sm"
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {activeSection !== "best" && allTags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <Tags
                        tags={allTags}
                        selected={selectedTag}
                        onTagSelect={setSelectedTag}
                      />
                    </div>
                  )}
                </div>
                <div className="my-10">{renderSection()}</div>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
  );
}

export default Movies;
