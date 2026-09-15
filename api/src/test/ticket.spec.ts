import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { hash } from "bcrypt";

import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("Tickets routes", () => {
  beforeEach(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.technicianAvailability.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
  });

  async function createUser(
    role: "admin" | "tecnico" | "cliente",
    email: string,
  ) {
    const password = await hash("123456", 8);

    return prisma.user.create({
      data: {
        name: `${role} Teste`,
        email,
        password,
        role,
      },
    });
  }

  async function createService() {
    return prisma.service.create({
      data: {
        title: "Formatação de computador",
        price: 80,
        status: "ativo",
      },
    });
  }

  async function createTicket(clientId: string, serviceId: number) {
    const service = await prisma.service.findUniqueOrThrow({
      where: {
        id: serviceId,
      },
    });

    return prisma.ticket.create({
      data: {
        title: "Computador com problema",
        description: "O computador não liga",
        clientId,
        serviceId,
        basePrice: service.price,
        finalPrice: service.price,
      },
    });
  }

  async function login(email: string) {
    const response = await request(app).post("/sessions").send({
      email,
      password: "123456",
    });

    return response.body.token;
  }

  describe("POST /tickets", () => {
    it("should be able to create a ticket", async () => {
      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();

      const token = await login("cliente@example.com");

      const response = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Computador não liga",
          description: "O computador parou de funcionar",
          serviceId: service.id,
        });

      expect(response.status).toBe(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          title: "Computador não liga",
          description: "O computador parou de funcionar",
          clientId: client.id,
          technicianId: null,
          serviceId: service.id,
          basePrice: "80",
          finalPrice: "80",
          status: "aberto",
        }),
      );
    });

    it("should not be able to create a ticket without authentication", async () => {
      const service = await createService();

      const response = await request(app).post("/tickets").send({
        title: "Computador não liga",
        description: "O computador parou de funcionar",
        serviceId: service.id,
      });

      expect(response.status).toBe(401);
    });

    it("should not be able to create a ticket as an admin", async () => {
      await createUser("admin", "admin@example.com");

      const service = await createService();

      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Computador não liga",
          description: "O computador parou de funcionar",
          serviceId: service.id,
        });

      expect(response.status).toBe(401);
    });

    it("should not be able to create a ticket as a technician", async () => {
      await createUser("tecnico", "tecnico@example.com");

      const service = await createService();

      const token = await login("tecnico@example.com");

      const response = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Computador não liga",
          description: "O computador parou de funcionar",
          serviceId: service.id,
        });

      expect(response.status).toBe(401);
    });

    it("should not be able to create a ticket with an invalid service", async () => {
      await createUser("cliente", "cliente@example.com");

      const token = await login("cliente@example.com");

      const response = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Computador não liga",
          description: "O computador parou de funcionar",
          serviceId: 999999,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Service not found");
    });

    it("should not be able to create a ticket with an inactive service", async () => {
      await createUser("cliente", "cliente@example.com");

      const service = await prisma.service.create({
        data: {
          title: "Formatação de computador",
          price: 80,
          status: "inativo",
        },
      });

      const token = await login("cliente@example.com");

      const response = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Computador não liga",
          description: "O computador parou de funcionar",
          serviceId: service.id,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Service not found");
    });
  });

  describe("GET /tickets", () => {
    it("should be able to list all tickets as an admin", async () => {
      const admin = await createUser("admin", "admin@example.com");
      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();

      await createTicket(client.id, service.id);

      const token = await login(admin.email);

      const response = await request(app)
        .get("/tickets")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          clientId: client.id,
          service: {
            title: "Formatação de computador",
          },
        }),
      );
    });

    it("should only list tickets belonging to the client", async () => {
      const client = await createUser("cliente", "cliente@example.com");

      const anotherClient = await createUser("cliente", "outro@example.com");

      const service = await createService();

      await createTicket(client.id, service.id);
      await createTicket(anotherClient.id, service.id);

      const token = await login(client.email);

      const response = await request(app)
        .get("/tickets")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].clientId).toBe(client.id);
    });

    it("should only list tickets assigned to the technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();

      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const anotherTicket = await createTicket(client.id, service.id);

      const token = await login(technician.email);

      const response = await request(app)
        .get("/tickets")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(ticket.id);
      expect(response.body[0].id).not.toBe(anotherTicket.id);
    });

    it("should not be able to list tickets without authentication", async () => {
      const response = await request(app).get("/tickets");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /tickets/:ticketId", () => {
    it("should be able to show a ticket as an admin", async () => {
      const admin = await createUser("admin", "admin@example.com");
      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(admin.email);

      const response = await request(app)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: ticket.id,
          clientId: client.id,
          service: expect.objectContaining({
            id: service.id,
            title: service.title,
          }),
          ticketServices: [],
        }),
      );
    });

    it("should be able to show its own ticket as a client", async () => {
      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(client.email);

      const response = await request(app)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ticket.id);
    });

    it("should not be able to show another client's ticket", async () => {
      const client = await createUser("cliente", "cliente@example.com");

      const anotherClient = await createUser("cliente", "outro@example.com");

      const service = await createService();
      const ticket = await createTicket(anotherClient.id, service.id);

      const token = await login(client.email);

      const response = await request(app)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should not be able to show an unassigned ticket as a technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(technician.email);

      const response = await request(app)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should be able to show an assigned ticket as a technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const token = await login(technician.email);

      const response = await request(app)
        .get(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ticket.id);
    });

    it("should return 404 when the ticket does not exist", async () => {
      const admin = await createUser("admin", "admin@example.com");

      const token = await login(admin.email);

      const response = await request(app)
        .get("/tickets/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Ticket not found");
    });

    it("should not be able to show a ticket without authentication", async () => {
      const response = await request(app).get("/tickets/1");

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /tickets/:ticketId/:technicianId", () => {
    it("should be able to assign a technician as an admin", async () => {
      const admin = await createUser("admin", "admin@example.com");

      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(admin.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}/${technician.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.technicianId).toBe(technician.id);
    });

    it("should not be able to assign a technician as a client", async () => {
      const client = await createUser("cliente", "cliente@example.com");

      const technician = await createUser("tecnico", "tecnico@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(client.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}/${technician.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should not be able to assign a technician as a technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(technician.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}/${technician.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should not be able to assign a user who is not a technician", async () => {
      const admin = await createUser("admin", "admin@example.com");
      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(admin.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}/${client.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Technician not found");
    });

    it("should return 404 when assigning a technician to a nonexistent ticket", async () => {
      const admin = await createUser("admin", "admin@example.com");
      const technician = await createUser("tecnico", "tecnico@example.com");

      const token = await login(admin.email);

      const response = await request(app)
        .patch(`/tickets/999999/${technician.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Ticket not found");
    });
  });

  describe("PATCH /tickets/:ticketId", () => {
    it("should be able to update the ticket status as the assigned technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const token = await login(technician.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "em_atendimento",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("em_atendimento");
      expect(response.body.finalPrice).toBe("80");
    });

    it("should be able to add extra services to a ticket", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const token = await login(technician.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          services: [
            {
              name: "Limpeza interna",
              price: 50,
            },
            {
              name: "Troca de pasta térmica",
              price: 30,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.finalPrice).toBe("160");

      expect(response.body.ticketServices).toHaveLength(2);

      expect(response.body.ticketServices).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Limpeza interna",
            price: "50",
          }),
          expect.objectContaining({
            name: "Troca de pasta térmica",
            price: "30",
          }),
        ]),
      );
    });

    it("should not be able to update a ticket that is not assigned to the technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(technician.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "em_atendimento",
        });

      expect(response.status).toBe(401);
    });

    it("should not be able to update a ticket as a client", async () => {
      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(client.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "em_atendimento",
        });

      expect(response.status).toBe(401);
    });

    it("should not be able to update a ticket as an admin", async () => {
      const admin = await createUser("admin", "admin@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      const token = await login(admin.email);

      const response = await request(app)
        .patch(`/tickets/${ticket.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "encerrado",
        });

      expect(response.status).toBe(401);
    });

    it("should return 404 when updating a nonexistent ticket", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const token = await login(technician.email);

      const response = await request(app)
        .patch("/tickets/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          status: "em_atendimento",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Ticket not found");
    });
  });

  describe("DELETE /tickets/:ticketId/:ticketServiceId", () => {
    it("should be able to delete an extra service as the assigned technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const ticketService = await prisma.ticketService.create({
        data: {
          ticketId: ticket.id,
          name: "Limpeza interna",
          price: 50,
        },
      });

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          finalPrice: 130,
        },
      });

      const token = await login(technician.email);

      const response = await request(app)
        .delete(`/tickets/${ticket.id}/${ticketService.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);

      const deletedService = await prisma.ticketService.findUnique({
        where: {
          id: ticketService.id,
        },
      });

      expect(deletedService).toBeNull();

      const updatedTicket = await prisma.ticket.findUnique({
        where: {
          id: ticket.id,
        },
      });

      expect(Number(updatedTicket?.finalPrice)).toBe(80);
    });

    it("should not be able to delete an extra service as another technician", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const anotherTechnician = await createUser(
        "tecnico",
        "outro@example.com",
      );

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const ticketService = await prisma.ticketService.create({
        data: {
          ticketId: ticket.id,
          name: "Limpeza interna",
          price: 50,
        },
      });

      const token = await login(anotherTechnician.email);

      const response = await request(app)
        .delete(`/tickets/${ticket.id}/${ticketService.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should not be able to delete an extra service as a client", async () => {
      const client = await createUser("cliente", "cliente@example.com");

      const technician = await createUser("tecnico", "tecnico@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const ticketService = await prisma.ticketService.create({
        data: {
          ticketId: ticket.id,
          name: "Limpeza interna",
          price: 50,
        },
      });

      const token = await login(client.email);

      const response = await request(app)
        .delete(`/tickets/${ticket.id}/${ticketService.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it("should return 404 when the ticket does not exist", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const token = await login(technician.email);

      const response = await request(app)
        .delete("/tickets/999999/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Ticket not found");
    });

    it("should return 404 when the extra service does not exist", async () => {
      const technician = await createUser("tecnico", "tecnico@example.com");

      const client = await createUser("cliente", "cliente@example.com");

      const service = await createService();
      const ticket = await createTicket(client.id, service.id);

      await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          technicianId: technician.id,
        },
      });

      const token = await login(technician.email);

      const response = await request(app)
        .delete(`/tickets/${ticket.id}/999999`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Service not found");
    });
  });
});
