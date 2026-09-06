import { db } from "../config/database";

const getSubscribersByEmail = async (email: string) => {
  const query = "SELECT * FROM subscriber WHERE email = ?";
  const [rows] = await db.query(query, [email]);
  return rows;
};

const getAllSubscribers = async () => {
  const query = "SELECT * FROM subscriber";
  const [rows] = await db.query(query);
  return rows;
};

const addSubscriber = async (email: string) => {
  const query = "INSERT INTO subscriber (email) VALUES (?)";
  const [result] = await db.query(query, [email]);
  return result;
};

const removeSubscriber = async (email: string) => {
  const query = "DELETE FROM subscriber WHERE email = ?";
  const [result] = await db.query(query, [email]);
  return result;
};

const removeSubscriberById = async (id: number) => {
  const query = "DELETE FROM subscriber WHERE id = ?";
  const [result] = await db.query(query, [id]);
  return result;
};


export default {
  addSubscriber,
  removeSubscriber,
  removeSubscriberById,
  getSubscribersByEmail,
  getAllSubscribers,
};
