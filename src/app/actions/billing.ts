"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const billItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
  calculationType: z.string().optional(),
  sqft: z.number().optional().nullable(),
  ratePerSqft: z.number().optional().nullable(),
});

const createBillSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerMobile: z.string().min(10, "Valid mobile number is required"),
  category: z.string().optional().nullable(),
  items: z.array(billItemSchema).min(1, "At least one product is required"),
  subtotal: z.number().min(0),
  discount: z.number().min(0),
  tax: z.number().min(0),
  grandTotal: z.number().min(0),
  paymentStatus: z.enum(["PAID", "PARTIAL", "PENDING"]),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD"]),
  paidAmount: z.number().min(0),
  notes: z.string().optional().nullable(),
});

export async function createBill(data: z.infer<typeof createBillSchema>) {
  try {
    const validatedData = createBillSchema.parse(data);

    // Generate Bill Number (e.g., BILL-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.bill.count({
      where: {
        billNumber: { startsWith: `BILL-${dateStr}` }
      }
    });
    const billNumber = `BILL-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

    // Database transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create customer
      let customer = await tx.customer.findUnique({
        where: { mobile: validatedData.customerMobile }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: validatedData.customerName,
            mobile: validatedData.customerMobile,
          }
        });
      } else {
        // Update customer name if changed, or just leave it
        if (customer.name !== validatedData.customerName) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: { name: validatedData.customerName }
          });
        }
      }

      // 2. Create the bill and items
      const bill = await tx.bill.create({
        data: {
          billNumber,
          customerId: customer.id,
          category: validatedData.category || "House",
          subtotal: validatedData.subtotal,
          discount: validatedData.discount,
          tax: validatedData.tax,
          grandTotal: validatedData.grandTotal,
          paymentStatus: validatedData.paymentStatus,
          notes: validatedData.notes || null,
          items: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              calculationType: item.calculationType || "UNIT",
              sqft: item.sqft ?? null,
              ratePerSqft: item.ratePerSqft ?? null,
            }))
          }
        }
      });

      // 3. Save payment if there's any paid amount
      if (validatedData.paidAmount > 0) {
        await tx.payment.create({
          data: {
            billId: bill.id,
            amount: validatedData.paidAmount,
            method: validatedData.paymentMethod
          }
        });
      }

      // 4. Update customer totalPurchased
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalPurchased: {
            increment: validatedData.grandTotal
          }
        }
      });

      // 5. Update product stock
      for (const item of validatedData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return bill;
    });

    revalidatePath("/billing");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/customers");

    return { success: true, billId: result.id };
  } catch (error) {
    console.error("Error creating bill:", error);
    return { success: false, error: "Failed to create bill" };
  }
}

export async function updateBill(id: string, data: z.infer<typeof createBillSchema>) {
  try {
    const validatedData = createBillSchema.parse(data);

    const existingBill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      }
    });

    if (!existingBill) {
      return { success: false, error: "Bill not found." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore previous product stock
      for (const oldItem of existingBill.items) {
        await tx.product.update({
          where: { id: oldItem.productId },
          data: {
            stock: {
              increment: oldItem.quantity
            }
          }
        });
      }

      // 2. Adjust previous customer totalPurchased
      await tx.customer.update({
        where: { id: existingBill.customerId },
        data: {
          totalPurchased: {
            decrement: existingBill.grandTotal
          }
        }
      });

      // 3. Find or link customer
      let customer = await tx.customer.findUnique({
        where: { mobile: validatedData.customerMobile }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: validatedData.customerName,
            mobile: validatedData.customerMobile,
          }
        });
      } else if (customer.name !== validatedData.customerName) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { name: validatedData.customerName }
        });
      }

      // 4. Delete old bill items
      await tx.billItem.deleteMany({
        where: { billId: id }
      });

      // 5. Update Bill details and create new items
      await tx.bill.update({
        where: { id },
        data: {
          customerId: customer.id,
          category: validatedData.category || "House",
          subtotal: validatedData.subtotal,
          discount: validatedData.discount,
          tax: validatedData.tax,
          grandTotal: validatedData.grandTotal,
          paymentStatus: validatedData.paymentStatus,
          notes: validatedData.notes || null,
          items: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              calculationType: item.calculationType || "UNIT",
              sqft: item.sqft ?? null,
              ratePerSqft: item.ratePerSqft ?? null,
            }))
          }
        }
      });

      // 6. Update payments
      await tx.payment.deleteMany({
        where: { billId: id }
      });

      if (validatedData.paidAmount > 0) {
        await tx.payment.create({
          data: {
            billId: id,
            amount: validatedData.paidAmount,
            method: validatedData.paymentMethod,
          }
        });
      }

      // 7. Increment customer totalPurchased with new grandTotal
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalPurchased: {
            increment: validatedData.grandTotal
          }
        }
      });

      // 8. Deduct new product stock
      for (const newItem of validatedData.items) {
        await tx.product.update({
          where: { id: newItem.productId },
          data: {
            stock: {
              decrement: newItem.quantity
            }
          }
        });
      }
    });

    revalidatePath("/billing");
    revalidatePath(`/billing/${id}/print`);
    revalidatePath(`/billing-print/${id}`);
    revalidatePath("/products");
    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true, billId: id };
  } catch (error: any) {
    console.error("Error updating bill:", error);
    return {
      success: false,
      error: error.message || "Failed to update bill."
    };
  }
}

export async function getBills(query?: string) {
  const where = query
    ? {
        OR: [
          { billNumber: { contains: query, mode: 'insensitive' as const } },
          { category: { contains: query, mode: 'insensitive' as const } },
          { customer: { name: { contains: query, mode: 'insensitive' as const } } },
          { customer: { mobile: { contains: query, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  return await prisma.bill.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      customer: true,
      items: { include: { product: true } },
      payments: true,
    }
  });
}

export async function getBillById(id: string) {
  return await prisma.bill.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      payments: true,
    }
  });
}

export async function deleteBill(id: string) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: true,
      }
    });

    if (!bill) {
      return { success: false, error: "Bill not found." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore product inventory stock
      for (const item of bill.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // 2. Decrement customer totalPurchased
      await tx.customer.update({
        where: { id: bill.customerId },
        data: {
          totalPurchased: {
            decrement: bill.grandTotal
          }
        }
      });

      // 3. Delete payments associated with this bill
      await tx.payment.deleteMany({
        where: { billId: id }
      });

      // 4. Delete bill items
      await tx.billItem.deleteMany({
        where: { billId: id }
      });

      // 5. Delete the bill itself
      await tx.bill.delete({
        where: { id }
      });
    });

    revalidatePath("/billing");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting bill:", error);
    return {
      success: false,
      error: error.message || "Failed to delete bill."
    };
  }
}

