import dotenv from "dotenv";
// Load environment variables before importing config/database
dotenv.config();

import { db } from "../config/database";
import bcrypt from "bcrypt";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  console.log("--- CRÉATION D'UN COMPTE ADMINISTRATEUR (MARSAI) ---");

  // Get connection for transaction handling
  const connection = await db.getConnection();

  try {
    let email = process.argv[2];
    let password = process.argv[3];
    let firstname = process.argv[4];
    let lastname = process.argv[5];

    // If arguments are not fully provided, ask for them interactively
    if (!email || !password || !firstname || !lastname) {
      email = await question("Email de l'administrateur : ");

      if (!email.includes("@")) {
        console.error("Erreur : Format d'email invalide.");
        process.exit(1);
      }

      password = await question("Mot de passe : ");
      if (password.length < 8) {
        console.error(
          "Erreur : Le mot de passe doit faire au moins 8 caractères.",
        );
        process.exit(1);
      }

      firstname = await question("Prénom : ");
      lastname = await question("Nom de famille : ");
    } else {
      if (password.length < 8) {
        console.error(
          "Erreur : Le mot de passe doit faire au moins 8 caractères.",
        );
        process.exit(1);
      }
    }

    if (!firstname || !lastname) {
      console.error("Erreur : Le prénom et le nom sont requis.");
      process.exit(1);
    }

    console.log("Hachage du mot de passe en cours...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start database transaction
    await connection.beginTransaction();

    // 1. Ensure ADMIN and JURY roles exist in 'role' table
    const [existingRoles]: any = await connection.query(
      "SELECT id, name FROM role"
    );

    const rolesMap = new Map<string, number>();
    existingRoles.forEach((r: any) => rolesMap.set(r.name, r.id));

    if (!rolesMap.has("ADMIN")) {
      const [insertRoleResult]: any = await connection.query(
        'INSERT INTO role (name) VALUES ("ADMIN")'
      );
      rolesMap.set("ADMIN", insertRoleResult.insertId);
      console.log(`Rôle ADMIN créé dans la table 'role'.`);
    }
    if (!rolesMap.has("JURY")) {
      const [insertRoleResult]: any = await connection.query(
        'INSERT INTO role (name) VALUES ("JURY")'
      );
      rolesMap.set("JURY", insertRoleResult.insertId);
      console.log(`Rôle JURY créé dans la table 'role'.`);
    }

    const roleId = rolesMap.get("ADMIN")!;

    // 2. Check if user already exists
    const [existingUsers]: any = await connection.query(
      "SELECT id FROM user WHERE email = ?",
      [email],
    );

    let userId: number;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      // Update existing user, assigning the ADMIN role
      await connection.query(
        "UPDATE user SET password = ?, firstname = ?, lastname = ?, role_id = ? WHERE id = ?",
        [hashedPassword, firstname, lastname, roleId, userId],
      );
      console.log(
        `ℹ️ Infos de l'utilisateur [${email}] mises à jour et rôle ADMIN associé.`,
      );
    } else {
      // Insert new user with the ADMIN role
      const [insertResult]: any = await connection.query(
        "INSERT INTO user (email, password, firstname, lastname, role_id) VALUES (?, ?, ?, ?, ?)",
        [email, hashedPassword, firstname, lastname, roleId],
      );
      userId = insertResult.insertId;
      console.log(
        `Utilisateur [${email}] créé avec succès avec le rôle ADMIN.`,
      );
    }

    // Commit transaction
    await connection.commit();
    console.log(`Succès : Le compte admin [${email}] est opérationnel !`);
  } catch (error) {
    await connection.rollback();
    console.error("Erreur critique lors de la création :", error);
  } finally {
    connection.release();
    rl.close();
    process.exit(0);
  }
};

createAdmin();
