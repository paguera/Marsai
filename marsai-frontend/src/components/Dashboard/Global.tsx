import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import StatCard from "./StatCard";
import { useAuth } from "../../context/AuthContext";

export default function DashboardGlobal() {
  const { t } = useTranslation(["Dashboard", "common"]);
  const { token } = useAuth();
  const [moviecount, setMoviecount] = useState(0);
  const [participantscount, setParticipantscount] = useState(0);
  const [acceptedscount, setacceptedscount] = useState(0);
  const [countriescount, setCountriescount] = useState(0);
  const [error, setError] = useState("");
  const objective_submitted = 600;
  const objective_participants = 3000;
  const objective_countries = 120;
  const objective_concurrents = 50;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [movieRes, countriesRes, acceptedRes, participantRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/movies/count`),
          fetch(`${import.meta.env.VITE_API_URL}/movies/countries`),
          fetch(`${import.meta.env.VITE_API_URL}/movies/accepted/count`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/events/stats/count`),
        ]);

        if (!movieRes.ok || !countriesRes.ok || !acceptedRes.ok || !participantRes.ok) {
           throw new Error("Erreur lors de la récupération des statistiques");
        }

        const movieData = await movieRes.json();
        const countriesData = await countriesRes.json();
        const acceptedData = await acceptedRes.json();
        const participantData = await participantRes.json();

        setMoviecount(movieData.total || 0);
        setCountriescount(typeof countriesData === 'number' ? countriesData : (countriesData.countries || 0));
        setacceptedscount(Array.isArray(acceptedData) ? (acceptedData[0]?.total || 0) : (acceptedData.total || 0));
        setParticipantscount(participantData.total || 0);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (token) fetchStats();
  }, [token, t]);

  if (error) {
    return <h1 className="text-red-500 p-6">{t("dashboard_global.error", { message: error })}</h1>;
  }

  const getPercent = (value: number, total: number) =>
    ((value / total) * 100).toFixed(2);

  return (
    <>
      <div className={`animate-fadeIn`}>
        <section>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 p-6 gap-6 max-w-full">
            <StatCard
              icon="🎥"
              objective={t("dashboard_global.card.objective", { count: moviecount })}
              objectivemax={objective_submitted}
              title={t("dashboard_global.card.films_submitted")}
              percentageText={t("dashboard_global.card.completed", {
                percentage: getPercent(moviecount, objective_submitted),
              })}
              progressValue={getPercent(moviecount, objective_submitted)}
            />

            <StatCard
              icon="✔️"
              objective={t("dashboard_global.card.objective", { count: acceptedscount })}
              objectivemax={objective_concurrents}
              title={t("dashboard_global.card.selected_films")}
            >
            </StatCard>
          </div>
        </section >
      </div >
      <div className={`animate-fadeIn`}>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 p-6 gap-6 max-w-full">
          <StatCard
            icon="👤"
            objective={t("dashboard_global.card.objective", { count: participantscount })}
            objectivemax={objective_participants}
            title={t("dashboard_global.card.participants")}
            percentageText={t("dashboard_global.card.completed", {
              percentage: getPercent(participantscount, objective_participants),
            })}
            progressValue={getPercent(participantscount, objective_participants)}
          />

          <StatCard
            icon="🏳️"
            objective={t("dashboard_global.card.objective", { count: countriescount })}
            objectivemax={objective_countries}
            title={t("dashboard_global.card.represented_countries")}
            percentageText={t("dashboard_global.card.completed", {
              percentage: getPercent(countriescount, objective_countries),
            })}
            progressValue={getPercent(countriescount, objective_countries)}
          />
        </div>
      </div >
    </>
  );
}
