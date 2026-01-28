-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "reviewComment" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewerId" TEXT,
ADD COLUMN     "status" "NewsStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "news_reviewerId_idx" ON "news"("reviewerId");

-- CreateIndex
CREATE INDEX "news_status_idx" ON "news"("status");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
