import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class ClientController {
  async index(request: Request, response: Response) {
    const clients = await prisma.user.findMany({
      where: { role: "cliente" },
      select: {
        id: true,
        name: true,
        email: true,
        img: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return response.json(clients);
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      name: z.string().trim().min(2).optional(),
      email: z.email().optional(),
    });

    const { id } = paramsSchema.parse(request.params);
    const { name, email } = bodySchema.parse(request.body);

    const client = await prisma.user.findUnique({
      where: {
        id,
        role: "cliente",
      },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    if (email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithSameEmail && userWithSameEmail.id !== client.id) {
        throw new AppError("User with same email already exists");
      }
    }

    await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    return response.json();
  }

  async delete(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const client = await prisma.user.findUnique({
      where: {
        id,
        role: "cliente",
      },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return response.status(204).send();
  }
}

export { ClientController };
