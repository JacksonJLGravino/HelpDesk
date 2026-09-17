import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { hash } from "bcrypt";

import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Users routes", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should be able to create a user", async () => {
    const response = await request(app).post("/users").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: "John Doe",
        email: "john@example.com",
        role: "cliente",
      }),
    );

    expect(response.body).not.toHaveProperty("password");
  });

  it("should not be able to create a user with an email that already exists", async () => {
    const password = await hash("123456", 8);

    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password,
      },
    });

    const response = await request(app).post("/users").send({
      name: "Jane Doe",
      email: "john@example.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe("User with same email already exists");
  });

  it("should be able to update a user", async () => {
    const password = "123456";

    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash(password, 8),
      },
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password,
    });

    const { token } = sessionResponse.body;

    const response = await request(app)
      .patch("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jane Doe",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: user.id,
        name: "Jane Doe",
        email: "john@example.com",
        role: "cliente",
      }),
    );

    expect(response.body).not.toHaveProperty("password");

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(updatedUser?.name).toBe("Jane Doe");
  });

  it("should be able to update the email", async () => {
    const password = "123456";

    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash(password, 8),
      },
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password,
    });

    const { token } = sessionResponse.body;

    const response = await request(app)
      .patch("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "jane@example.com",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.email).toBe("jane@example.com");
  });

  it("should not be able to update to an email that already exists", async () => {
    const password = "123456";

    await prisma.user.createMany({
      data: [
        {
          name: "John Doe",
          email: "john@example.com",
          password: await hash(password, 8),
        },
        {
          name: "Jane Doe",
          email: "jane@example.com",
          password: await hash(password, 8),
        },
      ],
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password,
    });

    const { token } = sessionResponse.body;

    const response = await request(app)
      .patch("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "jane@example.com",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe("User with same email already exists");
  });

  it("should be able to update the password", async () => {
    const oldPassword = "123456";
    const newPassword = "654321";

    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash(oldPassword, 8),
      },
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: oldPassword,
    });

    const { token } = sessionResponse.body;

    const updateResponse = await request(app)
      .patch("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: newPassword,
      });

    expect(updateResponse.statusCode).toBe(200);

    const loginResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: newPassword,
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
  });

  it("should not be able to update without authentication", async () => {
    const response = await request(app).patch("/users").send({
      name: "Jane Doe",
    });

    expect(response.statusCode).toBe(401);
  });

  it("should be able to delete a user", async () => {
    const password = "123456";

    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash(password, 8),
      },
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password,
    });

    const { token } = sessionResponse.body;

    const response = await request(app)
      .delete("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);

    const user = await prisma.user.findUnique({
      where: {
        email: "john@example.com",
      },
    });

    expect(user).toBeNull();
  });

  it("should not be able to delete without authentication", async () => {
    const response = await request(app).delete("/users");

    expect(response.statusCode).toBe(401);
  });
});
