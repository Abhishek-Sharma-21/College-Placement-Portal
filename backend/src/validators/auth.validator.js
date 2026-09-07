import { z } from "zod";

export const registerSchema = z.zod ? z.zod : z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters long." }),
  email: z.string().email({ message: "Invalid email format." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  role: z.enum(["student", "tpo"], { message: "Role must be either 'student' or 'tpo'." }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format." }),
  password: z.string().min(1, { message: "Password is required." }),
  role: z.enum(["student", "tpo"], { message: "Role is required." }),
});
