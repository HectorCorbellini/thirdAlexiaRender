-- CreateEnum
CREATE TYPE "BotPlatform" AS ENUM ('TELEGRAM', 'WHATSAPP', 'DISCORD', 'SLACK');

-- CreateEnum
CREATE TYPE "BotStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR', 'STARTING', 'STOPPING');

-- CreateTable
CREATE TABLE "bots" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" "BotPlatform" NOT NULL,
    "botToken" TEXT NOT NULL,
    "botUsername" TEXT,
    "status" "BotStatus" NOT NULL DEFAULT 'OFFLINE',
    "lastActive" TIMESTAMP(3),
    "config" JSONB NOT NULL DEFAULT '{}',
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bots_businessId_idx" ON "bots"("businessId");

-- CreateIndex
CREATE INDEX "bots_platform_idx" ON "bots"("platform");

-- CreateIndex
CREATE INDEX "bots_status_idx" ON "bots"("status");

-- AddForeignKey
ALTER TABLE "bots" ADD CONSTRAINT "bots_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
