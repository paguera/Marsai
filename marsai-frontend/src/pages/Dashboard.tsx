// Ce fichier est responsable de l'affichage du tableau de bord pour les utilisateurs authentifiés
// avec le rôle "ADMIN". Il fournit une navigation entre plusieurs sections et
// affiche le contenu approprié en fonction de la section sélectionnée.

import { useAuth } from "../context/AuthContext";
import UserDashboard from "../components/Dashboard/UserDahboard";
import DashboardEvent from "../components/Dashboard/Event";
import NewsletterDashboard from "../components/Dashboard/Newsletter/NewsletterDashboard";
import { useTranslation } from "react-i18next";
import Register from "../components/Dashboard/Register";
import { useState } from "react";
import DashboardGlobal from "../components/Dashboard/Global";
import Sidebar from "../components/Dashboard/Sidebar";
import MoviesList from "../components/MoviesJury/MoviesList";
import Footer from "../components/Footer";

export default function Dashboard() {
  const { t } = useTranslation(["Dashboard", "common", "Galery"]);
  const [activeSection, setActiveSection] = useState<string>("global");
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "global":
        return <DashboardGlobal />;
      case "events":
        return <DashboardEvent />;
      case "register":
        return <Register />;
      case "users":
        return <UserDashboard />;
      case "newsletter":
        return <NewsletterDashboard />;
      case "movies":
        return (
          <div className="flex flex-col gap-12">
            <section className="p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              <h2 className="text-3xl font-bold mb-8 text-primary flex items-center gap-4">
                <span className="text-4xl">⏳</span>
                {t("movies.pending", {
                  defaultValue: "Films en attente de modération",
                })}
              </h2>
              <MoviesList
                section="Pending"
                variant="admin"
                search={""}
                type={"all"}
                selected={null}
              />
            </section>

            <section className="p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-4">
                <span className="text-4xl">🚫</span>
                {t("movies.rejected", { defaultValue: "Films rejetés" })}
              </h2>
              <MoviesList
                section="Rejected"
                variant="admin"
                search={""}
                type={"all"}
                selected={null}
              />
            </section>
          </div>
        );
      default:
        return <DashboardGlobal />;
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      <div className="relative z-10">
        <header className="mt-8 p-18">
          <h1 className="text-4xl text-white font-black uppercase tracking-tighter drop-shadow-lg">
            {t("welcome")}, {user.firstname}
          </h1>
          <p className="text-white/60 italic font-medium">{t("description")}</p>
        </header>
        <div className="flex flex-col items-center justify-center">
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <main
            className={`flex-1 transition-all duration-300 ease-in-out p-2 md:p-8 flex flex-col w-[100%]`}
          >
            <div className="flex-1 p-2 md:p-8 min-h-[60vh] w-[100%] shadow-2xl backdrop-blur-md transition-all">
              {renderSection()}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}
