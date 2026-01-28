-- CreateIndex
CREATE INDEX "menus_slug_isPublic_isActive_idx" ON "menus"("slug", "isPublic", "isActive");
