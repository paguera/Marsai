import { useTranslation } from "react-i18next";

function Access() {
  const { t } = useTranslation();

  return (
    <>
      <section className="max-w-full mx-auto px-6 pt-10 my-[7%]">
        <h2 className="font-bold text-xl md:text-3xl text-center text-white mb-[2%]">
          {t("acces.title")}
        </h2>
        <div className="flex text-white items-center gap-4 my-10">
          <img
            width="32"
            height="32"
            src="https://img.icons8.com/?size=100&id=9374&format=png&color=bfcad0"
            alt="Icône de tramway"
            className="shrink-0"
          />
          <div>
            <p className="font-bold ">{t("acces.public_transport_title")}</p>
            <p className="text-sm">{t("acces.public_transport_description")}</p>
          </div>
        </div>
        <div className="flex text-white items-center gap-4 my-10">
          <img
            width="32"
            height="32"
            src="https://img.icons8.com/?size=100&id=12684&format=png&color=bfcad0"
            alt="Icône de voiture"
            className="shrink-0"
          />
          <div>
            <p className="font-bold">{t("acces.car_title")}</p>
            <p className="text-sm">{t("acces.car_description")}</p>
          </div>
        </div>
        <div className="flex items-center text-white gap-4 my-10">
          <img
            width="32"
            height="32"
            src="https://img.icons8.com/?size=100&id=7873&format=png&color=bfcad0"
            alt="Icône de localisation"
            className="shrink-0"
          />
          <div>
            <p className="font-bold">{t("acces.address_title")}</p>
            <p className="text-sm">{t("acces.address_description")}</p>
          </div>
        </div>
        <div className="my-25 h-100 w-full overflow-hidden rounded-2xl border-2 border-border shadow-xl relative group">
          <iframe
            title="Carte interactive"
            width="100%"
            height="100%"
            className="grayscale invert-[0.85] hue-rotate-190 brightness-90 contrast-110 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            src="https://maps.google.com/maps?q=Marseille&t&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none border-2 border-brand/20 rounded-2xl"></div>
        </div>
      </section>
    </>
  );
}

export default Access;
