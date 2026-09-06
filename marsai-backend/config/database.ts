// config/database.ts
import mysql from "mysql2/promise";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
  console.error(
    "Missing required environment variables for database connection.",
  );
  process.exit(1);
}

const db = mysql.createPool({
  host: DB_HOST as string,
  user: DB_USER as string,
  password: DB_PASSWORD as string,
  database: DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test de connexion
async function connect() {
  try {
    const connection = await db.getConnection();
    console.log("Connecté à la base de données MySQL");
    connection.release();
  } catch (error: any) {
    console.error("Erreur de connexion à MySQL :", error.message || error);
    throw error; // Re-throw the error so the caller knows it failed
  }
}

export { db, connect };
