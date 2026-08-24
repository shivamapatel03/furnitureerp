"use server";

import prisma from "@/lib/prisma";

export async function getDashboardData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayBills,
      monthBills,
      totalBillsCount,
      totalProducts,
      totalCustomers,
      recentBills,
      pendingBillsWithPayments,
      allProducts
    ] = await Promise.all([
      prisma.bill.findMany({ where: { date: { gte: today } } }),
      prisma.bill.findMany({ where: { date: { gte: startOfMonth } } }),
      prisma.bill.count(),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.bill.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { customer: true }
      }),
      prisma.bill.findMany({
        where: { paymentStatus: { in: ["PENDING", "PARTIAL"] } },
        include: { payments: true }
      }),
      prisma.product.findMany()
    ]);

    const todaySales = todayBills.reduce((acc, bill) => acc + bill.grandTotal, 0);
    const monthSales = monthBills.reduce((acc, bill) => acc + bill.grandTotal, 0);
    
    let actualPendingAmount = 0;
    pendingBillsWithPayments.forEach(bill => {
      const paidAmount = bill.payments.reduce((acc, p) => acc + p.amount, 0);
      actualPendingAmount += (bill.grandTotal - paidAmount);
    });

    const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockLimit);

    return {
      todaySales,
      monthSales,
      totalBillsCount,
      pendingAmount: actualPendingAmount,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      recentBills
    };
  } catch (error) {
    console.warn("Could not fetch dashboard data from DB (cold start/network):", error);
    return {
      todaySales: 0,
      monthSales: 0,
      totalBillsCount: 0,
      pendingAmount: 0,
      totalProducts: 0,
      lowStockProducts: [],
      totalCustomers: 0,
      recentBills: []
    };
  }
}
