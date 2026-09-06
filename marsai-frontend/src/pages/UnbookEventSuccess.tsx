import { useTranslation } from "react-i18next";

function UnbookEventSuccess() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 md:p-12 bg-black/60 backdrop-blur-sm border border-white/10 shadow-2xl rounded-[40px] text-center z-10">
        <h1 className="text-center text-6xl font-bold text-white mb-4">💺</h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          {t("unbook.title")}
        </h2>
        <p className="text-white text-lg">
          {t("unbook.success_message")}
        </p>
      </div>
    </div>
  );
}

export default UnbookEventSuccess;
