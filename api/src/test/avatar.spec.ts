import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { hash } from "bcrypt";

import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Avatar routes", () => {
  it("should be able to update the user's avatar", async () => {
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
      .patch("/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", "src/test/fixtures/avatar.jpg");

    expect(response.statusCode).toBe(200);

    expect(response.body.img).toEqual(expect.any(String));

    const user = await prisma.user.findUnique({
      where: {
        email: "john@example.com",
      },
    });

    expect(user?.img).toBe(response.body.img);
  });

  it("should be able to replace the user's avatar", async () => {
    const password = "123456";

    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash(password, 8),
        img: "old-avatar.jpg",
      },
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password,
    });

    const { token } = sessionResponse.body;

    const response = await request(app)
      .patch("/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", "src/test/fixtures/avatar.jpg");

    expect(response.statusCode).toBe(200);

    expect(response.body.img).toEqual(expect.any(String));
    expect(response.body.img).not.toBe("old-avatar.jpg");

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(updatedUser?.img).toBe(response.body.img);
  });

  it("should be able to delete the user's avatar", async () => {
    const password = "123456";

    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password: await hash(password, 8),
        img: "avatar.jpg",
      },
    });

    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password,
    });

    const { token } = sessionResponse.body;

    const response = await request(app)
      .delete("/avatar")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(updatedUser?.img).toBeNull();
  });

  it("should not be able to update the avatar without authentication", async () => {
    const response = await request(app)
      .patch("/avatar")
      .attach("avatar", "src/test/fixtures/avatar.jpg");

    expect(response.statusCode).toBe(401);
  });

  it("should not be able to delete the avatar without authentication", async () => {
    const response = await request(app).delete("/avatar");

    expect(response.statusCode).toBe(401);
  });
});
