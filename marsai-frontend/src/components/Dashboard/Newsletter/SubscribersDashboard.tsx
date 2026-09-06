import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

function SubscribersDashboard() {
  const { t } = useTranslation("Dashboard");
  const { token } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/subscribers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setSubscribers(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [token]);

  const deleteSubscriber = async (id: number) => {
    if (!window.confirm("Supprimer cet abonné ?")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/subscribers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-900/20 rounded-lg">
        {t("error")}: {error}
      </div>
    );

  return (
    <div className="space-y-4">
      <div
        className="w-auto p-3 sm:p-4 bg-primary rounded-xl text-black flex items-center justify-between px-4 sm:px-8 cursor-pointer hover:bg-opacity-90 transition-all group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`text-sm sm:text-xl transition-transform duration-500 ease-in-out transform ${isOpen ? "rotate-90" : "rotate-0"}`}
          >
            ▶
          </span>
          <h2 className="text-sm sm:text-xl font-bold">
            {t("subscribers.title") || "Abonnés Newsletter"}
          </h2>
        </div>
        <span className="bg-black text-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
          {subscribers.length}
        </span>
      </div>

      <div
        className={`transition-all duration-750 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-800 text-gray-400 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Date d'inscription</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : subscribers.length > 0 ? (
                  subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4 text-white font-medium">
                        {sub.email}
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {sub.created_at
                          ? new Date(sub.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteSubscriber(sub.id)}
                          className="text-gray-600 hover:text-red-500 transition-colors p-2"
                          title="Supprimer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-gray-500">
                      Aucun abonné trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscribersDashboard;
