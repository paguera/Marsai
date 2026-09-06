import { db } from "../config/database";

const getUserByEmail = async (email: string) => {
  const query = `
    SELECT u.*, COALESCE(r.name, '') AS role
    FROM user u
    LEFT JOIN role r ON u.role_id = r.id
    WHERE u.email = ?
  `;
  const [rows]: any = await db.query(query, [email]);
  return rows[0];
};

const getUserById = async (id: number) => {
  const query = `
    SELECT u.*, COALESCE(r.name, '') AS role
    FROM user u
    LEFT JOIN role r ON u.role_id = r.id
    WHERE u.id = ?
  `;
  const [rows]: any = await db.query(query, [id]);
  return rows[0];
};

const addUser = async (
  email: string,
  password: string,
  firstname: string,
  lastname: string,
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Récupérer l'ID du rôle JURY par défaut
    const [roleResult]: any = await connection.query(
      "SELECT id FROM role WHERE name = 'JURY'"
    );
    const roleId = roleResult[0]?.id || null;

    // 2. Insérer l'utilisateur avec son rôle
    const query =
      "INSERT INTO user (email, password, firstname, lastname, role_id) VALUES (?, ?, ?, ?, ?)";
    const [result]: any = await connection.query(query, [
      email,
      password,
      firstname,
      lastname,
      roleId,
    ]);
    
    const userId = result.insertId;

    await connection.commit();
    return { id: userId, email };
  } catch (error: any) {
    await connection.rollback();
    console.error("Erreur lors de la création de l'utilisateur :", error.message);
    throw new Error("Erreur serveur");
  } finally {
    connection.release();
  }
};

export default { addUser, getUserByEmail, getUserById };
