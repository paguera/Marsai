import React from 'react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const { t } = useTranslation(["Dashboard", "common"]);

  const menuItems = [
    {
      id: 'global', label: t("dashboard_global.title"), icon: ('📈')
    },
    {
      id: 'events', label: t("events.title"), icon: ('📅')
    },
    {
      id: 'register', label: t("register.title"), icon: ('👤')
    },
    {
      id: 'users', label: t("user.title"), icon: ('👥')
    },
    {
      id: 'newsletter', label: t("newsletters.title"), icon: ('✉️')
    },
    {
      id: 'movies', label: t("movies.title"), icon: ('🎬')
    },
  ];

  return (
    <nav className="relative flex justify-center w-full px-4">
      <ul className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`
                  flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-brand text-white shadow-lg shadow-brand/30 ring-1 ring-white/20' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className={`ml-2.5 font-bold uppercase tracking-widest text-[10px] md:text-[11px] transition-colors ${isActive ? 'text-white' : 'text-inherit'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
