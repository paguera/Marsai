import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const eventSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit faire au moins 10 caractères"),
  status: z.enum(["Scheduled", "Completed", "Cancelled"]),
  start_at: z.string().min(1, "La date est requise"),
  duration: z.number().min(1, "La durée doit être supérieure à 0"),
  location: z.string().min(3, "Le lieu est requis"),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function DashboardEvent() {
  const [eventList, setEventList] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const { t } = useTranslation(["Dashboard", "common"]);
  const { token } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isSaving },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: "Scheduled",
      duration: 60,
    },
  });

  const fetchEvents = () => {
    fetch(`${import.meta.env.VITE_API_URL}/events/`)
      .then((res) => res.json())
      .then((data) => setEventList(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSaveNewEvent = async (data: EventFormData) => {
    if (!token) return;

    const now = new Date().toISOString().split("T")[0];

    const eventToSave = {
      ...data,
      created_at: now,
      updated_at: now,
      published_at: now,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/event`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventToSave),
        },
      );

      if (response.ok) {
        setIsAdding(false);
        reset();
        fetchEvents();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to save event:", response.status, errorData);
        alert(
          "Erreur lors de l'enregistrement : " +
            (errorData.message || response.statusText),
        );
      }
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!token) return;
    if (!window.confirm(t("actions.delete", { ns: "common" }) + " ?")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/event/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-tighter">
          {t("events.section_title", { defaultValue: "Planification des Événements" })}
        </h2>
        {!isAdding ? (
          <button
            className="cursor-pointer bg-black text-white hover:bg-gray-800 font-bold py-2 px-4 rounded-xl transition-all shadow-lg border border-white/10 text-sm"
            onClick={() => setIsAdding(true)}
          >
            + {t("events.add_button")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
              onClick={handleSubmit(handleSaveNewEvent)}
              title={t("actions.save", { ns: "common" })}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("actions.save", { ns: "common" })}
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
              onClick={() => {
                setIsAdding(false);
                reset();
              }}
              title={t("actions.cancel", { ns: "common" })}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t("actions.cancel", { ns: "common" })}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden bg-brand">
        <div className="overflow-x-auto">
          <table className="min-w-full text-white text-center mobile-vertical-table">
            <thead className="bg-primary text-black">
              <tr>
                <th className="py-3 px-4">{t("events.table.title")}</th>
                <th className="py-3 px-4">{t("events.table.description")}</th>
                <th className="py-3 px-4">{t("events.table.status")}</th>
                <th className="py-3 px-4">{t("events.table.date")}</th>
                <th className="py-3 px-4">{t("events.table.duration")}</th>
                <th className="py-3 px-4">{t("events.table.location")}</th>
                <th className="py-3 px-4 text-right">
                  {t("events.table.actions", { defaultValue: "Actions" })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-800">
              {isAdding && (
                <tr className="bg-gray-800/80">
                  <td className="p-2">
                    <input
                      type="text"
                      className={`w-full bg-gray-700 border ${errors.title ? "border-red-500" : "border-gray-600"} p-1 rounded text-sm text-white`}
                      {...register("title")}
                      placeholder={t("events.title_placeholder")}
                    />
                    {errors.title && (
                      <p className="text-[10px] text-red-400">
                        {errors.title.message}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className={`w-full bg-gray-700 border ${errors.description ? "border-red-500" : "border-gray-600"} p-1 rounded text-sm text-white`}
                      {...register("description")}
                      placeholder={t("events.description_placeholder")}
                    />
                    {errors.description && (
                      <p className="text-[10px] text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    <select
                      className="w-full bg-gray-700 border border-gray-600 p-1 rounded text-sm text-white"
                      {...register("status")}
                    >
                      <option value="Scheduled">Planifié</option>
                      <option value="Completed">Terminé</option>
                      <option value="Cancelled">Annulé</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="datetime-local"
                      className={`w-full bg-gray-700 border ${errors.start_at ? "border-red-500" : "border-gray-600"} p-1 rounded text-sm text-white`}
                      {...register("start_at")}
                    />
                    {errors.start_at && (
                      <p className="text-[10px] text-red-400">
                        {errors.start_at.message}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className={`w-full bg-gray-700 border ${errors.duration ? "border-red-500" : "border-gray-600"} p-1 rounded text-sm text-white`}
                      {...register("duration", { valueAsNumber: true })}
                    />
                    {errors.duration && (
                      <p className="text-[10px] text-red-400">
                        {errors.duration.message}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className={`w-full bg-gray-700 border ${errors.location ? "border-red-500" : "border-gray-600"} p-1 rounded text-sm text-white`}
                      {...register("location")}
                      placeholder={t("events.location_placeholder")}
                    />
                    {errors.location && (
                      <p className="text-[10px] text-red-400">
                        {errors.location.message}
                      </p>
                    )}
                  </td>
                  <td></td>
                </tr>
              )}
              {eventList.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-800/40 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-white">
                    {item.title}
                  </td>
                  <td className="py-4 px-4 text-gray-900 text-sm truncate max-w-xs">
                    {item.description}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Completed" ||
                        item.status === "Complété"
                          ? "bg-green-900/30 text-green-400"
                          : item.status === "Cancelled" ||
                              item.status === "Annulé"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-blue-900/30 text-blue-400"
                      }`}
                    >
                      {item.status === "Scheduled"
                        ? "Planifié"
                        : item.status === "Completed"
                          ? "Terminé"
                          : item.status === "Cancelled"
                            ? "Annulé"
                            : item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">
                    {new Date(item.start_at || item.date).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">
                    {item.duration} min
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">
                    {item.location}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => deleteEvent(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
