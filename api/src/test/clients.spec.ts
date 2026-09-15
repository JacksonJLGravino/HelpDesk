import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "@/app";
import { prisma } from "@/database/prisma";
import { hash } from "bcrypt";

async function getAdminToken() {
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@email.com",
      password: await hash("123456", 8),
      role: "admin",
    },
  });

  const response = await request(app).post("/sessions").send({
    email: admin.email,
    password: "123456",
  });

  return response.body.token;
}

async function createClient() {
  const response = await request(app).post("/users").send({
    name: "Client",
    email: "client@email.com",
    password: "123456",
  });

  const client = response.body;

  const loginResponse = await request(app).post("/sessions").send({
    email: "client@email.com",
    password: "123456",
  });

  return {
    client,
    token: loginResponse.body.token,
  };
}

describe("Clients endpoints", () => {
  describe("GET /clients", () => {
    it("should allow an admin to list clients", async () => {
      const adminToken = await getAdminToken();

      await request(app).post("/users").send({
        name: "Client",
        email: "client@email.com",
        password: "123456",
      });

      const response = await request(app)
        .get("/clients")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      expect(response.body).toHaveLength(1);

      expect(response.body[0]).toMatchObject({
        name: "Client",
        email: "client@email.com",
        role: "cliente",
        img: null,
      });
    });

    it("should return only clients", async () => {
      const adminToken = await getAdminToken();

      await request(app).post("/users").send({
        name: "Client",
        email: "client@email.com",
        password: "123456",
      });

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      const response = await request(app)
        .get("/clients")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].email).toBe("client@email.com");
    });

    it("should not return client password", async () => {
      const adminToken = await getAdminToken();

      await request(app).post("/users").send({
        name: "Client",
        email: "client@email.com",
        password: "123456",
      });

      const response = await request(app)
        .get("/clients")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.body[0]).not.toHaveProperty("password");
    });

    it("should not allow a client to list clients", async () => {
      await getAdminToken();

      const { token } = await createClient();

      const response = await request(app)
        .get("/clients")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should not allow a technician to list clients", async () => {
      const adminToken = await getAdminToken();

      await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      const loginResponse = await request(app).post("/sessions").send({
        email: "technician@email.com",
        password: "123456",
      });

      const response = await request(app)
        .get("/clients")
        .set("Authorization", `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(401);
    });

    it("should not allow an unauthenticated user to list clients", async () => {
      const response = await request(app).get("/clients");

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /clients/:id", () => {
    it("should allow an admin to update a client", async () => {
      const adminToken = await getAdminToken();
      const { client } = await createClient();

      const response = await request(app)
        .patch(`/clients/${client.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Client",
          email: "updated@email.com",
        });

      expect(response.status).toBe(200);

      const updatedClient = await prisma.user.findUnique({
        where: {
          id: client.id,
        },
      });

      expect(updatedClient).toMatchObject({
        name: "Updated Client",
        email: "updated@email.com",
        role: "cliente",
      });
    });

    it("should update only the provided fields", async () => {
      const adminToken = await getAdminToken();
      const { client } = await createClient();

      const response = await request(app)
        .patch(`/clients/${client.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Client",
        });

      expect(response.status).toBe(200);

      const updatedClient = await prisma.user.findUnique({
        where: {
          id: client.id,
        },
      });

      expect(updatedClient?.name).toBe("Updated Client");
      expect(updatedClient?.email).toBe("client@email.com");
    });

    it("should not allow updating a non-client", async () => {
      const adminToken = await getAdminToken();

      const technicianResponse = await request(app)
        .post("/technicians")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Technician",
          email: "technician@email.com",
          password: "123456",
          workTime: ["08:00", "09:00"],
        });

      const technician = technicianResponse.body;

      const response = await request(app)
        .patch(`/clients/${technician.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated",
        });

      expect(response.status).toBe(404);
    });

    it("should return 404 when client does not exist", async () => {
      const adminToken = await getAdminToken();

      const response = await request(app)
        .patch("/clients/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated",
        });

      expect(response.status).toBe(404);
    });

    it("should not allow duplicate email", async () => {
      const adminToken = await getAdminToken();

      const firstClient = await createClient();

      await request(app).post("/users").send({
        name: "Second Client",
        email: "second@email.com",
        password: "123456",
      });

      const response = await request(app)
        .patch(`/clients/${firstClient.client.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "second@email.com",
        });

      expect(response.status).toBe(400);
    });

    it("should not allow a client to update another client", async () => {
      const adminToken = await getAdminToken();

      const firstClient = await createClient();

      await request(app).post("/users").send({
        name: "Second Client",
        email: "second@email.com",
        password: "123456",
      });

      const secondLogin = await request(app).post("/sessions").send({
        email: "second@email.com",
        password: "123456",
      });

      const response = await request(app)
        .patch(`/clients/${firstClient.client.id}`)
        .set("Authorization", `Bearer ${secondLogin.body.token}`)
        .send({
          name: "Hacked",
        });

      expect(response.status).toBe(401);
    });

    it("should not allow an unauthenticated user to update a client", async () => {
      const adminToken = await getAdminToken();
      const { client } = await createClient();

      const response = await request(app).patch(`/clients/${client.id}`).send({
        name: "Updated",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /clients/:id", () => {
    it("should allow an admin to delete a client", async () => {
      const adminToken = await getAdminToken();
      const { client } = await createClient();

      const response = await request(app)
        .delete(`/clients/${client.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedClient = await prisma.user.findUnique({
        where: {
          id: client.id,
        },
      });

      expect(deletedClient).toBeNull();
    });

    it("should delete the client's tickets when the client is deleted", async () => {
      const adminToken = await getAdminToken();
      const { client } = await createClient();

      const service = await prisma.service.create({
        data: {
          title: "Formatação de computador",
          price: 80,
        },
      });

      const ticket = await prisma.ticket.create({
        data: {
          clientId: client.id,
          serviceId: service.id,
          title: "Computador com problema",
          description: "O computador não liga",
          basePrice: service.price,
        },
      });

      await prisma.ticketService.create({
        data: {
          ticketId: ticket.id,
          name: "Limpeza",
          price: 50,
        },
      });

      const response = await request(app)
        .delete(`/clients/${client.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedTicket = await prisma.ticket.findUnique({
        where: {
          id: ticket.id,
        },
      });

      const deletedTicketService = await prisma.ticketService.findFirst({
        where: {
          ticketId: ticket.id,
        },
      });

      expect(deletedTicket).toBeNull();
      expect(deletedTicketService).toBeNull();
    });

    it("should return 404 when client does not exist", async () => {
      const adminToken = await getAdminToken();

      const response = await request(app)
        .delete("/clients/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it("should not allow a client to delete a client", async () => {
      await getAdminToken();

      const { token } = await createClient();

      const response = await request(app)
        .delete("/clients/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should not allow an unauthenticated user to delete a client", async () => {
      const adminToken = await getAdminToken();
      const { client } = await createClient();

      const response = await request(app).delete(`/clients/${client.id}`);

      expect(response.status).toBe(401);
    });
  });
});
