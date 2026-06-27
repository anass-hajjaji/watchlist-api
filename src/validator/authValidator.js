import {z} from "zod";

export const registerSchema = z.object({
  username: z.string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

  email: z.string()
    .email("Invalid email format")
    .max(100, "Email is too long")
    .trim()
    .toLowerCase(),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

  password: z.string()
    .min(1, "Password is required"),
});