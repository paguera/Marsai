import React from 'react';
import { useTranslation } from 'react-i18next';

export type MovieSectionType = 'full ai' | 'hybrid' | 'all';

export interface MoviesTypeBarProps {
  activeSection: MovieSectionType;
  setActiveSection: (id: MovieSectionType) => void;
  title?: string;
}

const MoviesTypeBar: React.FC<MoviesTypeBarProps> = ({ 
  activeSection, 
  setActiveSection, 
}) => {
  const { t } = useTranslation(["Dashboard", "Galery", "common"]);

  const menuItems: { id: MovieSectionType; label: string; icon: string }[] = [
    {
      id: 'hybrid', label: t("hybrid", { ns: "Galery" }), icon: ('🔵')
    },
    {
      id: 'full ai', label: t("fULl ai", { ns: "Galery" }), icon: ('🔴')
    },
    {
      id: 'all', label: t("all", { ns: "Galery" }), icon: ('🟣')
    },
  ];

  return (
    <nav className="relative inline-block">
      <ul className="flex items-center gap-1.5 md:gap-2 bg-black/20 p-1 rounded-2xl border border-white/5">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`
                  flex items-center px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-brand text-white shadow-md shadow-brand/20' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span className={`text-sm sm:text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="ml-1 sm:ml-2.5 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] md:text-[11px] whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MoviesTypeBar;