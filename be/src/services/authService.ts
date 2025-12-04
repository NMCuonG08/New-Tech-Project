import { userRepository } from "../repositories/UserRepository";
import { User } from "../entities/User";

export class AuthService {
  async register(username: string, password: string): Promise<User> {
    const existing = await userRepository.findOne({ where: { username } });
    if (existing) {
      throw new Error("User already exists");
    }

    const user = userRepository.create({ username, password });
    return userRepository.save(user);
  }

  async login(username: string, password: string): Promise<User> {
    const user = await userRepository.findOne({ where: { username } });
    if (!user || user.password !== password) {
      throw new Error("Invalid credentials");
    }
    return user;
  }
}
