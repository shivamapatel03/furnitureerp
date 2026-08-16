"use server";

import prisma from "@/lib/prisma";

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { bills: true }
      }
    }
  });
}
