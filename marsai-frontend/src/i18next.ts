import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ["eng", "fra"],
    fallbackLng: "eng",
    debug: false,
    ns: [
      "common",
      "Dashboard",
      "Festival",
      "Galery",
      "Login",
      "Register",
      "SubmitMovie",
      "Movies",
    ],
    defaultNS: "common",
    fallbackNS: "common",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
