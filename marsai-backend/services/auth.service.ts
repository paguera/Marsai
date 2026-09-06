import Users from "../models/auth.model";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

class AuthService {
  async register(data: any) {
    const { email, password, firstname, lastname } = data;
    
    const existingUser = await Users.getUserByEmail(email);
    if (existingUser) {
      throw new Error("ALREADY_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await Users.addUser(email, hashedPassword, firstname, lastname);
  }

  async login(email: string, password: string) {
    const user = await Users.getUserByEmail(email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = jsonwebtoken.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}

export default new AuthService();
