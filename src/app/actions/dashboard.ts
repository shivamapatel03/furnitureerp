"use server";

import prisma from "@/lib/prisma";

export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayBills,
    monthBills,
    totalBillsCount,
    pendingBills,
    totalProducts,
    lowStockProducts,
    totalCustomers,
    recentBills
  ] = await Promise.all([
    prisma.bill.findMany({ where: { date: { gte: today } } }),
    prisma.bill.findMany({ where: { date: { gte: startOfMonth } } }),
    prisma.bill.count(),
    prisma.bill.findMany({ where: { paymentStatus: { in: ["PENDING", "PARTIAL"] } } }),
    prisma.product.count(),
    prisma.product.findMany({
      where: {
        stock: { lte: prisma.product.fields.lowStockLimit } // wait, this might not work in SQLite Prisma, we will fetch and filter if needed
      }
    }).catch(async () => {
      // Fallback for sqlite comparison if field comparison fails
      const allProducts = await prisma.product.findMany();
      return allProducts.filter(p => p.stock <= p.lowStockLimit);
    }),
    prisma.customer.count(),
    prisma.bill.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { customer: true }
    })
  ]);

  const todaySales = todayBills.reduce((acc, bill) => acc + bill.grandTotal, 0);
  const monthSales = monthBills.reduce((acc, bill) => acc + bill.grandTotal, 0);
  
  const pendingPaymentsAmount = pendingBills.reduce((acc, bill) => {
    // Assuming we need to calculate pending amount if PARTIAL, 
    // but for MVP, let's say we just track the total of bills that aren't fully paid.
    // Ideally we would subtract total payments.
    return acc + bill.grandTotal; 
  }, 0); // Need payments to be accurate, but let's keep it simple for now or fetch payments.

  const pendingBillsWithPayments = await prisma.bill.findMany({
    where: { paymentStatus: { in: ["PENDING", "PARTIAL"] } },
    include: { payments: true }
  });

  let actualPendingAmount = 0;
  pendingBillsWithPayments.forEach(bill => {
    const paidAmount = bill.payments.reduce((acc, p) => acc + p.amount, 0);
    actualPendingAmount += (bill.grandTotal - paidAmount);
  });

  return {
    todaySales,
    monthSales,
    totalBillsCount,
    pendingAmount: actualPendingAmount,
    totalProducts,
    lowStockProducts: Array.isArray(lowStockProducts) ? lowStockProducts : [],
    totalCustomers,
    recentBills
  };
}
