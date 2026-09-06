export const Users = {
  addUser: async (
    email: string,
    hashedPassword: string,
    firstname: string,
    lastname: string,
    connection: any,
  ) => {
    const query =
      "INSERT INTO user (email, password, firstname, lastname) VALUES (?, ?, ?, ?)";
    const [result]: any = await connection.query(query, [
      email,
      hashedPassword,
      firstname,
      lastname,
    ]);
    return result;
  },
  getUserByEmail: async (
    email: string,
    connection: any,
  ) => {
    const query = "SELECT * FROM user WHERE email = ?";
    const [rows]: any = await connection.query(query, [email]);
    return rows[0];
  },
  getUserById: async (
    id: number,
    connection: any,
  ) => {
    const query = "SELECT * FROM user WHERE id = ?";
    const [rows]: any = await connection.query(query, [id]);
    return rows[0];
  },
};
