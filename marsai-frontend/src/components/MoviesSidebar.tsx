import React from 'react';
import { useTranslation } from 'react-i18next';

interface MoviesSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  title?: string;
}

const MoviesSidebar: React.FC<MoviesSidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
}) => {
  const { t } = useTranslation(["Dashboard", "Galery", "common"]);

  const menuItems = [
    // {
    //   id: 'all', label: t("all_movies", { ns: "Galery" }), icon: ('🎬')
    // },
    {
      id: 'best', label: t("best_rated", { ns: "Galery" }), icon: ('⭐')
    },
    {
      id: 'selection', label: t("selection_title", { ns: "Galery" }), icon: ('🏆')
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

export default MoviesSidebar;