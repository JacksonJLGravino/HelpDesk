import request from "supertest";
import { describe, expect, it } from "vitest";
import { hash } from "bcrypt";

import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Sessions routes", () => {
  it("should be able to authenticate a user", async () => {
    const password = "123456";

    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash(password, 8),
      },
    });

    const response = await request(app).post("/sessions").send({
      email: "john@example.com",
      password,
    });

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
          role: "cliente",
        }),
      }),
    );

    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should not be able to authenticate a user with an invalid email", async () => {
    const response = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(401);

    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should not be able to authenticate a user with an invalid password", async () => {
    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash("123456", 8),
      },
    });

    const response = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "senha-errada",
    });

    expect(response.statusCode).toBe(401);

    expect(response.body.message).toBe("Invalid email or password");
  });
});
