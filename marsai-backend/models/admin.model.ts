import { db } from "../config/database";

const deleteEvent = async (data: any) => {
  const query = "DELETE FROM event WHERE id = ?";
  const [results] = await db.query(query, data);
  return results;
};

const deleteUser = async (userId: string | string[] | undefined) => {
  const query = "DELETE FROM user WHERE id = ?";
  const [results] = await db.query(query, userId);
  return results;
};

const promoteToAdmin = async (userId: string | string[] | undefined) => {
  const query =
    "UPDATE user SET role_id = (SELECT id FROM role WHERE name = 'ADMIN') WHERE id = ?";
  const [results] = await db.query(query, userId);
  return results;
};

const promoteToJury = async (userId: string | string[] | undefined) => {
  const query =
    "UPDATE user SET role_id = (SELECT id FROM role WHERE name = 'JURY') WHERE id = ?";
  const [results] = await db.query(query, userId);
  return results;
};

const updateToAdmin = async (userId: string | string[] | undefined) => {
  const query = `
    UPDATE user
    SET role_id = (SELECT id FROM role WHERE name = 'ADMIN')
    WHERE id = ?
  `;
  const [results] = await db.query(query, userId);
  return results;
};

const updateToJury = async (userId: string | string[] | undefined) => {
  const query = `
    UPDATE user
    SET role_id = (SELECT id FROM role WHERE name = 'JURY')
    WHERE id = ?
  `;
  const [results] = await db.query(query, userId);
  return results;
};

const getAllUsers = async () => {
  const query = `
    SELECT u.id, u.firstname, u.lastname, u.email, r.name AS role
    FROM user u
    LEFT JOIN role r ON u.role_id = r.id
  `;
  const [results] = await db.query(query);
  return results;
};

export default {
  deleteEvent,
  promoteToAdmin,
  promoteToJury,
  getAllUsers,
  deleteUser,
  updateToAdmin,
  updateToJury,
};
