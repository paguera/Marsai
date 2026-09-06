import { db } from "../config/database";

const getRatingCount = async () => {
  const query = "SELECT COUNT(*) as total FROM rating";
  const [rows]: any = await db.query(query);
  return rows[0].total;
};

export default { getRatingCount };
