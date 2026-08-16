"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaterialUsages() {
  return await prisma.materialUsage.findMany({
    orderBy: { date: 'desc' },
    include: {
      project: true,
      product: true,
    }
  });
}

export async function addMaterialUsage(data: {
  projectId: string;
  productId: string;
  area: string;
  quantity: number;
  notes: string;
}) {
  try {
    await prisma.$transaction(async (tx) => {
      // Create usage record
      await tx.materialUsage.create({
        data: {
          projectId: data.projectId,
          productId: data.productId,
          area: data.area,
          quantity: data.quantity,
          notes: data.notes,
        }
      });

      // Deduct stock
      await tx.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            decrement: data.quantity
          }
        }
      });
    });

    revalidatePath("/material-usage");
    revalidatePath("/projects");
    revalidatePath("/products");
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to record material usage" };
  }
}
