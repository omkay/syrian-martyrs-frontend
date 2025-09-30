-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ContributionType" ADD VALUE 'PROFILE_CREATION';
ALTER TYPE "public"."ContributionType" ADD VALUE 'PROFILE_UPDATE';
ALTER TYPE "public"."ContributionType" ADD VALUE 'PROFILE_VERIFICATION';

-- AlterTable
ALTER TABLE "public"."contributions" ADD COLUMN     "profileId" TEXT;

-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."contributions" ADD CONSTRAINT "contributions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
