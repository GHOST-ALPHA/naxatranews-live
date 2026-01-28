import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./jwt-server";

/**
 * Permission Management System
 * Handles role-based access control (RBAC) and permission checking
 */

export const SUPERADMIN_ROLE = "superadmin";

/**
 * Get user roles with optimized query (cached)
 * This function is cached per request to avoid duplicate queries
 */
const getUserRolesCached = cache(async (userId: string) => {
  return await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          slug: true,
          isActive: true,
          permissions: {
            where: {
              permission: {
                isActive: true,
              },
            },
            select: {
              permission: {
                select: {
                  slug: true,
                  isActive: true,
                },
              },
            },
          },
        },
      },
    },
  });
});

/**
 * Check if user has a specific permission
 * @param userId - User ID
 * @param permissionSlug - Permission slug to check (e.g., "user.create")
 * @returns Boolean indicating if user has permission
 */
export async function hasPermission(
  userId: string,
  permissionSlug: string
): Promise<boolean> {
  // Use cached function to avoid duplicate queries in the same request
  const userRoles = await getUserRolesCached(userId);

  // Check if user is superadmin
  const isSuperadmin = userRoles.some(
    (ur: any) => ur.role.slug === SUPERADMIN_ROLE && ur.role.isActive
  );

  if (isSuperadmin) return true;

  // Check if user has the specific permission
  for (const userRole of userRoles) {
    if (!userRole.role.isActive) continue;

    const hasPermission = userRole.role.permissions.some(
      (rp: any) => rp.permission.slug === permissionSlug && rp.permission.isActive
    );

    if (hasPermission) return true;
  }

  return false;
}

/**
 * Get user roles with menus (cached)
 */
const getUserRolesWithMenusCached = cache(async (userId: string) => {
  return await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          slug: true,
          isActive: true,
          menus: {
            where: {
              menu: {
                isActive: true,
              },
            },
            select: {
              menu: {
                select: {
                  slug: true,
                  isActive: true,
                },
              },
            },
          },
        },
      },
    },
  });
});

/**
 * Check if user has access to a menu
 * @param userId - User ID
 * @param menuSlug - Menu slug to check
 * @returns Boolean indicating if user has menu access
 */
export async function hasMenuAccess(userId: string, menuSlug: string): Promise<boolean> {
  // Use cached function to avoid duplicate queries
  const userRoles = await getUserRolesWithMenusCached(userId);

  const isSuperadmin = userRoles.some(
    (ur: any) => ur.role.slug === SUPERADMIN_ROLE && ur.role.isActive
  );

  if (isSuperadmin) return true;

  // Check if user's role has access to the menu
  for (const userRole of userRoles) {
    if (!userRole.role.isActive) continue;

    const hasAccess = userRole.role.menus.some(
      (rm: any) => rm.menu.slug === menuSlug && rm.menu.isActive
    );

    if (hasAccess) return true;
  }

  return false;
}

/**
 * Get all permissions for a user (cached)
 * @param userId - User ID
 * @returns Array of permission slugs
 */
export const getUserPermissions = cache(async (userId: string): Promise<string[]> => {
  const userRoles = await getUserRolesCached(userId);

  const isSuperadmin = userRoles.some(
    (ur: any) => ur.role.slug === SUPERADMIN_ROLE && ur.role.isActive
  );

  if (isSuperadmin) {
    // Return all active permissions for superadmin (cached)
    const allPermissions = await prisma.permission.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return allPermissions.map((p: any) => p.slug);
  }

  // Collect unique permissions from user's roles
  const permissions = new Set<string>();
  for (const userRole of userRoles) {
    if (!userRole.role.isActive) continue;

    userRole.role.permissions.forEach((rp: any) => {
      if (rp.permission.isActive) {
        permissions.add(rp.permission.slug);
      }
    });
  }

  return Array.from(permissions);
});

/**
 * Get all accessible menus for a user (cached)
 * @param userId - User ID
 * @returns Array of menu objects
 */
export const getUserMenus = cache(async (userId: string) => {
  const userRoles = await getUserRolesWithMenusCached(userId);

  const isSuperadmin = userRoles.some(
    (ur: any) => ur.role.slug === SUPERADMIN_ROLE && ur.role.isActive
  );

  if (isSuperadmin) {
    // Return all active menus for superadmin (excluding public menus - those are for news categories)
    return await prisma.menu.findMany({
      where: { 
        isActive: true,
        isPublic: false, // Dashboard should not show public menus (news categories)
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        path: true,
        icon: true,
        parentId: true,
        order: true,
        isActive: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        children: {
          where: { 
            isActive: true,
            isPublic: false, // Also filter children
          },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  // Collect unique menu IDs from user's roles
  const menuIds = new Set<string>();
  for (const userRole of userRoles) {
    if (!userRole.role.isActive) continue;
    userRole.role.menus.forEach((rm: any) => {
      if (rm.menu.isActive && !rm.menu.isPublic) {
        menuIds.add(rm.menu.slug);
      }
    });
  }

  if (menuIds.size === 0) return [];

  // Fetch menus with children in one query
  const menus = await prisma.menu.findMany({
    where: {
      slug: { in: Array.from(menuIds) },
      isActive: true,
      isPublic: false,
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      path: true,
      icon: true,
      parentId: true,
      order: true,
      isActive: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      children: {
        where: {
          isActive: true,
          isPublic: false,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return menus;
});

/**
 * Check if current user has permission (from JWT)
 * @param permissionSlug - Permission slug to check
 * @returns Boolean indicating if current user has permission
 */
export async function checkPermission(permissionSlug: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return hasPermission(user.userId, permissionSlug);
}

