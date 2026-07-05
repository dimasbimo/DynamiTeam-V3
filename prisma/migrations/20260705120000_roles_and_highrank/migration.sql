-- Tambah kolom role baru (nullable, non-destruktif; roleSquad lama tetap)
ALTER TABLE "Member" ADD COLUMN "mainRole" TEXT;
ALTER TABLE "Member" ADD COLUMN "subRole" TEXT;

-- Tabel leaderboard highrank
CREATE TABLE "HighrankEntry" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "rankName" TEXT NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,
    "season" TEXT,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HighrankEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HighrankEntry_memberId_key" ON "HighrankEntry"("memberId");
ALTER TABLE "HighrankEntry" ADD CONSTRAINT "HighrankEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
