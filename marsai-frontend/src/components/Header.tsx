import { NavLink, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const location = useLocation();

  useEffect(() => {
    if (navRef.current) {
      const activeLink =
        navRef.current.querySelector<HTMLAnchorElement>(".active");
      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink;
        setUnderlineStyle({
          left: offsetLeft,
          width: offsetWidth,
        });
      } else {
        setUnderlineStyle({ width: 0, left: 0 });
      }
    }
  }, [location]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-20 w-full bg-black/90 backdrop-blur-md shadow-lg shadow-black/50 border-b border-white/5 transition-all duration-300 ${isOpen ? "h-auto" : "h-25"}`}
    >
      <div className="font-sans px-4 md:px-8 h-25 flex justify-between items-center w-full">
        {/* Navbar TITLE */}
        <NavLink to={"/"}>
          <h2 className="text-3xl font-extrabold md:text-5xl bg-linear-to-t from-brand to-secondary bg-clip-text text-transparent">
            MarsAI
          </h2>
        </NavLink>

        {/* Desktop Navigation */}
        <div
          ref={navRef}
          className="text-center text-2xl md:text-4xl md:gap-15 flex flex-col xl:flex-row  p-2 rounded-xl"
        >
          <div className="hidden font-semibold xl:flex xl:flex-row items-center justify-around xl:gap-15 lg:gap-10 md:gap-5 text-left relative">
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "active text-white"
                  : "text-white/70 hover:text-white transition-colors"
              }
              to={"/agenda"}
            >
              <h2 className="sm:text-md  md:text-lg lg:text-2xl p-2 rounded-lg">
                {t("header.agenda")}
              </h2>
            </NavLink>
            <NavLink
              end
              className={({ isActive }) =>
                isActive
                  ? "active text-white"
                  : "text-white/70 hover:text-white transition-colors"
              }
              to={"/movies"}
            >
              <h2 className="sm:text-md  md:text-lg lg:text-2xl p-2 rounded-lg">
                {t("header.gallery")}
              </h2>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? "active text-white"
                  : "text-white/70 hover:text-white transition-colors"
              }
              to={"/submit"}
            >
              <h2 className="sm:text-md  md:text-lg lg:text-2xl p-2 rounded-lg">
                {t("header.submit")}
              </h2>
            </NavLink>

            {/* Specific Links based on role */}
            {user && user.role.includes("JURY") && (
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "active text-white"
                    : "text-brand hover:text-white transition-colors"
                }
                to={"/movies/jury"}
              >
                <h2 className="sm:text-md  md:text-lg lg:text-2xl p-2 rounded-lg font-bold">
                  {t("header.jurySpace", { defaultValue: "Espace Jury" })}
                </h2>
              </NavLink>
            )}

            {user && user.role.includes("ADMIN") && (
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "active text-white"
                    : "text-brand hover:text-white transition-colors"
                }
                to={"/dashboard"}
              >
                <h2 className="sm:text-md  md:text-lg lg:text-2xl p-2 rounded-lg font-bold">
                  {t("header.adminSpace")}
                </h2>
              </NavLink>
            )}

            {/* Logout  */}
            {user && (
              <button onClick={() => logout()}>
                <h2 className="text-2xl">{t("header.logout")}</h2>
              </button>
            )}

            {/* Login*/}
            {!user && (
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "active text-white"
                    : "text-white/70 hover:text-white transition-colors"
                }
                to={"/login"}
              >
                <h2 className="sm:text-md  md:text-lg lg:text-2xl p-2 rounded-lg">
                  {t("header.login")}
                </h2>
              </NavLink>
            )}

            <div
              className="absolute bottom-1.75 h-0.5 bg-brand transition-all duration-300 ease-in-out"
              style={underlineStyle}
            />
          </div>
        </div>

        {/* languages flags + Burger*/}
        <div className="flex items-center">
          <button
            onClick={() => changeLanguage("eng")}
            className="text-xl md:text-3xl p-2 hover:scale-110 transition-transform"
          >
            🇬🇧
          </button>
          <button
            onClick={() => changeLanguage("fra")}
            className="text-xl md:text-3xl p-2 hover:scale-110 transition-transform"
          >
            🇫🇷
          </button>
          <button
            className="text-4xl p-2 xl:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              className={`text-white w-8 h-8 transition-transform duration-700 ease-in-out transform ${isOpen ? "rotate-270" : "rotate-0"}`}
              src="/burger-menu.svg"
              alt="Menu"
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation (toggled by hamburger) */}
      {isOpen && (
        <div className="w-full bg-black/90 backdrop-blur-md border-t border-white/10">
          <div className="xl:hidden text-white overflow-hidden transition-all duration-500 ease-in-out max-h-screen">
            <div className="flex flex-col items-start p-6 gap-6">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "text-brand font-bold" : "text-white/70"
                }
                to={"/agenda"}
                onClick={() => setIsOpen(false)}
              >
                <h2 className="text-2xl">{t("header.agenda")}</h2>
              </NavLink>
              <NavLink
                end
                className={({ isActive }) =>
                  isActive ? "text-brand font-bold" : "text-white/70"
                }
                to={"/movies"}
                onClick={() => setIsOpen(false)}
              >
                <h2 className="text-2xl">{t("header.gallery")}</h2>
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "text-brand font-bold" : "text-white/70"
                }
                to={"/submit"}
                onClick={() => setIsOpen(false)}
              >
                <h2 className="text-2xl">{t("header.submit")}</h2>
              </NavLink>

              {user && user.role.includes("JURY") && (
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-brand font-bold" : "text-white/70"
                  }
                  to={"/movies/jury"}
                  onClick={() => setIsOpen(false)}
                >
                  <h2 className="text-2xl font-bold">
                    {t("header.jurySpace", { defaultValue: "Espace Jury" })}
                  </h2>
                </NavLink>
              )}

              {user && user.role.includes("ADMIN") && (
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-brand font-bold" : "text-white/70"
                  }
                  to={"/dashboard"}
                  onClick={() => setIsOpen(false)}
                >
                  <h2 className="text-2xl font-bold">
                    {t("header.adminSpace")}
                  </h2>
                </NavLink>
              )}

              {!user && (
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "text-brand font-bold" : "text-white/70"
                  }
                  to="/login"
                  onClick={() => setIsOpen(false)}
                >
                  <h2 className="text-2xl">{t("header.login")}</h2>
                </NavLink>
              )}

              {user && (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-white/70 hover:text-brand transition-colors text-left"
                >
                  <h2 className="text-2xl">{t("header.logout")}</h2>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
