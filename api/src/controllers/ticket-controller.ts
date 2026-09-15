import { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class TicketsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      title: z.string().trim().min(3),
      description: z.string().trim().optional(),
      serviceId: z.coerce.number().int().positive(),
    });

    const { title, description, serviceId } = bodySchema.parse(request.body);

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service || service.status !== "ativo") {
      throw new AppError("Service not found", 404);
    }

    if (!request.user?.id) {
      throw new AppError("Unauthorized", 401);
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        clientId: request.user.id,
        serviceId: service.id,
        basePrice: service.price,
        finalPrice: service.price,
      },
    });

    return response.status(201).json(ticket);
  }

  async index(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id, role } = request.user;

    const where = {
      ...(role === "cliente" && {
        clientId: id,
      }),

      ...(role === "tecnico" && {
        technicianId: id,
      }),
    };

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    return response.json(tickets);
  }

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({
      ticketId: z.coerce.number().int().positive(),
    });

    const { ticketId } = paramsSchema.parse(request.params);

    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id, role } = request.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        service: true,
        ticketServices: true,
      },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (role === "cliente" && ticket?.clientId !== id) {
      throw new AppError("Unauthorized", 401);
    }

    if (role === "tecnico" && ticket?.technicianId !== id) {
      throw new AppError("Unauthorized", 401);
    }

    response.json(ticket);
  }

  async assignTechnician(request: Request, response: Response) {
    const paramsSchema = z.object({
      ticketId: z.coerce.number().int().positive(),
      technicianId: z.uuid(),
    });

    const { ticketId, technicianId } = paramsSchema.parse(request.params);

    const technician = await prisma.user.findUnique({
      where: {
        id: technicianId,
      },
    });

    if (!technician || technician.role !== "tecnico") {
      throw new AppError("Technician not found", 404);
    }

    const ticketExists = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticketExists) {
      throw new AppError("Ticket not found", 404);
    }

    const ticket = await prisma.ticket.update({
      data: {
        technicianId,
      },
      where: {
        id: ticketId,
      },
    });

    return response.json(ticket);
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      ticketId: z.coerce.number().int().positive(),
    });

    const bodySchema = z.object({
      status: z.enum(["aberto", "em_atendimento", "encerrado"]).optional(),
      services: z
        .array(
          z.object({
            name: z.string().trim().min(2),
            price: z.number().positive(),
          }),
        )
        .optional(),
    });

    const { ticketId } = paramsSchema.parse(request.params);
    const { status, services } = bodySchema.parse(request.body);

    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    if (ticket.technicianId !== request.user.id) {
      throw new AppError("Unauthorized", 401);
    }

    const ticketUpdated = await prisma.$transaction(async (tx) => {
      let finalPrice = Number(ticket.finalPrice ?? ticket.basePrice);

      if (services) {
        for (const service of services) {
          await tx.ticketService.create({
            data: {
              ticketId: ticket.id,
              name: service.name,
              price: service.price,
            },
          });

          finalPrice += service.price;
        }
      }

      return tx.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          status,
          finalPrice,
        },
        include: {
          service: true,
          ticketServices: true,
        },
      });
    });

    return response.json(ticketUpdated);
  }
}

export { TicketsController };
