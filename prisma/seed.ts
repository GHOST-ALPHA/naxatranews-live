// @ts-nocheck

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import pg from "pg";
import crypto from "crypto";

const prisma = new PrismaClient();

// Generate stable UUID v5-like from slug (deterministic)
function stableUuidFromSlug(slug: string): string {
  const namespace = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // DNS namespace UUID
  const hash = crypto
    .createHash("sha1")
    .update(namespace + slug)
    .digest();

  // Format as UUID v5
  const bytes = Array.from(hash);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // Version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

  return [
    bytes.slice(0, 4).map(b => b.toString(16).padStart(2, "0")).join(""),
    bytes.slice(4, 6).map(b => b.toString(16).padStart(2, "0")).join(""),
    bytes.slice(6, 8).map(b => b.toString(16).padStart(2, "0")).join(""),
    bytes.slice(8, 10).map(b => b.toString(16).padStart(2, "0")).join(""),
    bytes.slice(10, 16).map(b => b.toString(16).padStart(2, "0")).join(""),
  ].join("-");
}

/**
 * Database Seed Script
 * Initializes the database with default roles, permissions, menus, and superadmin user
 */
async function main() {
  console.log("🌱 Seeding database...");

  // Create default permissions
  const permissions = [
    // User permissions
    { name: "Create User", slug: "user.create", resource: "user", action: "create" },
    { name: "Read User", slug: "user.read", resource: "user", action: "read" },
    { name: "Update User", slug: "user.update", resource: "user", action: "update" },
    { name: "Delete User", slug: "user.delete", resource: "user", action: "delete" },
    // Role permissions
    { name: "Create Role", slug: "role.create", resource: "role", action: "create" },
    { name: "Read Role", slug: "role.read", resource: "role", action: "read" },
    { name: "Update Role", slug: "role.update", resource: "role", action: "update" },
    { name: "Delete Role", slug: "role.delete", resource: "role", action: "delete" },
    // Permission permissions
    { name: "Create Permission", slug: "permission.create", resource: "permission", action: "create" },
    { name: "Read Permission", slug: "permission.read", resource: "permission", action: "read" },
    { name: "Update Permission", slug: "permission.update", resource: "permission", action: "update" },
    { name: "Delete Permission", slug: "permission.delete", resource: "permission", action: "delete" },
    // Audit log permissions
    { name: "Read Audit Log", slug: "audit.read", resource: "audit", action: "read" },
    // Blog permissions
    { name: "Create Blog", slug: "blog.create", resource: "blog", action: "create" },
    { name: "Read Own Blog", slug: "blog.read", resource: "blog", action: "read" },
    { name: "Read All Blogs", slug: "blog.read.all", resource: "blog", action: "read.all" },
    { name: "Update Blog", slug: "blog.update", resource: "blog", action: "update" },
    { name: "Delete Blog", slug: "blog.delete", resource: "blog", action: "delete" },
    // News permissions
    { name: "Create News", slug: "news.create", resource: "news", action: "create" },
    { name: "Read Own News", slug: "news.read", resource: "news", action: "read" },
    { name: "Read All News", slug: "news.read.all", resource: "news", action: "read.all" },
    { name: "Update News", slug: "news.update", resource: "news", action: "update" },
    { name: "Delete News", slug: "news.delete", resource: "news", action: "delete" },
    { name: "Submit News", slug: "news.submit", resource: "news", action: "submit" },
    { name: "Review News", slug: "news.review", resource: "news", action: "review" },
    { name: "Approve News", slug: "news.approve", resource: "news", action: "approve" },
    { name: "Reject News", slug: "news.reject", resource: "news", action: "reject" },
    { name: "Publish News", slug: "news.publish", resource: "news", action: "publish" },
    // Media permissions
    { name: "Upload Media", slug: "media.upload", resource: "media", action: "upload" },
    { name: "Read Own Media", slug: "media.read", resource: "media", action: "read" },
    { name: "Read All Media", slug: "media.read.all", resource: "media", action: "read.all" },
    { name: "Delete Media", slug: "media.delete", resource: "media", action: "delete" },
    // Advertisement permissions
    { name: "Create Advertisement", slug: "advertisement.create", resource: "advertisement", action: "create" },
    { name: "Read Own Advertisement", slug: "advertisement.read", resource: "advertisement", action: "read" },
    { name: "Read All Advertisement", slug: "advertisement.read.all", resource: "advertisement", action: "read.all" },
    { name: "Update Advertisement", slug: "advertisement.update", resource: "advertisement", action: "update" },
    { name: "Delete Advertisement", slug: "advertisement.delete", resource: "advertisement", action: "delete" },
    // Analytics permissions
    { name: "Read Analytics", slug: "analytics.read", resource: "analytics", action: "read" },
    // Menu permissions
    { name: "Create Menu", slug: "menu.create", resource: "menu", action: "create" },
    { name: "Read Menu", slug: "menu.read", resource: "menu", action: "read" },
    { name: "Update Menu", slug: "menu.update", resource: "menu", action: "update" },
    { name: "Delete Menu", slug: "menu.delete", resource: "menu", action: "delete" },
  ];

  console.log("📝 Creating permissions...");
  const createdPermissions = [];
  for (const perm of permissions) {
    const existing = await prisma.permission.findUnique({
      where: { slug: perm.slug },
    });
    if (!existing) {
      const created = await prisma.permission.create({
        data: perm,
      });
      createdPermissions.push(created);
      console.log(`  ✓ Created permission: ${perm.slug}`);
    } else {
      createdPermissions.push(existing);
      console.log(`  - Permission already exists: ${perm.slug}`);
    }
  }

  // Create default menus
  console.log("📋 Creating menus...");
  const menus = [
    // Dashboard menus
    { name: "Dashboard", slug: "dashboard", path: "/dashboard", icon: "dashboard", order: 1, isPublic: false },
    { name: "My Blogs", slug: "blogs", path: "/dashboard/blogs", icon: "blogs", order: 2, isPublic: false },
    { name: "Profile", slug: "profile", path: "/dashboard/profile", icon: "profile", order: 3, isPublic: false },
    // News management menus
    { name: "News", slug: "news", path: "/dashboard/news", icon: "news", order: 4, isPublic: false },
    { name: "Media", slug: "media", path: "/dashboard/media", icon: "media", order: 5, isPublic: false },
    { name: "Advertisements", slug: "advertisements", path: "/dashboard/advertisements", icon: "ads", order: 6, isPublic: false },
    { name: "Analytics", slug: "analytics", path: "/dashboard/analytics", icon: "analytics", order: 7, isPublic: false },
    { name: "Menus", slug: "menus", path: "/dashboard/menus", icon: "menu", order: 12, isPublic: false },
    // Admin menus
    { name: "Users", slug: "users", path: "/dashboard/users", icon: "users", order: 8, isPublic: false },
    { name: "Roles", slug: "roles", path: "/dashboard/roles", icon: "roles", order: 9, isPublic: false },
    { name: "Permissions", slug: "permissions", path: "/dashboard/permissions", icon: "permissions", order: 10, isPublic: false },
    { name: "Audit Logs", slug: "logs", path: "/dashboard/logs", icon: "logs", order: 11, isPublic: false },
  ];

  const createdMenus = [];
  for (const menu of menus) {
    const existing = await prisma.menu.findUnique({
      where: { slug: menu.slug },
    });
    if (!existing) {
      const created = await prisma.menu.create({
        data: menu,
      });
      createdMenus.push(created);
      console.log(`  ✓ Created menu: ${menu.name}`);
    } else {
      createdMenus.push(existing);
      console.log(`  - Menu already exists: ${menu.name}`);
    }
  }

  /**
   * Legacy categories (old platform) -> Prisma `Menu`
   * Requirement: slug and path same.
   * Read from OLD_DATABASE_URL and create Menu entries with stable UUIDs based on slug.
   */
  console.log("🗂️  Migrating legacy categories from old DB as menus...");
  const oldDbUrl = process.env.OLD_DATABASE_URL;

  if (!oldDbUrl) {
    console.log("  ⚠️  OLD_DATABASE_URL not set, skipping legacy category migration");
  } else {
    try {
      const oldPool = new pg.Pool({ connectionString: oldDbUrl });

      // Fetch all categories from old DB
      const oldCategoriesRes = await oldPool.query<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        parent_id: number | null;
        sort_order: number | null;
        icon: string | null;
        is_active: boolean | null;
      }>(`
        SELECT id, name, slug, description, parent_id, sort_order, icon, is_active
        FROM categories
        ORDER BY sort_order, id
      `);

      const oldCategories = oldCategoriesRes.rows;
      console.log(`  📦 Found ${oldCategories.length} categories in old DB`);

      // Map: old category ID -> new Menu UUID (by slug)
      const legacyMenuIdByOldId = new Map<number, string>();
      const slugToMenuId = new Map<string, string>();

      // First pass: create all menus with stable UUIDs from slugs
      for (const cat of oldCategories) {
        const stableId = stableUuidFromSlug(cat.slug);
        const created = await prisma.menu.upsert({
          where: { slug: cat.slug },
          create: {
            id: stableId,
            name: cat.name,
            slug: cat.slug,
            path: cat.slug, // requirement: slug and path same
            icon: cat.icon ?? undefined,
            order: cat.sort_order ?? 0,
            isActive: cat.is_active ?? true,
            isPublic: true,
          },
          update: {
            name: cat.name,
            path: cat.slug,
            icon: cat.icon ?? undefined,
            order: cat.sort_order ?? 0,
            isActive: cat.is_active ?? true,
            isPublic: true,
          },
        });
        legacyMenuIdByOldId.set(cat.id, created.id);
        slugToMenuId.set(cat.slug, created.id);
        console.log(`  ✓ Category: ${cat.slug} -> ${created.id}`);
      }

      // Second pass: set parentId (requires parents to exist)
      for (const cat of oldCategories) {
        if (!cat.parent_id) continue;
        const parentId = legacyMenuIdByOldId.get(cat.parent_id);
        const childId = legacyMenuIdByOldId.get(cat.id);
        if (!parentId || !childId) {
          console.log(`  ⚠️  Skipped parent link: cat ${cat.id} -> parent ${cat.parent_id} (missing)`);
          continue;
        }

        await prisma.menu.update({
          where: { id: childId },
          data: { parentId },
        });
        console.log(`  ✓ Linked parent: ${cat.slug} -> parent`);
      }

      await oldPool.end();
      console.log(`  ✅ Migrated ${oldCategories.length} categories`);
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate legacy categories: ${err.message}`);
      console.error(`  ⚠️  Continuing without legacy categories...`);
    }
  }

  // Create superadmin role
  console.log("👑 Creating superadmin role...");
  let superadminRole = await prisma.role.findUnique({
    where: { slug: "superadmin" },
  });

  if (!superadminRole) {
    superadminRole = await prisma.role.create({
      data: {
        name: "Super Admin",
        slug: "superadmin",
        description: "Super administrator with full system access",
        isActive: true,
      },
    });
    console.log("  ✓ Created superadmin role");
  } else {
    console.log("  - Superadmin role already exists");
  }

  // Assign all permissions and menus to superadmin
  await prisma.rolePermission.deleteMany({
    where: { roleId: superadminRole.id },
  });
  await prisma.roleMenu.deleteMany({
    where: { roleId: superadminRole.id },
  });

  await prisma.rolePermission.createMany({
    data: createdPermissions.map((perm) => ({
      roleId: superadminRole!.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  await prisma.roleMenu.createMany({
    data: createdMenus.map((menu) => ({
      roleId: superadminRole!.id,
      menuId: menu.id,
    })),
    skipDuplicates: true,
  });

  console.log("  ✓ Assigned all permissions and menus to superadmin");

  // Create citizen role
  console.log("👤 Creating citizen role...");
  let citizenRole = await prisma.role.findUnique({
    where: { slug: "citizen" },
  });

  if (!citizenRole) {
    citizenRole = await prisma.role.create({
      data: {
        name: "Citizen",
        slug: "citizen",
        description: "Default role for registered users",
        isActive: true,
      },
    });
    console.log("  ✓ Created citizen role");
  } else {
    console.log("  - Citizen role already exists");
  }

  // Assign blog permissions to citizen role
  const blogPermissions = createdPermissions.filter(
    (p) => p.slug.startsWith("blog.")
  );

  await prisma.rolePermission.deleteMany({
    where: { roleId: citizenRole.id },
  });
  await prisma.roleMenu.deleteMany({
    where: { roleId: citizenRole.id },
  });

  // Citizen can create and manage their own blogs
  const citizenBlogPerms = blogPermissions.filter(
    (p) => p.slug === "blog.create" || p.slug === "blog.read" || p.slug === "blog.update" || p.slug === "blog.delete"
  );

  await prisma.rolePermission.createMany({
    data: citizenBlogPerms.map((perm) => ({
      roleId: citizenRole!.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  // Assign blogs and profile menus to citizen
  const citizenMenus = createdMenus.filter(
    (m) => m.slug === "blogs" || m.slug === "profile" || m.slug === "dashboard"
  );

  await prisma.roleMenu.createMany({
    data: citizenMenus.map((menu) => ({
      roleId: citizenRole!.id,
      menuId: menu.id,
    })),
    skipDuplicates: true,
  });

  console.log("  ✓ Assigned blog permissions and menus to citizen role");

  // Create Author role
  console.log("✍️ Creating Author role...");
  let authorRole = await prisma.role.findUnique({
    where: { slug: "author" },
  });

  if (!authorRole) {
    authorRole = await prisma.role.create({
      data: {
        name: "Author",
        slug: "author",
        description: "Can create and manage own news posts",
        isActive: true,
      },
    });
    console.log("  ✓ Created Author role");
  } else {
    console.log("  - Author role already exists");
  }

  // Assign news permissions to Author (only own posts)
  const authorNewsPerms = createdPermissions.filter(
    (p) =>
      p.slug === "news.create" ||
      p.slug === "news.read" ||
      p.slug === "news.update" ||
      p.slug === "news.delete" ||
      p.slug === "news.submit" ||
      p.slug === "news.publish"
  );

  await prisma.rolePermission.deleteMany({
    where: { roleId: authorRole.id },
  });
  await prisma.roleMenu.deleteMany({
    where: { roleId: authorRole.id },
  });

  await prisma.rolePermission.createMany({
    data: authorNewsPerms.map((perm) => ({
      roleId: authorRole!.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  // Assign menus to Author
  const authorMenus = createdMenus.filter(
    (m) => m.slug === "dashboard" || m.slug === "news" || m.slug === "media" || m.slug === "profile"
  );

  await prisma.roleMenu.createMany({
    data: authorMenus.map((menu) => ({
      roleId: authorRole!.id,
      menuId: menu.id,
    })),
    skipDuplicates: true,
  });

  console.log("  ✓ Assigned news permissions and menus to Author role");

  // Create Contributor role (needs approval before publish)
  console.log("📝 Creating Contributor role...");
  let contributorRole = await prisma.role.findUnique({
    where: { slug: "contributor" },
  });

  if (!contributorRole) {
    contributorRole = await prisma.role.create({
      data: {
        name: "Contributor",
        slug: "contributor",
        description: "Can create and manage own news; publish requires reviewer approval",
        isActive: true,
      },
    });
    console.log("  ✓ Created Contributor role");
  } else {
    console.log("  - Contributor role already exists");
  }

  const contributorNewsPerms = createdPermissions.filter(
    (p) =>
      p.slug === "news.create" ||
      p.slug === "news.read" ||
      p.slug === "news.update" ||
      p.slug === "news.delete" ||
      p.slug === "news.submit"
  );

  await prisma.rolePermission.deleteMany({
    where: { roleId: contributorRole.id },
  });
  await prisma.roleMenu.deleteMany({
    where: { roleId: contributorRole.id },
  });

  await prisma.rolePermission.createMany({
    data: contributorNewsPerms.map((perm) => ({
      roleId: contributorRole!.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  const contributorMenus = createdMenus.filter(
    (m) => m.slug === "dashboard" || m.slug === "news" || m.slug === "media" || m.slug === "profile"
  );

  await prisma.roleMenu.createMany({
    data: contributorMenus.map((menu) => ({
      roleId: contributorRole!.id,
      menuId: menu.id,
    })),
    skipDuplicates: true,
  });

  console.log("  ✓ Assigned news permissions and menus to Contributor role");

  // Create Editor role
  console.log("✏️ Creating Editor role...");
  let editorRole = await prisma.role.findUnique({
    where: { slug: "editor" },
  });

  if (!editorRole) {
    editorRole = await prisma.role.create({
      data: {
        name: "Editor",
        slug: "editor",
        description: "Can create, edit, and manage all news posts",
        isActive: true,
      },
    });
    console.log("  ✓ Created Editor role");
  } else {
    console.log("  - Editor role already exists");
  }

  // Assign news permissions to Editor (all posts)
  const editorNewsPerms = createdPermissions.filter(
    (p) => p.slug.startsWith("news.")
  );

  await prisma.rolePermission.deleteMany({
    where: { roleId: editorRole.id },
  });
  await prisma.roleMenu.deleteMany({
    where: { roleId: editorRole.id },
  });

  await prisma.rolePermission.createMany({
    data: editorNewsPerms.map((perm) => ({
      roleId: editorRole!.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  // Assign media permissions to Editor
  const editorMediaPerms = createdPermissions.filter(
    (p) => p.slug.startsWith("media.")
  );

  await prisma.rolePermission.createMany({
    data: editorMediaPerms.map((perm) => ({
      roleId: editorRole!.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  // Assign analytics permission to Editor
  const editorAnalyticsPerm = createdPermissions.find(
    (p) => p.slug === "analytics.read"
  );
  if (editorAnalyticsPerm) {
    await prisma.rolePermission.create({
      data: {
        roleId: editorRole.id,
        permissionId: editorAnalyticsPerm.id,
      },
    });
  }

  // Assign menu permissions to Editor
  const editorMenuPerms = createdPermissions.filter(
    (p) => p.slug.startsWith("menu.")
  );

  await prisma.rolePermission.createMany({
    data: editorMenuPerms.map((perm) => ({
      roleId: editorRole!.id,
      permissionId: perm.id,
    })),
    skipDuplicates: true,
  });

  // Assign menus to Editor
  const editorMenus = createdMenus.filter(
    (m) => m.slug === "dashboard" || m.slug === "news" || m.slug === "media" ||
      m.slug === "analytics" || m.slug === "profile" || m.slug === "menus"
  );

  await prisma.roleMenu.createMany({
    data: editorMenus.map((menu) => ({
      roleId: editorRole!.id,
      menuId: menu.id,
    })),
    skipDuplicates: true,
  });

  console.log("  ✓ Assigned news, media, and analytics permissions to Editor role");

  /**
   * Legacy users (old platform) -> Prisma `User`
   * Requirement: default password for all is '<username>@naxatra'
   * Safety: do NOT overwrite password if user already exists (migration without affect).
   * Also: ensure all legacy users have the Editor role.
   */
  console.log("👥 Upserting legacy users (assigning Editor role)...");
  const legacyUsers = [
    {
      id: "3ff06899-ca99-42e7-9dc4-6dd0f6f51c9f",
      username: "adarshrathorexavirian@gmail.com",
      email: "adarshrathorexavirian@gmail.com",
      firstName: "Adarsh",
      lastName: "Rathore",
      isActive: true,
      isEmailVerified: true,
    },
    {
      id: "5d7e3b91-e708-425f-a214-ae7744dc56e5",
      username: "priyankasingh",
      email: "priyankasingh@naxatraindia.com",
      firstName: "Priyanka",
      lastName: "Singh",
      isActive: true,
      isEmailVerified: false,
    },
    {
      id: "65f1ecf8-c2fb-4073-a4ff-07752f70f3a2",
      username: "sachinkumar",
      email: "sachinkumar01216@gmail.com",
      firstName: "sachin",
      lastName: "kumar",
      isActive: true,
      isEmailVerified: false,
    },
    {
      id: "afc4e8ca-9e5f-4a32-b906-b6504263d797",
      username: "live.tarapur",
      email: "live.tarapur@gmail.com",
      firstName: "SUMIT",
      lastName: "KUMAR",
      isActive: false, // pending -> inactive
      isEmailVerified: false,
    },
    {
      id: "e89eb299-2e99-457b-8fb5-cd8f2147b51c",
      username: "archugul",
      email: "archugul@gmail.com",
      firstName: "Archana",
      lastName: "Gulshan",
      isActive: true,
      isEmailVerified: true,
    },
    {
      id: "f38663bb-4194-48ec-a0e3-09125253f83f",
      username: "priyankatiwary",
      email: "priyankatiwary@naxatraindia.com",
      firstName: "Priyanka",
      lastName: "Tiwary",
      isActive: false, // suspended -> inactive
      isEmailVerified: false,
    },
    {
      id: "fce5e11c-ef86-4e7e-baee-641c45fb120d",
      username: "samirranjan",
      email: "samirranjan@naxatraindia.com",
      firstName: "Samir",
      lastName: "Ranjan",
      isActive: true,
      isEmailVerified: false,
    },
    {
      id: "ff21b5bb-1647-4181-82f9-7e2bf3306e5d",
      username: "alokpathak",
      email: "alokpathak@naxatraindia.com",
      firstName: "Alok",
      lastName: "Pathak",
      isActive: true,
      isEmailVerified: false,
    },
  ];

  for (const u of legacyUsers) {
    const defaultPassword = `${u.username}@naxatra`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Upsert by email (unique). Preserve existing password if already set.
    const existing = await prisma.user.findUnique({ where: { email: u.email } });

    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id: u.id,
        email: u.email,
        username: u.username,
        password: hashedPassword,
        firstName: u.firstName ?? undefined,
        lastName: u.lastName ?? undefined,
        isActive: u.isActive ?? true,
        isEmailVerified: u.isEmailVerified ?? false,
        provider: "credentials",
      },
      update: {
        username: u.username,
        firstName: u.firstName ?? undefined,
        lastName: u.lastName ?? undefined,
        isActive: u.isActive ?? true,
        isEmailVerified: u.isEmailVerified ?? false,
        // Only set password if missing (do not affect existing users)
        ...(existing?.password ? {} : { password: hashedPassword }),
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: editorRole.id } },
      create: { userId: user.id, roleId: editorRole.id },
      update: {},
    });

    console.log(`  ✓ Legacy user: ${u.email} -> editor role (password: ${u.username}@naxatra)`);
  }

  // Create default admin user
  console.log("👤 Creating default admin user...");
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        isActive: true,
        isEmailVerified: true,
        provider: "credentials",
      },
    });

    // Assign superadmin role
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: superadminRole.id,
      },
    });

    console.log("  ✓ Created admin user");
    console.log(`  📧 Email: ${adminEmail}`);
    console.log(`  👤 Username: ${adminUsername}`);
    console.log(`  🔑 Password: ${adminPassword}`);
    console.log("  ⚠️  Please change the default password after first login!");
  } else {
    console.log("  - Admin user already exists");
  }

  // Seed demo users for workflow testing
  console.log("👥 Creating demo users (author/reviewer/contributor/editor)...");
  const demoUsers = [
    {
      email: "author@example.com",
      username: "author",
      firstName: "Author",
      lastName: "User",
      roleId: authorRole.id,
    },
    {
      email: "contributor@example.com",
      username: "contributor",
      firstName: "Connie",
      lastName: "Writer",
      roleId: contributorRole.id,
    },
    {
      email: "editor@example.com",
      username: "editor",
      firstName: "Edit",
      lastName: "Chief",
      roleId: editorRole.id,
    },
  ];

  for (const demo of demoUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: demo.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("Password@123", 10);
      const user = await prisma.user.create({
        data: {
          email: demo.email,
          username: demo.username,
          password: hashedPassword,
          firstName: demo.firstName,
          lastName: demo.lastName,
          isActive: true,
          isEmailVerified: true,
          provider: "credentials",
        },
      });

      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: demo.roleId,
        },
      });

      console.log(`  ✓ Created demo user: ${demo.email} (role assigned)`);
    } else {
      console.log(`  - Demo user already exists: ${demo.email}`);
    }
  }

  // Seed sample news to illustrate contributor vs author flow
  console.log("📰 Creating sample news items...");
  const sampleNews = [
    {
      slug: "local-fair-awaits-approval",
      title: "Local Fair Awaits Approval",
      content: "Contributor submitted this story and it is pending approval.",
      authorEmail: "contributor@example.com",
      status: "PENDING",
      isPublished: false,
    },
    {
      slug: "city-parade-live",
      title: "City Parade Goes Live",
      content: "Author published this directly without review.",
      authorEmail: "author@example.com",
      status: "PUBLISHED",
      isPublished: true,
    },
  ];

  for (const news of sampleNews) {
    const existingNews = await prisma.news.findUnique({
      where: { slug: news.slug },
    });

    if (!existingNews) {
      const authorUser = await prisma.user.findUnique({
        where: { email: news.authorEmail },
      });

      if (!authorUser) {
        console.log(`  ⚠️  Skipped news '${news.slug}' because author user missing.`);
        continue;
      }

      await prisma.news.create({
        data: {
          slug: news.slug,
          title: news.title,
          content: news.content,
          authorId: authorUser.id,
          status: news.status,
          isPublished: news.isPublished,
          publishedAt: news.isPublished ? new Date() : null,
          isActive: true,
          excerpt: null,
        },
      });

      console.log(`  ✓ Created sample news: ${news.slug} (status ${news.status})`);
    } else {
      console.log(`  - Sample news already exists: ${news.slug}`);
    }
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

