import { PrismaClient, NewsStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import pg from "pg";

type OldUserRow = {
  id: string;
  username: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  status: string | null; // active/inactive/suspended/pending
  email_verified: boolean | null;
};

type OldMediaRow = {
  id: string;
  file_path: string;
  file_url: string | null;
  filename: string | null;
  original_filename: string | null;
};

type OldCategoryRow = {
  id: number;
  slug: string;
};

type OldContentRow = Record<string, any>;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function getTableColumns(
  pool: pg.Pool,
  tableName: string
): Promise<Set<string>> {
  const res = await pool.query<{ column_name: string }>(
    `
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = $1
    `,
    [tableName]
  );
  return new Set(res.rows.map((r) => r.column_name));
}

function mapOldStatusToNewsStatus(oldStatus: string | null): NewsStatus {
  switch ((oldStatus ?? "").toLowerCase()) {
    case "published":
      return "PUBLISHED";
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    case "draft":
      return "DRAFT";
    case "review":
      return "PENDING";
    case "archived":
      return "REJECTED";
    default:
      return "PENDING";
  }
}

function safeUsernameFromEmail(email: string): string {
  const u = email.split("@")[0]?.trim();
  return u && u.length > 0 ? u : `user_${Date.now()}`;
}

async function ensureUniqueUsername(
  prisma: PrismaClient,
  desired: string,
  email: string,
  stableSuffix: string
): Promise<string> {
  let candidate = desired;
  // Try a few times in case the suffixed one is also taken
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
    if (existing.email === email) return candidate;
    candidate = `${desired}_${stableSuffix}${i === 0 ? "" : `_${i}`}`;
  }
  // Last resort
  return `${desired}_${stableSuffix}_${Date.now()}`;
}

function fileBasename(pathLike: string): string {
  const s = pathLike.replace(/\\/g, "/");
  const parts = s.split("/");
  return parts[parts.length - 1] || s;
}

function coverImageFromOldMedia(media: OldMediaRow | null): string | null {
  if (!media) return null;
  // Requirement: "/storage/media/uploads/<filename>"
  const candidate =
    media.file_path ||
    media.file_url ||
    media.filename ||
    media.original_filename ||
    null;
  if (!candidate) return null;
  return `/storage/media/uploads/${fileBasename(candidate)}`;
}

