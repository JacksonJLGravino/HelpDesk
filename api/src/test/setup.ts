import { beforeEach } from "vitest";

import { prisma } from "@/database/prisma";

beforeEach(async () => {
  await prisma.ticketService.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.technicianAvailability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);
