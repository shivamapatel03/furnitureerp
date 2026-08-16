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

  return await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' }
  });
}

export async function searchProducts(query: string) {
  if (!query) return [];
  return await prisma.product.findMany({
    where: {
      name: { contains: query }
    },
    take: 10
  });
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            billItems: true,
            materialUsages: true,
          }
        }
      }
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    const { billItems, materialUsages } = product._count;
    if (billItems > 0 || materialUsages > 0) {
      const reasons: string[] = [];
      if (billItems > 0) reasons.push(`${billItems} bill(s)`);
      if (materialUsages > 0) reasons.push(`${materialUsages} project material record(s)`);
      return {
        success: false,
        error: `Cannot delete "${product.name}" because it is currently linked to ${reasons.join(" and ")}. Please remove or update these records first before deleting the product.`
      };
    }

    await prisma.product.delete({ where: { id } });
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred while deleting the product."
    };
  }
}

