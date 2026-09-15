import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "@/app";
import { prisma } from "@/database/prisma";
import { hash } from "bcrypt";

describe("Services routes", () => {
  async function createAdmin() {
    const password = await hash("123456", 8);

    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@email.com",
        password,
        role: "admin",
      },
    });

    return admin;
  }

  async function createClient() {
    const password = await hash("123456", 8);

    const client = await prisma.user.create({
      data: {
        name: "Client",
        email: "client@email.com",
        password,
        role: "cliente",
      },
    });

    return client;
  }

  async function getToken(email: string) {
    const response = await request(app).post("/sessions").send({
      email,
      password: "123456",
    });

    return response.body.token;
  }

  describe("POST /services", () => {
    it("should be able to create a service", async () => {
      await createAdmin();

      const token = await getToken("admin@email.com");

      const response = await request(app)
        .post("/services")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Formatação de computador",
          price: 80,
        });

      expect(response.statusCode).toBe(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          title: "Formatação de computador",
          price: "80",
          status: "ativo",
        }),
      );
    });

    it("should not be able to create a service as a client", async () => {
      await createClient();

      const token = await getToken("client@email.com");

      const response = await request(app)
        .post("/services")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Formatação de computador",
          price: 80,
        });

      expect(response.statusCode).toBe(401);
    });

    it("should not be able to create a service without authentication", async () => {
      const response = await request(app).post("/services").send({
        title: "Formatação de computador",
        price: 80,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should not be able to create a service with an invalid title", async () => {
      await createAdmin();

      const token = await getToken("admin@email.com");

      const response = await request(app)
        .post("/services")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "A",
          price: 80,
        });

      expect(response.statusCode).toBe(400);
    });

    it("should not be able to create a service with an invalid price", async () => {
      await createAdmin();

      const token = await getToken("admin@email.com");

      const response = await request(app)
        .post("/services")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Formatação de computador",
          price: 0,
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /services", () => {
    it("should be able to list all services as an admin", async () => {
      await createAdmin();

      await prisma.service.createMany({
        data: [
          {
            title: "Formatação de computador",
            price: 80,
            status: "ativo",
          },
          {
            title: "Limpeza e manutenção",
            price: 200,
            status: "inativo",
          },
        ],
      });

      const token = await getToken("admin@email.com");

      const response = await request(app)
        .get("/services")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it("should not be able to list all services as a client", async () => {
      await createClient();

      const token = await getToken("client@email.com");

      const response = await request(app)
        .get("/services")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /services/available", () => {
    it("should be able to list only active services as a client", async () => {
      await createClient();

      await prisma.service.createMany({
        data: [
          {
            title: "Formatação de computador",
            price: 80,
            status: "ativo",
          },
          {
            title: "Limpeza e manutenção",
            price: 200,
            status: "inativo",
          },
        ],
      });

      const token = await getToken("client@email.com");

      const response = await request(app)
        .get("/services/available")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);

      expect(response.body[0]).toEqual(
        expect.objectContaining({
          title: "Formatação de computador",
          status: "ativo",
        }),
      );
    });

    it("should not be able to list available services as an admin", async () => {
      await createAdmin();

      const token = await getToken("admin@email.com");

      const response = await request(app)
        .get("/services/available")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(401);
    });

    it("should not be able to list available services without authentication", async () => {
      const response = await request(app).get("/services/available");

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /services/:id", () => {
    it("should be able to update a service", async () => {
      await createAdmin();

      const service = await prisma.service.create({
        data: {
          title: "Formatação de computador",
          price: 80,
        },
      });

      const token = await getToken("admin@email.com");

      const response = await request(app)
        .patch(`/services/${service.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Formatação completa de computador",
          price: 100,
        });

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: service.id,
          title: "Formatação completa de computador",
          price: "100",
          status: "ativo",
        }),
      );
    });

    it("should be able to deactivate a service", async () => {
      await createAdmin();

      const service = await prisma.service.create({
        data: {
          title: "Formatação de computador",
          price: 80,
        },
      });

      const token = await getToken("admin@email.com");

      const response = await request(app)
        .patch(`/services/${service.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "inativo",
        });

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: service.id,
          status: "inativo",
        }),
      );
    });

    it("should not be able to update a service as a client", async () => {
      await createClient();

      const service = await prisma.service.create({
        data: {
          title: "Formatação de computador",
          price: 80,
        },
      });

      const token = await getToken("client@email.com");

      const response = await request(app)
        .patch(`/services/${service.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Novo título",
        });

      expect(response.statusCode).toBe(401);
    });
  });
});
