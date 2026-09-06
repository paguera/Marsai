import { useEffect, useState } from "react";
import EventGrid, { type EventItem } from "../components/EventGrid";
import Acces from "../components/Access";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import Footer from "../components/Footer";

function Agenda() {
  const { t } = useTranslation("Festival");

  const [data, setData] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConferences, setShowConferences] = useState(false);
  const [showNight, setShowNight] = useState(false);

  function toggleConferences() {
    setShowConferences(!showConferences);
  }

  function handleKeyDownConferences(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleConferences();
    }
  }

  function toggleNight() {
    setShowNight(!showNight);
  }

  function handleKeyDownNight(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleNight();
    }
  }
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/events`);
        if (!res.ok) {
          throw new Error(t("agenda.error_status", { status: res.status }));
        }
        const data = await res.json();
        setData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [t]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-dark flex flex-col justify-center items-center p-10 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg text-white">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Erreur</h2>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-100vh w-full h-full relative">
      <div className="max-w-7xl mx-auto p-8 md:px-12 my-50 bg-dark/50 backdrop-blur-sm md:p-16 rounded-[40px] border border-white/10 shadow-2xl">
        {/* TITLE */}
        <header className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter mb-4 drop-shadow-2xl">
            {t("agenda.date")}
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-white/80 uppercase tracking-widest">
            {t("agenda.location")}
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {/* CONFERENCES SECTION */}
          <div className="w-full rounded-4xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-500">
            <h2
              className="flex items-center justify-between px-8 py-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={toggleConferences}
              onKeyDown={handleKeyDownConferences}
              role="button"
              tabIndex={0}
              aria-expanded={showConferences}
            >
              <div className="flex items-center gap-6">
                <span
                  className={`text-3xl transition-transform duration-500 ${showConferences ? "rotate-90 text-primary" : "rotate-0 text-white/40"}`}
                  aria-hidden="true"
                >
                  ▶
                </span>
                <span className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                  {t("conferences.title")}
                </span>
              </div>
              <span className="hidden md:block text-primary/40 font-bold uppercase tracking-widest text-xs">
                Détails du programme
              </span>
            </h2>

            <div
              className={`transition-all duration-700 ease-in-out overflow-hidden ${showConferences ? "max-h-500 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="p-8 md:p-12 border-t border-white/10 space-y-12">
                <div className="max-w-6xl">
                  <h3 className="text-2xl font-bold text-primary mb-6 underline decoration-primary/30 underline-offset-8">
                    {t("agenda.program_title")}
                  </h3>
                  <p className="text-xl text-white/70 mb-8 leading-relaxed italic">
                    {t("conferences.description")}
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      t("conferences.list.item1"),
                      t("conferences.list.item2"),
                      t("conferences.list.item3"),
                      t("conferences.list.item4"),
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-white/80 bg-white/5 p-4 rounded-2xl border border-white/5"
                      >
                        <span className="text-primary text-xl">■</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <EventGrid
                  events={data}
                  emptyMessage={"☠️ No event registered"}
                />
              </div>
            </div>
          </div>

          {/* MARSAI NIGHT SECTION */}
          <div className="w-full rounded-4xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-500">
            <h2
              className="flex items-center justify-between px-8 py-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              onClick={toggleNight}
              onKeyDown={handleKeyDownNight}
              role="button"
              tabIndex={0}
              aria-expanded={showNight}
            >
              <div className="flex items-center gap-6">
                <span
                  className={`text-3xl transition-transform duration-500 ${showNight ? "rotate-90 text-secondary" : "rotate-0 text-white/40"}`}
                  aria-hidden="true"
                >
                  ▶
                </span>
                <span className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                  {t("night.title")}
                </span>
              </div>
              <span className="hidden md:block text-secondary/40 font-bold uppercase tracking-widest text-xs">
                Soirée de gala
              </span>
            </h2>

            <div
              className={`transition-all duration-700 ease-in-out overflow-hidden ${showNight ? "max-h-250 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="p-8 md:p-12 border-t border-white/10 flex flex-col items-center text-center">
                <div className="space-y-4 mb-12">
                  <p className="text-primary text-3xl md:text-5xl font-black uppercase tracking-tighter">
                    {t("night.date")}
                  </p>
                  <p className="text-white/60 text-xl font-medium tracking-widest uppercase">
                    {t("night.time")}
                  </p>
                </div>

                <div className="max-w-2xl space-y-8">

                    <img
                      src="/marsai.webp"
                      alt="Logo de l'événement Marsai Night"
                      width="320"
                      height="320"
                      className="mx-auto w-64 md:w-80"
                    />
                  <p className="text-xl text-white/80 leading-relaxed font-medium">
                    {t("night.description")}
                  </p>
                  <NavLink to={"/event/1"} className="inline-block group">
                    <h2 className="text-xl px-12 py-4 cursor-pointer text-white bg-linear-to-r from-third to-brand2 hover:scale-105 transition-all rounded-2xl font-black uppercase tracking-tighter shadow-2xl shadow-secondary/20">
                      {t("night.get_pass_button")}
                    </h2>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          {/* LOCATION SECTION */}
          <section className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: t("location.cards.platform_title"),
                  sub: t("location.cards.platform_subtitle"),
                  desc: t("location.cards.platform_description"),
                  icon: "🏢",
                },
                {
                  title: t("location.cards.sugars_room_title"),
                  desc: t("location.cards.sugars_room_description"),
                  icon: "🍬",
                },
                {
                  title: t("location.cards.plaza_room_title"),
                  desc: t("location.cards.plaza_room_description"),
                  icon: "🏙️",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="flex flex-col p-8 hover:scale-110 rounded-4xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all group"
                >
                  <span className="text-4xl mb-6 group-hover:animate-bounce inline-block">
                    {card.icon}
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                    {card.title}
                  </h3>
                  {card.sub && (
                    <h4 className="text-primary text-sm font-bold uppercase mb-4 tracking-widest">
                      {card.sub}
                    </h4>
                  )}

                  <p className="text-white/60 text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-8">
              <Acces />
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Agenda;
