"use server";

import prisma from "@/lib/prisma";

export async function getProducts(query?: string) {
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { category: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  try {
    return await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  } catch (err: any) {
    console.warn("Retrying getProducts (database serverless cold-start):", err?.message);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      return await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' }
      });
    } catch (retryErr) {
      console.error("Failed to fetch products after retry:", retryErr);
      return [];
    }
  }
}

export async function searchProducts(query: string) {
  if (!query) return [];
  try {
    return await prisma.product.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' as const }
      },
      take: 10
    });
  } catch (err: any) {
    console.warn("Retrying searchProducts:", err?.message);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      return await prisma.product.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' as const }
        },
        take: 10
      });
    } catch {
      return [];
    }
  }
}

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const lowStockLimit = parseInt(formData.get("lowStockLimit") as string, 10);

  if (!name || isNaN(sellingPrice)) {
    throw new Error("Invalid product data");
  }

  await prisma.product.create({
    data: {
      name,
      category,
      unit: unit || "Pcs",
      purchasePrice: isNaN(purchasePrice) ? 0 : purchasePrice,
      sellingPrice,
      stock: isNaN(stock) ? 0 : stock,
      lowStockLimit: isNaN(lowStockLimit) ? 0 : lowStockLimit,
    }
  });

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const unit = formData.get("unit") as string;
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string);
  const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const lowStockLimit = parseInt(formData.get("lowStockLimit") as string, 10);

  if (!name || isNaN(sellingPrice)) {
    throw new Error("Invalid product data");
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      category,
      unit: unit || "Pcs",
      purchasePrice: isNaN(purchasePrice) ? 0 : purchasePrice,
      sellingPrice,
      stock: isNaN(stock) ? 0 : stock,
      lowStockLimit: isNaN(lowStockLimit) ? 0 : lowStockLimit,
    }
  });

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Clean up linked bill items if any
      await tx.billItem.deleteMany({
        where: { productId: id }
      });

      // 2. Clean up linked material usages if any
      await tx.materialUsage.deleteMany({
        where: { productId: id }
      });

      // 3. Delete the product itself
      await tx.product.delete({
        where: { id }
      });
    });

    revalidatePath("/products");
    revalidatePath("/billing");
    revalidatePath("/material-usage");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred while deleting the product."
    };
  }
}

