import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardEventCard({ gridLayout, event }: any) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const deleteEvent = async () => {
    if (!token) return;
    if (!window.confirm(t("actions.delete_confirm", { defaultValue: "Voulez-vous vraiment supprimer cet événement ?" }))) {
      return;
    }
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/event/${event.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        alert(t("events.delete_success", { defaultValue: "Événement supprimé avec succès !" }));
        window.location.reload();
      } else {
        alert(t("events.delete_error", { defaultValue: "Erreur lors de la suppression de l'événement." }));
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(t("events.delete_error", { defaultValue: "Erreur lors de la suppression de l'événement." }));
    }
  };
  return (
    <div
      className={`${gridLayout} p-4 md:p-6 text-white cursor-pointer transition-all duration-300`}
    >
      <div
        className="font-semibold cursor-pointer"
        onClick={() => navigate(`/event/${event.id}`)}
      >
        {event.title}
      </div>
      <button className="cursor-pointer border border-red-500 hover:bg-red-500 hover:text-white" onClick={deleteEvent}>
        {t('events.delete_button')}
      </button>
    </div>
  );
}
