import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { hash, compare } from "bcrypt";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.email(),
      password: z.string().min(6),
    });
    const { name, email, password } = bodySchema.parse(request.body);

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AppError("User with same email already exists");
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return response.status(201).json(userWithoutPassword);
  }

  async update(request: Request, response: Response) {
    const bodySchema = z
      .object({
        name: z.string().trim().min(2).optional(),
        email: z.email().optional(),
        oldPassword: z.string().optional(),
        password: z.string().min(6).optional(),
      })
      .refine((data) => !data.password || !!data.oldPassword, {
        message: "Informe a senha atual para definir uma nova senha",
        path: ["oldPassword"],
      });

    const { name, email, oldPassword, password } = bodySchema.parse(
      request.body,
    );

    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (userWithSameEmail && userWithSameEmail.id !== request.user.id) {
        throw new AppError("User with same email already exists");
      }
    }

    if (password) {
      const passwordMatches = await compare(oldPassword!, user.password);
      if (!passwordMatches) {
        throw new AppError("Current password does not match");
      }
    }

    const hashedPassword = password ? await hash(password, 8) : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: request.user.id },
      data: { name, email, password: hashedPassword },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return response.json(userWithoutPassword);
  }

  async delete(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    await prisma.user.delete({
      where: {
        id: request.user.id,
      },
    });

    return response.status(204).send();
  }
}

export { UsersController };
