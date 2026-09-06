import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUploadUrl } from "../../utils/url";

export default function DashboardMovieCard({ gridLayout, movie }: any) {
  const { t } = useTranslation(["Dashboard", "common"]);
  const { token } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(movie.status);
  const navigate = useNavigate();
  async function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/movie-status/${movie.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        setCurrentStatus(movie.status);
        alert(t("movie.status_update_error", { defaultValue: "Erreur lors de la mise à jour du statut." }));
      } else {
        alert(t("movie.status_update_success", { defaultValue: "Statut mis à jour avec succès !" }));
      }
    } catch (error) {
      setCurrentStatus(movie.status);
      console.error("Erreur lors de la mise à jour du statut :", error);
      alert(t("movie.status_update_error", { defaultValue: "Erreur lors de la mise à jour du statut." }));
    }
  }

  return (
    <div
      className={`${gridLayout} p-4 md:p-6 border-b border-border hover:bg-brand`}
    >
      <div className="w-20 md:w-24">
        <img
          src={getUploadUrl(movie.cover_image)}
          alt="moviethumbnail"
          className="rounded-md shadow-sm"
          loading="lazy"
        />
      </div>

      <div
        className="font-semibold text-white cursor-pointer"
        onClick={() => navigate(`/galery/${movie.id}`)}
      >
        {movie.english_title}
      </div>

      <div className="hidden md:block text-white">
        {t("movie_card.author_placeholder")}
      </div>

      <div className="hidden md:block">
        {/* Status */}
        <select
          className="text-white cursor-pointer"
          onChange={handleStatus}
          value={currentStatus}
          name=""
          id="select-status"
        >
          <option value="Accepted">{t("status.accepted", { ns: "common" })}</option>
          <option value="Cancelled">{t("status.cancelled", { ns: "common" })}</option>
          <option value="Pending">{t("status.pending", { ns: "common" })}</option>
        </select>
      </div>

      <div className="cursor-select">
        <input type="checkbox" name="" id="checkbox-selected" />
      </div>
    </div>
  );
}
