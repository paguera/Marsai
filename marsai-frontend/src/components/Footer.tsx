import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-black/60 backdrop-blur-md mt-20 py-12 border-t border-white/5 relative z-10">
      <div className="text-white max-w-7xl mx-auto px-6">
        <div className="text-center flex flex-col items-center">
          <div className="text-white text-center w-full">
            <div className="text-2xl md:text-4xl font-extrabold mb-6">
              <NavLink
                to={"https://marsaifestival.com"}
                target={"_blank"}
                className="hover:text-brand transition-colors text-white leading-tight"
              >
                <p>Le Mobile film Festival</p>
                <p>La Plateforme_</p>
              </NavLink>
              <NavLink
                to={"https://paguera.fr"}
                target={"_blank"}
                className="hover:text-brand transition-colors text-white leading-tight"
              >
                <p>PAGUERA </p>
              </NavLink>
              <p className="text-sm md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
                {t("footer.description")}
              </p>
            </div>

            {/* Social Logos - Harmonized */}
            <div className="flex justify-center items-center gap-10 my-12">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Facebook"
              >
                <img
                  className="h-8 w-auto opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 object-contain"
                  src="/facebook-logo.png"
                  alt=""
                  width="32"
                  height="32"
                />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Instagram"
              >
                <img
                  className="h-10 w-auto opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 object-contain"
                  src="/instagram-logo.avif"
                  alt=""
                  width="40"
                  height="40"
                />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="X (Twitter)"
              >
                <img
                  className="h-7 w-auto opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 object-contain"
                  src="/x-logo.png"
                  alt=""
                  width="28"
                  height="28"
                />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Youtube"
              >
                <img
                  className="h-8 w-auto opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 object-contain"
                  src="/youtube-logo.svg"
                  alt=""
                  width="32"
                  height="32"
                />
              </a>
            </div>

            {/* Legal Links */}
            <div className="pt-8 flex flex-wrap justify-center items-center gap-x-12 gap-y-4 border-t border-white/5 text-white/40">
              <NavLink
                to="/legal"
                className="text-xs uppercase tracking-widest text-white hover:text-brand transition-colors font-bold"
              >
                {t("footer.legal")}
              </NavLink>
              <NavLink
                to="/press"
                className="text-xs uppercase tracking-widest text-white hover:text-brand transition-colors font-bold"
              >
                {t("footer.press")}
              </NavLink>
              <NavLink
                to="/contact"
                className="text-xs uppercase tracking-widest text-white hover:text-brand transition-colors font-bold"
              >
                {t("footer.contact")}
              </NavLink>
              <p className="text-xs uppercase text-white tracking-widest">
                {t("footer.copyright")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
