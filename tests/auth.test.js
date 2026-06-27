import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../src/config/db.js", () => ({
  prisma: prismaMock,
  connectDB: vi.fn(),
  disconnectDb: vi.fn(),
}));

import authRoutes from "../src/routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("registers then logs in a user", async () => {
    const plainPassword = "Pass1234";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "user-1",
        email: "sam@example.com",
        username: "Sam_1",
        password: hashedPassword,
      });

    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      username: "Sam_1",
      email: "sam@example.com",
      password: hashedPassword,
    });

    const registerRes = await request(app).post("/auth/register").send({
      username: "Sam_1",
      email: "sam@example.com",
      password: plainPassword,
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.status).toBe("success");
    expect(registerRes.body.user.email).toBe("sam@example.com");
    expect(registerRes.body.token).toBeTypeOf("string");

    const loginRes = await request(app).post("/auth/login").send({
      email: "sam@example.com",
      password: plainPassword,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.status).toBe("success");
    expect(loginRes.body.user.email).toBe("sam@example.com");
    expect(loginRes.body.token).toBeTypeOf("string");
  });
});
