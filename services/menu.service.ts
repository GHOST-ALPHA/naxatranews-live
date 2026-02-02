import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Get public menus tree (categories for news)
 * Optimized with caching for fast loading
 */
export async function getPublicMenusTree() {
  try {
    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        path: true,
        icon: true,
        parentId: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });

    // Build tree
    const map: Record<string, any> = {};
    const roots: any[] = [];

    menus.forEach((m: any) => {
      map[m.id] = { ...m, children: [] };
    });

    menus.forEach((m: any) => {
      if (m.parentId && map[m.parentId]) {
        map[m.parentId].children.push(map[m.id]);
      } else {
        roots.push(map[m.id]);
      }
    });

    return roots;
  } catch (error) {
    console.error("Failed to fetch public menus tree (returning empty):", error);
    // Return empty array during build/database failure to allow static generation to proceed
    return [];
  }
}

/**
 * Cached version for better performance
 * Cache for 5 minutes (menus don't change frequently)
 */
export const getCachedPublicMenusTree = unstable_cache(
  getPublicMenusTree,
  ["public-menus-tree"],
  {
    revalidate: 300, // 5 minutes
    tags: ["menus", "public-menus"],
  }
);
