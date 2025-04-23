import { storage } from "../server/storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import 'dotenv/config';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  try {
    const hashedPassword = await hashPassword("admin123");
    
    const adminUser = await storage.createUser({
      email: "admin@omsu.ru",
      password: hashedPassword,
      name: "Admin",
      surname: "Admin",
      studentId: "ADMIN001",
      role: "admin",
      faculty: "Administration",
      pseudonym: "SystemAdmin"
    });

    console.log("Admin user created successfully:", adminUser);
    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exit(1);
  }
}

createAdmin(); 