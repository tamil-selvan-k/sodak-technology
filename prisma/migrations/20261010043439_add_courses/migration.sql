-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "level" "CourseLevel",
    "duration" TEXT,
    "coverImageUrl" TEXT,
    "descriptionHtml" TEXT,
    "outcomes" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_isPublished_deletedAt_idx" ON "courses"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "courses_category_isPublished_idx" ON "courses"("category", "isPublished");

-- CreateIndex
CREATE INDEX "courses_displayOrder_idx" ON "courses"("displayOrder");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_actorId_createdAt_idx" ON "audit_log"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "blog_posts_status_deletedAt_idx" ON "blog_posts"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_authorId_status_idx" ON "blog_posts"("authorId", "status");

-- CreateIndex
CREATE INDEX "institutions_isPublished_deletedAt_idx" ON "institutions"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "institutions_showOnHome_isPublished_idx" ON "institutions"("showOnHome", "isPublished");

-- CreateIndex
CREATE INDEX "institutions_displayOrder_idx" ON "institutions"("displayOrder");

-- CreateIndex
CREATE INDEX "internships_isPublished_deletedAt_idx" ON "internships"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "internships_createdAt_idx" ON "internships"("createdAt");

-- CreateIndex
CREATE INDEX "job_posts_isPublished_deletedAt_idx" ON "job_posts"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "job_posts_department_isPublished_idx" ON "job_posts"("department", "isPublished");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "media_files_deletedAt_createdAt_idx" ON "media_files"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "photos_isPublished_deletedAt_idx" ON "photos"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "photos_institutionId_isPublished_idx" ON "photos"("institutionId", "isPublished");

-- CreateIndex
CREATE INDEX "programs_isPublished_deletedAt_idx" ON "programs"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "programs_trackCode_isPublished_idx" ON "programs"("trackCode", "isPublished");

-- CreateIndex
CREATE INDEX "trainers_isPublished_deletedAt_idx" ON "trainers"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "trainers_isMentor_isPublished_deletedAt_idx" ON "trainers"("isMentor", "isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "trainers_displayOrder_idx" ON "trainers"("displayOrder");

-- CreateIndex
CREATE INDEX "webinars_isPublished_deletedAt_idx" ON "webinars"("isPublished", "deletedAt");

-- CreateIndex
CREATE INDEX "webinars_scheduledAt_isPublished_idx" ON "webinars"("scheduledAt", "isPublished");
