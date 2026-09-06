import { useTranslation } from "react-i18next";

function NotFound() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 md:p-12 bg-black/60 backdrop-blur-sm border border-white/10 shadow-2xl rounded-[40px] text-center z-10">
        <h2 className="text-6xl font-bold text-white mb-4">👻 404</h2>
        <h2 className="text-white text-3xl font-bold mb-4">
          {t("not_found.title")}
        </h2>
        <p className="text-white text-lg">
          {t("not_found.description")}
        </p>
      </div>
    </div>
  );
}

export default NotFound;
