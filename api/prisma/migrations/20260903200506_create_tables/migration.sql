-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'tecnico', 'cliente');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('aberto', 'em_atendimento', 'encerrado');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ativo', 'inativo');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'cliente',
    "img" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_availability" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "workTime" TEXT[],

    CONSTRAINT "technician_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "finalPrice" DECIMAL(10,2),
    "status" "TicketStatus" NOT NULL DEFAULT 'aberto',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_services" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "technician_availability_technicianId_key" ON "technician_availability"("technicianId");

-- AddForeignKey
ALTER TABLE "technician_availability" ADD CONSTRAINT "technician_availability_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_services" ADD CONSTRAINT "ticket_services_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
