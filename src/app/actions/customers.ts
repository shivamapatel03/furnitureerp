"use server";

import prisma from "@/lib/prisma";

export async function getCustomers(query?: string) {
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { mobile: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  return await prisma.customer.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { bills: true }
      }
    }
  });
}

