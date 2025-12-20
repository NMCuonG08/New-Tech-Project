import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";

export async function seedAdminUser() {
  const userRepository = AppDataSource.getRepository(User);

  // Check if admin user already exists
  const existingAdmin = await userRepository.findOne({
    where: { username: "adminnewweb" }
  });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  // Create admin user
  const adminUser = userRepository.create({
    username: "adminnewweb",
    password: "123456",
    email: "admin@newweb.com",
    role: UserRole.ADMIN
  });

  await userRepository.save(adminUser);
  console.log("Admin user created successfully:");
  console.log("  Username: adminnewweb");
  console.log("  Password: 123456");
  console.log("  Role: admin");
}
