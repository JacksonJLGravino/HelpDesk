-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_clientId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_technicianId_fkey";

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "technicianId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
