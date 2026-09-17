import { Request, Response } from "express";

import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { DiskStorage } from "@/provider/disk-storage";

class AvatarController {
  async update(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const file = request.file;

    if (!file) {
      throw new AppError("Avatar file is required");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: request.user.id,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const diskStorage = new DiskStorage();

    try {
      await diskStorage.saveFile(file.filename);

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          img: file.filename,
        },
      });

      if (user.img) {
        await diskStorage.deleteFile(user.img, "upload");
      }

      return response.json({
        img: updatedUser.img,
      });
    } catch (error) {
      await diskStorage.deleteFile(file.filename, "upload");

      throw error;
    }
  }

  async delete(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: request.user.id,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.img) {
      const diskStorage = new DiskStorage();

      await diskStorage.deleteFile(user.img, "upload");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        img: null,
      },
    });

    return response.status(204).send();
  }
}

export { AvatarController };
