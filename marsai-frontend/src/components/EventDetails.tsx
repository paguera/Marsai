// src/components/EventDetails.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Footer from "./Footer";

const bookingSchema = z.object({
  firstname: z.string().min(2, "Le prénom est requis"),
  lastname: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Format d'email invalide"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Event {
  id: number;
  title: string;
  description: string;
  duration: number;
  location: string;
  status: string;
  start_at: string;
}

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<Event | null>(null);
  const { t } = useTranslation(["Festival", "common"]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isBooking },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const handleBookEvent = async (data: BookingFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const dataToSend = {
        event_id: parseInt(id || "0"),
        ...data,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/book`,
        {
          method: "POST",
          body: JSON.stringify(dataToSend),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      alert(t("agenda.event_details.booking_success"));
      reset();
    } catch (error: any) {
      console.error("Error details:", error);
      alert(t("agenda.event_details.booking_error", { error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/events/` + id);
        if (!res.ok) throw new Error("Événement non trouvé");
        const result = await res.json();
        setEventData(Array.isArray(result) ? result[0] : result);
      } catch (err: any) {
        console.error("Erreur de récupération de l'événement :", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!eventData) {
    navigate("/*");
  }

  return (
    <>
      <div className="min-h-100vh w-full h-full relative">
        <picture className="absolute fixed inset-0 h-full w-full object-cover">
          <source
            srcSet="/Purple-clouds-car-headlights.avif"
            media="(min-width: 0px)"
            type="image/avif"
          />
          <source
            srcSet="/Purple-clouds-car-headlights.webp"
            media="(min-width: 0px)"
            type="image/webp"
          />
          <img
            src="/Purple-clouds-car-headlights.jpg"
            alt="Une voiture tente d'éclairer une magnifique nuit étoilée"
            className="w-full h-full object-cover"
          />
        </picture>
        {/* Navigation Top Bar */}
        <div className="max-w-4xl mx-auto my-25">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-brand transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="font-bold uppercase tracking-widest text-sm text-white">
              {t("actions.cancel", { ns: "common" })}
            </span>
          </button>
        </div>

        {eventData ? (
          <div className="max-w-4xl mx-auto glass-panel-dark p-8 md:p-12 space-y-12">
            {/* Event Info */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-brand to-secondary bg-clip-text text-transparent uppercase tracking-tighter mb-4">
                    {eventData.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm font-medium text-white/60">
                    <span className="flex items-center gap-2">
                      ⏱️ {eventData.duration} min
                    </span>
                    <span className="flex items-center gap-2">
                      📍 {eventData.location}
                    </span>
                    <span className="flex items-center gap-2">
                      📅 {new Date(eventData.start_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase bg-brand/20 text-brand border border-brand/30">
                  {eventData.status}
                </span>
              </div>
              <p className="text-lg text-white/80 leading-relaxed">
                {eventData.description}
              </p>
            </section>

            {/* Booking Form */}
            <section className="bg-white/5 p-8 rounded-3xl border border-white/10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 italic">
                <span className="text-brand">🎟️</span>{" "}
                {t("actions.book_seat", { ns: "common" })}
              </h2>

              <form
                onSubmit={handleSubmit(handleBookEvent)}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-widest text-white/40"
                    htmlFor="fn"
                  >
                    {t("form.firstname", { ns: "common" })}
                  </label>
                  <input
                    id="fn"
                    className={`w-full bg-black/40 border ${errors.firstname ? "border-red-500" : "border-white/10"} rounded-xl p-3 text-white focus:outline-none focus:border-brand transition-all`}
                    {...register("firstname")}
                    type="text"
                  />
                  {errors.firstname && (
                    <p className="text-xs text-red-500">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-widest text-white/40"
                    htmlFor="ln"
                  >
                    {t("form.lastname", { ns: "common" })}
                  </label>
                  <input
                    id="ln"
                    className={`w-full bg-black/40 border ${errors.lastname ? "border-red-500" : "border-white/10"} rounded-xl p-3 text-white focus:outline-none focus:border-brand transition-all`}
                    {...register("lastname")}
                    type="text"
                  />
                  {errors.lastname && (
                    <p className="text-xs text-red-500">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-widest text-white/40"
                    htmlFor="mail"
                  >
                    {t("form.email", { ns: "common" })}
                  </label>
                  <input
                    id="mail"
                    className={`w-full bg-black/40 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-xl p-3 text-white focus:outline-none focus:border-brand transition-all`}
                    {...register("email")}
                    type="email"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  className="md:col-span-2 bg-brand text-black font-bold p-4 rounded-xl hover:bg-brand/80 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-brand/20"
                  type="submit"
                  disabled={isBooking}
                >
                  {isBooking
                    ? t("loading.generic", { ns: "common" })
                    : t("actions.book_seat", { ns: "common" })}
                </button>
              </form>
            </section>
          </div>
        ) : (
          <div className="text-center py-20 text-white/30 italic">
            {error || t("agenda.event_details.unavailable")}
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}
export default EventDetails;