async function main() {
  const OLD_DATABASE_URL = requireEnv("OLD_DATABASE_URL");
  const DATABASE_URL = requireEnv("DATABASE_URL");

  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const offsetArg = args.find((a) => a.startsWith("--offset="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 500;
  const offset = offsetArg ? Number(offsetArg.split("=")[1]) : 0;

  console.log("🔁 Migrate old content -> new News");
  console.log(`  - dryRun: ${dryRun}`);
  console.log(`  - limit: ${limit}, offset: ${offset}`);

  const oldPool = new pg.Pool({ connectionString: OLD_DATABASE_URL });
  const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
  });

  try {
    const contentCols = await getTableColumns(oldPool, "content");
    const usersCols = await getTableColumns(oldPool, "users");
    const mediaCols = await getTableColumns(oldPool, "media");
    const categoriesCols = await getTableColumns(oldPool, "categories");

    const wantContentCols = [
      "id",
      "title",
      "slug",
      "excerpt",
      "content_body",
      "content_body_html",
      "status",
      "author_id",
      "editor_id",
      "category_id",
      "is_breaking",
      "is_featured",
      "published_at",
      "scheduled_at",
      "created_at",
      "featured_image_id",
      "meta_title",
      "meta_description",
      "meta_keywords",
      // old DB may not have this:
      "og_image",
    ].filter((c) => contentCols.has(c));

    if (!wantContentCols.includes("id") || !wantContentCols.includes("slug")) {
      throw new Error(
        `Old table 'content' is missing required columns. Found: ${[
          ...contentCols,
        ].join(", ")}`
      );
    }

    // Ensure legacy categories already exist in new DB (seed does this).
    // We still read old categories for id->slug mapping.
    if (!categoriesCols.has("id") || !categoriesCols.has("slug")) {
      throw new Error(
        `Old table 'categories' missing id/slug. Found: ${[
          ...categoriesCols,
        ].join(", ")}`
      );
    }
    const oldCategoriesRes = await oldPool.query<OldCategoryRow>(
      `select id, slug from categories`
    );
    const oldCategorySlugById = new Map<number, string>();
    for (const c of oldCategoriesRes.rows) oldCategorySlugById.set(c.id, c.slug);

    // Fetch batch of content ordered by created_at (stable) then id.
    const contentRes = await oldPool.query<OldContentRow>(
      `
      select
        ${wantContentCols.join(",\n        ")}
      from content
      order by created_at nulls last, id
      limit $1 offset $2
      `,
      [limit, offset]
    );

    console.log(`📦 Fetched ${contentRes.rowCount ?? contentRes.rows.length} content rows`);

    for (const row of contentRes.rows) {
      const status = mapOldStatusToNewsStatus(row.status ?? null);
      const isPublished = status === "PUBLISHED";

      // Author mapping
      let authorUserId: string | null = null;
      if (row.author_id) {
        const wantUserCols = [
          "id",
          "username",
          "email",
          "first_name",
          "last_name",
          "status",
          "email_verified",
        ].filter((c) => usersCols.has(c));
        if (!wantUserCols.includes("id")) {
          throw new Error(`Old table 'users' missing id column`);
        }
        const oldUserRes = await oldPool.query<OldUserRow>(
          `select ${wantUserCols.join(", ")} from users where id = $1`,
          [row.author_id]
        );
        const oldUser = oldUserRes.rows[0] ?? null;

        if (oldUser) {
          const email =
            oldUser.email?.trim() ||
            `${oldUser.username?.trim() || oldUser.id}@naxatra.local`;
          const baseUsername = (oldUser.username?.trim() ||
            safeUsernameFromEmail(email)) as string;
          const stableSuffix = String(oldUser.id).slice(0, 6);
          const username = await ensureUniqueUsername(
            prisma,
            baseUsername,
            email,
            stableSuffix
          );

          if (dryRun) {
            const byEmail = await prisma.user.findUnique({ where: { email } });
            const byId = await prisma.user.findUnique({ where: { id: oldUser.id } });
            console.log(
              `  - DRY author map oldUser=${oldUser.id} email=${email} username=${username} ` +
              `existsByEmail=${byEmail ? "yes" : "no"} existsById=${byId ? "yes" : "no"}`
            );
            authorUserId = byId?.id ?? byEmail?.id ?? null;
          } else {
            // If the user id already exists in new DB, prefer it (do not change existing emails).
            const existingById = await prisma.user.findUnique({
              where: { id: oldUser.id },
            });
            if (existingById) {
              authorUserId = existingById.id;
            } else {
              const hashedPassword = await bcrypt.hash(
                `${username}@naxatra`,
                10
              );

              const existingByEmail = await prisma.user.findUnique({
                where: { email },
              });

              // Upsert by email (unique). Preserve existing password if already set.
              const user = await prisma.user.upsert({
                where: { email },
                create: {
                  id: oldUser.id, // keep same uuid if possible
                  email,
                  username,
                  password: hashedPassword,
                  firstName: oldUser.first_name ?? undefined,
                  lastName: oldUser.last_name ?? undefined,
                  isActive: (oldUser.status ?? "active") === "active",
                  isEmailVerified: oldUser.email_verified ?? false,
                  provider: "credentials",
                },
                update: {
                  username,
                  firstName: oldUser.first_name ?? undefined,
                  lastName: oldUser.last_name ?? undefined,
                  isActive: (oldUser.status ?? "active") === "active",
                  isEmailVerified: oldUser.email_verified ?? false,
                  ...(existingByEmail?.password ? {} : { password: hashedPassword }),
                },
              });
              authorUserId = user.id;
            }
          }
        }
      }

      if (!authorUserId) {
        // Fallback author: use default admin if exists, else skip this news.
        const admin = await prisma.user.findFirst({
          where: { email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com" },
        });
        if (!admin) {
          console.log(`  ⚠️  Skipped '${row.slug}' (missing author and admin)`);
          continue;
        }
        authorUserId = admin.id;
      }

      // Editor mapping (optional)
      let editorUserId: string | null = null;
      if (row.editor_id) {
        const existingEditor = await prisma.user.findUnique({
          where: { id: row.editor_id },
        });
        editorUserId = existingEditor?.id ?? null;
      }

      // Featured image -> coverImage
      let coverImage: string | null = null;
      if (row.featured_image_id) {
        const wantMediaCols = [
          "id",
          "file_path",
          "file_url",
          "filename",
          "original_filename",
        ].filter((c) => mediaCols.has(c));
        if (!wantMediaCols.includes("id")) {
          throw new Error(`Old table 'media' missing id column`);
        }
        const mediaRes = await oldPool.query<OldMediaRow>(
          `select ${wantMediaCols.join(", ")} from media where id = $1`,
          [row.featured_image_id]
        );
        const media = mediaRes.rows[0] ?? null;
        coverImage = coverImageFromOldMedia(media);
      }

      // Lexical JSON preferred
      const contentLexicalJson =
        (row.content_body && String(row.content_body).trim().length > 0
          ? row.content_body
          : null) ?? "";

      // Category -> Menu -> NewsCategory
      const categorySlug =
        row.category_id != null ? oldCategorySlugById.get(row.category_id) : null;

      if (dryRun) {
        console.log(
          `  - DRY '${row.slug}' -> status=${status} cat=${categorySlug ?? "-"} cover=${coverImage ?? "-"}`
        );
        continue;
      }

      // Upsert news by slug (unique). Keep id stable by setting on create.
      const created = await prisma.news.upsert({
        where: { slug: row.slug },
        create: {
          id: row.id,
          slug: row.slug,
          title: row.title,
          content: contentLexicalJson, // store lexical JSON as string in Text
          excerpt: row.excerpt ?? undefined,
          coverImage: coverImage ?? undefined,
          isPublished,
          isActive: true,
          isBreaking: row.is_breaking ?? false,
          isFeatured: row.is_featured ?? false,
          viewCount: 0,
          likes: 0,
          status,
          authorId: authorUserId,
          editorId: editorUserId ?? undefined,
          metaTitle: row.meta_title ?? undefined,
          metaDescription: row.meta_description ?? undefined,
          metaKeywords: row.meta_keywords ?? undefined,
          ogImage: row.og_image ?? undefined,
          publishedAt: isPublished ? row.published_at ?? new Date() : undefined,
          scheduledAt: row.scheduled_at ?? undefined,
          createdAt: row.created_at ?? undefined,
        },
        update: {
          title: row.title,
          content: contentLexicalJson,
          excerpt: row.excerpt ?? undefined,
          coverImage: coverImage ?? undefined,
          isPublished,
          isBreaking: row.is_breaking ?? false,
          isFeatured: row.is_featured ?? false,
          status,
          authorId: authorUserId,
          editorId: editorUserId ?? undefined,
          metaTitle: row.meta_title ?? undefined,
          metaDescription: row.meta_description ?? undefined,
          metaKeywords: row.meta_keywords ?? undefined,
          ogImage: row.og_image ?? undefined,
          publishedAt: isPublished ? row.published_at ?? undefined : undefined,
          scheduledAt: row.scheduled_at ?? undefined,
        },
      });

      if (categorySlug) {
        const menu = await prisma.menu.findUnique({ where: { slug: categorySlug } });
        if (menu) {
          await prisma.newsCategory.upsert({
            where: { newsId_menuId: { newsId: created.id, menuId: menu.id } },
            create: { newsId: created.id, menuId: menu.id },
            update: {},
          });
        } else {
          console.log(`  ⚠️  Category slug '${categorySlug}' not found in Menu table (run seed first?)`);
        }
      }

      console.log(`  ✓ Migrated '${row.slug}'`);
    }

    console.log("✅ Migration finished");
  } finally {
    await oldPool.end().catch(() => { });
    await prisma.$disconnect().catch(() => { });
  }
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});

