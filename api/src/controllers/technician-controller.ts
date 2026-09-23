import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";

class TechnicianController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.email(),
      password: z.string().min(6),
      workTime: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
    });

    const { name, email, password, workTime } = bodySchema.parse(request.body);

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("User with same email already exists");
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "tecnico",
        },
      });

      await tx.technicianAvailability.create({
        data: {
          technicianId: user.id,
          workTime,
        },
      });

      return user;
    });

    const { password: _, ...userWithoutPassword } = user;

    return response.status(201).json(userWithoutPassword);
  }

  async index(request: Request, response: Response) {
    const technician = await prisma.user.findMany({
      where: {
        role: "tecnico",
      },
      select: {
        id: true,
        name: true,
        email: true,
        img: true,
        availability: {
          select: {
            workTime: true,
          },
        },
      },
    });

    return response.json(technician);
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      name: z.string().trim().min(2).optional(),
      email: z.email().optional(),
      workTime: z.array(z.string().regex(/^\d{2}:\d{2}$/)).optional(),
    });

    const { id } = paramsSchema.parse(request.params);
    const { name, email, workTime } = bodySchema.parse(request.body);

    const technician = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        availability: true,
      },
    });

    if (!technician || technician.role !== "tecnico") {
      throw new AppError("Technician not found", 404);
    }

    if (email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithSameEmail && userWithSameEmail.id !== technician.id) {
        throw new AppError("User with same email already exists");
      }
    }

    const technicianWithUpdatedAvailability = await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            name,
            email,
          },
        });

        if (workTime) {
          await tx.technicianAvailability.update({
            where: {
              technicianId: id,
            },
            data: {
              workTime,
            },
          });
        }

        return tx.user.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
            email: true,
            img: true,
            role: true,
            availability: {
              select: {
                workTime: true,
              },
            },
          },
        });
      },
    );

    return response.json(technicianWithUpdatedAvailability);
  }

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const technician = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        img: true,
        availability: {
          select: {
            workTime: true,
          },
        },
      },
    });

    if (!technician || technician.availability === null) {
      throw new AppError("Technician not found", 404);
    }

    return response.json(technician);
  }
}

export { TechnicianController };
