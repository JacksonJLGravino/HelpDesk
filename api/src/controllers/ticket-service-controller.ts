import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class TicketServiceController {
  async delete(request: Request, response: Response) {
    const paramsSchema = z.object({
      ticketId: z.coerce.number().int().positive(),
      ticketServiceId: z.coerce.number().int().positive(),
    });

    const { ticketId, ticketServiceId } = paramsSchema.parse(request.params);

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

    const service = await prisma.ticketService.findFirst({
      where: {
        id: ticketServiceId,
        ticketId,
      },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticketService.delete({
        where: {
          id: ticketServiceId,
        },
      });

      const remainingServices = await tx.ticketService.findMany({
        where: {
          ticketId,
        },
      });

      const extrasTotal = remainingServices.reduce(
        (total, item) => total + Number(item.price),
        0,
      );

      await tx.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          finalPrice: Number(ticket.basePrice) + extrasTotal,
        },
      });
    });

    return response.status(204).send();
  }
}

export { TicketServiceController };
