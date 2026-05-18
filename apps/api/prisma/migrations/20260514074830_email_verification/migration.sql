CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('soccer', 'basketball', 'volleyball', 'spikeball');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('beginner', 'intermediate', 'competitive');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('open', 'men', 'women', 'mixed');

-- CreateEnum
CREATE TYPE "RecurringType" AS ENUM ('one_off', 'weekly', 'fortnightly');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('open', 'full', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'email_verified', 'phone_verified', 'id_verified', 'fully_verified');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "suburb" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerifyToken" TEXT,
    "emailVerifyExpiry" TIMESTAMP(3),
    "phoneOtpExpiry" TIMESTAMP(3),

);

CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    CREATE EXTENSION IF NOT EXISTS postgis;
    "title" TEXT NOT NULL,
    "skillLevel" "SkillLevel" NOT NULL,
    "gender" "Gender" NOT NULL,
    "recurring" "RecurringType" NOT NULL DEFAULT 'one_off',
    "lat" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "costPerPlayer" INTEGER NOT NULL DEFAULT 0,
    "equipmentNotes" TEXT,
    "description" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'open',
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMember" (
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameMember_pkey" PRIMARY KEY ("gameId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Game_lat_lng_idx" ON "Game"("lat", "lng");

-- CreateIndex
CREATE INDEX "Game_sport_idx" ON "Game"("sport");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "Game_dateTime_idx" ON "Game"("dateTime");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMember" ADD CONSTRAINT "GameMember_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMember" ADD CONSTRAINT "GameMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
