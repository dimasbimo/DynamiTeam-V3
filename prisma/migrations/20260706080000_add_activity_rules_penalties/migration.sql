-- Tambah pengaturan activity mingguan dan hukuman tambahan target activity.
-- Non-destruktif: tidak menghapus atau mengubah data lama.

CREATE TABLE "ActivityRule" (
    "id" TEXT NOT NULL,
    "safePoint" INTEGER NOT NULL DEFAULT 1500,
    "bonusPoint" INTEGER NOT NULL DEFAULT 3000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityPenalty" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "extraPoint" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityPenalty_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ActivityPenalty_memberId_idx" ON "ActivityPenalty"("memberId");
CREATE INDEX "ActivityPenalty_isActive_idx" ON "ActivityPenalty"("isActive");

ALTER TABLE "ActivityPenalty" ADD CONSTRAINT "ActivityPenalty_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
