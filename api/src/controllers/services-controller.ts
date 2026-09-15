import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";

class ServicesController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      title: z.string().trim().min(2),
      price: z.number().positive(),
    });

    const { title, price } = bodySchema.parse(request.body);

    const service = await prisma.service.create({
      data: {
        title,
        price,
      },
    });

    return response.status(201).json(service);
  }

  async available(request: Request, response: Response) {
    const services = await prisma.service.findMany({
      where: {
        status: "ativo",
      },
    });

    return response.json(services);
  }

  async index(request: Request, response: Response) {
    const services = await prisma.service.findMany();

    return response.json(services);
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive(),
    });
    const bodySchema = z.object({
      title: z.string().trim().min(2).optional(),
      price: z.number().positive().optional(),
      status: z.enum(["ativo", "inativo"]).optional(),
    });

    const { id } = paramsSchema.parse(request.params);
    const { title, price, status } = bodySchema.parse(request.body);

    const service = await prisma.service.update({
      data: {
        title,
        price,
        status,
      },
      where: {
        id,
      },
    });

    return response.json(service);
  }
}

export { ServicesController };
