import { useTranslation } from "react-i18next";
import React from "react";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import NewsletterSubscribe from "./components/Dashboard/Newsletter/NewsletterSubscribe";
import InfoCard from "./components/InfoCard";
import type { InfoCardProps } from "./types-interfaces/Common";

const App: React.FC = () => {
  const { t } = useTranslation("Festival");

  const mainInfoCards: InfoCardProps[] = [
    {
      icon: "🎬",
      title: t("project.cards.one_minute_title"),
      desc: t("project.cards.one_minute_description"),
    },
    {
      icon: "🎓",
      title: t("project.cards.free_title"),
      desc: t("project.cards.free_description"),
    },
    {
      icon: "🖖",
      title: t("project.cards.for_all_title"),
      desc: t("project.cards.for_all_description"),
    },
    {
      icon: "🔬",
      title: t("project.cards.expertise_title"),
      desc: t("project.cards.expertise_description"),
    },
  ];

  const secondaryInfoCards: InfoCardProps[] = [
    {
      icon: "🧑‍🎨",
      title: t("objectives.cards.creative_challenge_title"),
      desc: t("project.cards.one_minute_description"),
    },
    {
      icon: "😄",
      title: t("objectives.cards.human_title"),
      desc: t("project.cards.free_description"),
    },
    {
      icon: "📡",
      title: t("objectives.cards.desirable_futures_title"),
      desc: t("project.cards.for_all_description"),
    },
  ];


  // <div className={`w-full max-w-[280px] border-brand/30`}>
  //   <span className="text-5xl mb-6 group-hover:rotate-12 transition-transform"></span>
  //   <span className="font-black text-white text-2xl uppercase tracking-tighter"></span>
  // </div>
  // {

  //   /* Carte centrée sur l'humain */
  // }
  // <div className={`w-full max-w-[280px] border-brand/30`}>
  //   {/* Icône et titre */}
  //   <span className="text-5xl mb-4 group-hover:scale-110 transition-transform"></span>
  //   <span className="font-black text-white text-2xl uppercase tracking-tighter">
  //     {}
  //   </span>
  // </div>;
  // {
  //   /* Carte 2 */
  // }
  // <div className={`w-full max-w-[280px] border-secondary/30`}>
  //   <span className="text-5xl mb-6 group-hover:scale-110 transition-transform"></span>
  //   <span className="font-black text-white text-2xl uppercase tracking-tight">
  //     {}
  //   </span>
  // </div>;

  return (
    <div className="min-h-screen w-full h-full relative">
      {/* Section héro */}
      <div className="relative z-10">
        <HeroSection />

        {/* Section de présentation */}
        <div
          id="presentation"
          className="font-serif w-[95%] lg:w-[85%] m-auto mt-10 mb-20 glass-panel-dark p-8 md:p-16 shadow-2xl"
        >
          {/* Traduction */}
          <p className="font-bold font-sans md:p-15 bg-linear-to-t from-brand to-secondary bg-clip-text text-transparent uppercase mb-20 text-lg md:text-4xl text-center tracking-tight">
            {t("project.description")}
          </p>

          {/* Cartes */}
          <div className="font-sans">
            {/* Titre 1 */}
            <div className="my-32">
              <div className="my-20">
                <h2 className="text-center text-white md:text-5xl font-black text-3xl uppercase tracking-tighter">
                  {t("project.title")}
                </h2>
              </div>

              {/* Description */}
              <div className="my-8 flex flex-col justify-center items-center m-auto px-4 sm:px-6">
                <div className="flex flex-col m-auto max-w-3xl">
                  <span className="text-lg text-center md:text-2xl text-white/80 leading-relaxed font-medium">
                    {t("objectives.cards.human_description")}
                  </span>
                </div>

                {/* 4 cartes principales */}
                <div className="mb-8 flex flex-wrap justify-center gap-8 mt-5 w-full max-w-6xl">
                  {mainInfoCards.map((card) => (
                    <InfoCard
                      key={card.icon} // Ajout d'une clé pour React
                      icon={card.icon}
                      title={card.title}
                      desc={card.desc}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Titre 2 */}
            <div className="my-32">
              <h2 className="text-center text-white md:text-5xl font-black text-3xl uppercase tracking-tighter mb-12">
                {t("objectives.title")}
              </h2>

              {/* Description */}
              <div className="my-8 flex flex-col justify-center items-center m-auto px-4 sm:px-6">
                <span className="text-lg text-center md:text-2xl text-white/80 max-w-3xl leading-relaxed font-medium mb-12">
                  {t("objectives.cards.creative_challenge_description")}
                </span>

                <div className="w-full flex justify-center">
                  {/* 3 cartes secondaires */}
                  <div className="flex flex-wrap justify-center gap-10 w-full max-w-5xl">
                    {secondaryInfoCards.map((card: InfoCardProps) => (
                      <InfoCard
                        key={card.icon} // Ajout d'une clé pour React
                        icon={card.icon}
                        title={card.title}
                        desc={card.desc}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section partenaires */}
            <div className="mt-40 mb-20 text-center">
              <h2 className="text-center text-white md:text-5xl font-black text-3xl uppercase tracking-tighter mb-16">
                {t("partners.title")}
              </h2>

              {/* Image partenaires */}
              <div className="text-center p-4">
                <picture>
                  <source
                    srcSet="/partners.avif"
                    media="(min-width: 0px)"
                    type="image/avif"
                  />
                  <source
                    srcSet="/partners.webp"
                    media="(min-width: 0px)"
                    type="image/webp"
                  />
                  <img
                    src="/partners.jpg"
                    alt="Partenaires Marsai"
                    className="w-full max-w-xl md:max-w-2xl mx-auto opacity-70 hover:opacity-100 transition-opacity duration-500"
                  />
                </picture>
              </div>

              {/* Newsletter */}
              <div className="mt-40 w-full mx-auto">
                <NewsletterSubscribe />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <Footer />
    </div>
  );
};

export default App;
