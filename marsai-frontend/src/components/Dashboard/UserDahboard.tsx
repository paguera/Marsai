import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

function UserDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();
  const { t } = useTranslation("Dashboard");

  const promoteToJury = async (userId: number) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/promote/jury/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: "JURY" } : user,
          ),
        );
      } else {
        console.error("Failed to promote user to jury");
      }
    } catch (error) {
      console.error("Error promoting user to jury:", error);
    }
  };

  const promoteToAdmin = async (userId: number) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/promote/admin/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: "ADMIN" } : user,
          ),
        );
      } else {
        console.error("Failed to promote user to admin");
      }
    } catch (error) {
      console.error("Error promoting user to admin:", error);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <>
      <div className="w-full">
        <div className="bg-third/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-white text-center mobile-vertical-table">
              <thead className="bg-primary text-black">
                <tr>
                  <th className="py-3 lg:px-4">
                    {t("user.table.name")}
                  </th>
                  <th className="py-3 lg:px-4">
                    {t("user.table.firstname")}
                  </th>
                  <th className="py-3 lg:px-4">
                    {t("user.table.email")}
                  </th>
                  <th className="py-3 lg:px-4">
                    {t("user.table.role")}
                  </th>
                  <th className="py-3 lg:px-4">
                    {t("user.table.action")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700">
                    <td
                      className="py-3 px-4"
                      data-label={t("user.table.name")}
                    >
                      {user.lastname}
                    </td>
                    <td
                      className="py-3 px-4"
                      data-label={t("user.table.firstname")}
                    >
                      {user.firstname}
                    </td>
                    <td
                      className="py-3 px-4"
                      data-label={t("user.table.email")}
                    >
                      {user.email}
                    </td>
                    <td
                      className="py-3 px-4"
                      data-label={t("user.table.role")}
                    >
                      {user.role
                        ? user.role
                        : t("user.table.no_role")}
                    </td>
                    <td className="py-3 px-4 action-cell">
                      <button
                        className="bg-white hover:bg-slate-200 text-black font-bold py-1 px-2 rounded"
                        onClick={() => promoteToJury(user.id)}
                      >
                        {t("user.button.promote_jury")}
                      </button>
                      <button
                        className="bg-secondary hover:bg-indigo-400 text-black font-bold py-1 px-2 rounded ml-2"
                        onClick={() => promoteToAdmin(user.id)}
                      >
                        {t("user.button.promote_admin")}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-black font-bold py-1 px-2 rounded ml-2"
                        onClick={() => deleteUser(user.id)}
                      >
                        {t("user.button.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
