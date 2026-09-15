import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { compare } from "bcrypt";

import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Technicians endpoints", () => {
  beforeEach(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.technicianAvailability.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
  });

  async function createAdmin() {
    const response = await request(app).post("/users").send({
      name: "Admin",
      email: "admin@email.com",
      password: "123456",
    });

    await prisma.user.update({
      where: {
        email: "admin@email.com",
      },
      data: {
        role: "admin",
      },
    });

    return response;
  }

  async function getAdminToken() {
    await createAdmin();

    const response = await request(app).post("/sessions").send({
      email: "admin@email.com",
      password: "123456",
    });

    return response.body.token;
  }

  async function createClient() {
    await request(app).post("/users").send({
      name: "Client",
      email: "client@email.com",
      password: "123456",
    });

    const response = await request(app).post("/sessions").send({
      email: "client@email.com",
      password: "123456",
    });

    return response.body.token;
  }

  async function createTechnician() {
    const adminToken = await getAdminToken();

    const response = await request(app)
      .post("/technicians")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Technician",
        email: "technician@email.com",
        password: "123456",
        workTime: ["08:00", "09:00", "10:00", "11:00"],
      });

    return {
      token: adminToken,
      technician: response.body,
    };
  }

  describe("POST /technicians", () => {
    it("should allow an admin to create a technician", async () => {
      const token = await getAdminToken();

      const response = await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00", "10:00", "11:00"],
        });

      expect(response.status).toBe(201);

      const technician = await prisma.user.findUnique({
        where: {
          email: "technician@email.com",
        },
      });

      expect(technician).toBeTruthy();
      expect(technician?.name).toBe("Technician");
      expect(technician?.role).toBe("tecnico");
    });

    it("should create the technician availability", async () => {
      const token = await getAdminToken();

      const response = await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00", "10:00", "11:00"],
        });

      expect(response.status).toBe(201);

      const technician = await prisma.user.findUnique({
        where: {
          email: "technician@email.com",
        },
      });

      const availability = await prisma.technicianAvailability.findUnique({
        where: {
          technicianId: technician!.id,
        },
      });

      expect(availability).toBeTruthy();

      expect(availability?.workTime).toEqual([
        "08:00",
        "09:00",
        "10:00",
        "11:00",
      ]);
    });

    it("should hash the technician password", async () => {
      const token = await getAdminToken();

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      const technician = await prisma.user.findUnique({
        where: {
          email: "technician@email.com",
        },
      });

      expect(technician).toBeTruthy();
      expect(technician?.password).not.toBe("123456");

      const passwordMatches = await compare("123456", technician!.password);

      expect(passwordMatches).toBe(true);
    });

    it("should not allow a client to create a technician", async () => {
      const token = await createClient();

      const response = await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      expect(response.status).toBe(401);
    });

    it("should not allow an unauthenticated user to create a technician", async () => {
      const response = await request(app)
        .post("/technicians")
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      expect(response.status).toBe(401);
    });

    it("should not allow duplicate email", async () => {
      const token = await getAdminToken();

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician 1",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      const response = await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician 2",
          email: "technician@email.com",
          password: "123456",
          workTime: ["10:00", "11:00"],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User with same email already exists");
    });

    it("should not allow an invalid workTime", async () => {
      const token = await getAdminToken();

      const response = await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["8:00", "09:00"],
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /technicians", () => {
    it("should allow an admin to list technicians", async () => {
      const token = await getAdminToken();

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00", "10:00", "11:00"],
        });

      const response = await request(app)
        .get("/technicians")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: "Technician",
        email: "technician@email.com",
        img: null,
        availability: {
          workTime: ["08:00", "09:00", "10:00", "11:00"],
        },
      });
    });

    it("should return only technicians", async () => {
      const token = await getAdminToken();

      await request(app).post("/users").send({
        name: "Client",
        email: "client@email.com",
        password: "123456",
      });

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      const response = await request(app)
        .get("/technicians")
        .set("Authorization", `Bearer ${token}`);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe("technician@email.com");
    });

    it("should not return technician password", async () => {
      const token = await getAdminToken();

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      const response = await request(app)
        .get("/technicians")
        .set("Authorization", `Bearer ${token}`);

      expect(response.body[0]).not.toHaveProperty("password");
    });

    it("should not allow a client to list technicians", async () => {
      const adminToken = await getAdminToken();

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00", "10:00", "11:00"],
        });

      const clientToken = await createClient();

      const response = await request(app)
        .get("/technicians")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should not allow an unauthenticated user to list technicians", async () => {
      const response = await request(app).get("/technicians");

      expect(response.status).toBe(401);
    });

    it("should not allow a technician to list technicians", async () => {
      const { technician } = await createTechnician();

      const response = await request(app)
        .get("/technicians")
        .set("Authorization", `Bearer ${technician.token}`);

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /technicians/:id", () => {
    it("should allow an admin to update the technician name", async () => {
      const { token, technician } = await createTechnician();

      const response = await request(app)
        .patch(`/technicians/${technician.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Technician",
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Technician");
      expect(response.body.email).toBe("technician@email.com");
    });

    it("should allow an admin to update the technician email", async () => {
      const { token, technician } = await createTechnician();

      const response = await request(app)
        .patch(`/technicians/${technician.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "updated@email.com",
        });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("updated@email.com");
    });

    it("should allow an admin to update the technician workTime", async () => {
      const { token, technician } = await createTechnician();

      const response = await request(app)
        .patch(`/technicians/${technician.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          workTime: ["10:00", "11:00", "12:00", "13:00"],
        });

      expect(response.status).toBe(200);

      expect(response.body.availability.workTime).toEqual([
        "10:00",
        "11:00",
        "12:00",
        "13:00",
      ]);
    });

    it("should allow an admin to update multiple fields", async () => {
      const { token, technician } = await createTechnician();

      const response = await request(app)
        .patch(`/technicians/${technician.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Technician",
          email: "updated@email.com",
          workTime: ["14:00", "15:00", "16:00", "17:00"],
        });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        name: "Updated Technician",
        email: "updated@email.com",
        availability: {
          workTime: ["14:00", "15:00", "16:00", "17:00"],
        },
      });
    });

    it("should not allow an admin to update a client", async () => {
      const token = await getAdminToken();

      const clientResponse = await request(app).post("/users").send({
        name: "Client",
        email: "client@email.com",
        password: "123456",
      });

      const response = await request(app)
        .patch(`/technicians/${clientResponse.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Client",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Technician not found");
    });

    it("should return 404 when technician does not exist", async () => {
      const token = await getAdminToken();

      const response = await request(app)
        .patch("/technicians/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Technician",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Technician not found");
    });

    it("should reject an invalid technician id", async () => {
      const token = await getAdminToken();

      const response = await request(app)
        .patch("/technicians/invalid-id")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Technician",
        });

      expect(response.status).toBe(400);
    });

    it("should reject a duplicate email", async () => {
      const token = await getAdminToken();

      const technician1 = await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician 1",
          email: "technician1@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Technician 2",
          email: "technician2@email.com",
          password: "123456",
          workTime: ["10:00", "11:00"],
        });

      const response = await request(app)
        .patch(`/technicians/${technician1.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "technician2@email.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User with same email already exists");
    });

    it("should not allow a client to update a technician", async () => {
      const { technician } = await createTechnician();
      const clientToken = await createClient();

      const response = await request(app)
        .patch(`/technicians/${technician.id}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
          name: "Updated Technician",
        });

      expect(response.status).toBe(401);
    });

    it("should not allow an unauthenticated user to update a technician", async () => {
      const { technician } = await createTechnician();

      const response = await request(app)
        .patch(`/technicians/${technician.id}`)
        .send({
          name: "Updated Technician",
        });

      expect(response.status).toBe(401);
    });
  });
});
