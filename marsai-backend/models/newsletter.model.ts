import { db } from "../config/database";

const addNewsletter = async ({
  object,
  content,
}: {
  object: string;
  content: string;
}) => {
  const query = "INSERT INTO newsletter (object, content) VALUES(?, ?)";
  const [result] = await db.query(query, [object, content]);
  return result;
};

const getAllNewsletters = async () => {
  const query = "SELECT * FROM newsletter";
  const [rows] = await db.query(query);
  return rows;
};

const getNewsletterById = async (newsletterId: string) => {
  const query = "SELECT * FROM newsletter WHERE id = ?";
  const [rows]: any = await db.query(query, [newsletterId]);
  return rows[0];
};

export default { addNewsletter, getAllNewsletters, getNewsletterById };
