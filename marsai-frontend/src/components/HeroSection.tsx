import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <>
      {/* DESKTOP VERSION */}
      <div className={`hidden sm:flex font-serif w-full h-screen flex-col justify-around items-center bg-transparent`}>
        <div className="ml-10 h-[70%] flex gap-0 text-black flex-col lg:flex-row">
          <div className="my-40 font-serif font-bold">
            <div className="font-sans flex p-2 flex-col items-center md:flex-row mt-10 gap-5 cursor-pointer bg-linear-to-b from-gray to-black bg-clip-text text-transparent">
              <NavLink to={"/submit"}>
                <p className="text-center text-6xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                  {t("hero_banner.title_part1")}
                </p>
                <p className="text-4xl text-center md:text-5xl font-bold text-white drop-shadow-lg">
                  {t("hero_banner.title_part2")}
                </p>
                <p className="text-center text-5xl md:text-7xl font-black uppercase tracking-tighter text-dark drop-shadow-2xl">
                  {t("hero_banner.title_part3")}
                </p>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className={`flex sm:hidden font-serif w-full h-screen flex-col justify-around items-center bg-transparent`}>
        <div className="my-50 h-[70%] flex gap-0 text-black flex-col lg:flex-row ">
          <div className="font-serif font-bold">
            <div className="font-sans flex p-2 flex-col items-center md:flex-row mt-0 gap-12 cursor-pointer">
              <NavLink to={"/submit"}>
                <p className="text-center text-6xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                  {t("hero_banner.title_part1")}
                </p>
                <p className="text-3xl text-center md:text-4xl font-bold text-white drop-shadow-lg">
                  {t("hero_banner.title_part2")}
                </p>
                <p className="text-center text-5xl md:text-6xl font-black uppercase tracking-tighter text-dark drop-shadow-2xl">
                  {t("hero_banner.title_part3")}
                </p>
              </NavLink>
              <a
                href={'#presentation'}
                className="text-lg my-8 text-white bg-brand hover:bg-brand/80 text-center w-40 m-auto p-3 rounded-xl font-bold uppercase tracking-widest shadow-xl transition-all">
                {t("hero_banner.learn_more_button")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
