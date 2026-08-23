"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Employee CRUD ────────────────────────────────────────────

export async function getEmployees() {
  return await prisma.employee.findMany({ orderBy: { name: 'asc' } });
}

export async function createEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const position = formData.get("position") as string;
  const dailySalary = parseFloat(formData.get("dailySalary") as string) || 0;

  if (!name || !mobile) throw new Error("Name and mobile required");

  await prisma.employee.create({
    data: { name, mobile, position: position || null, dailySalary }
  });
  revalidatePath("/attendance");
}

export async function updateEmployee(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const position = formData.get("position") as string;
  const dailySalary = parseFloat(formData.get("dailySalary") as string) || 0;

  await prisma.employee.update({
    where: { id },
    data: { name, mobile, position: position || null, dailySalary }
  });
  revalidatePath("/attendance");
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  revalidatePath("/attendance");
}

// ─── Attendance ────────────────────────────────────────────────

export async function getAttendance(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.attendance.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } },
    include: { employee: true }
  });
}

export async function markAttendance(data: {
  employeeId: string;
  status: string;
  date: Date;
}) {
  const startOfDay = new Date(data.date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(data.date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await prisma.attendance.findFirst({
    where: { employeeId: data.employeeId, date: { gte: startOfDay, lte: endOfDay } }
  });

  if (existing) {
    await prisma.attendance.update({ where: { id: existing.id }, data: { status: data.status } });
  } else {
    await prisma.attendance.create({
      data: { employeeId: data.employeeId, status: data.status, date: startOfDay }
    });
  }
  revalidatePath("/attendance");
  return { success: true };
}

export async function batchMarkAttendance(data: {
  date: Date;
  records: { employeeId: string; status: string }[];
}) {
  const startOfDay = new Date(data.date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(data.date);
  endOfDay.setHours(23, 59, 59, 999);

  await prisma.attendance.deleteMany({
    where: { date: { gte: startOfDay, lte: endOfDay } }
  });

  if (data.records.length > 0) {
    await prisma.attendance.createMany({
      data: data.records.map(r => ({
        employeeId: r.employeeId,
        status: r.status,
        date: startOfDay,
      }))
    });
  }

  revalidatePath("/attendance");
  return { success: true };
}

// ─── Salary Summary ────────────────────────────────────────────

export async function getMonthlySalary(year: number, month: number) {
  // month is 0-indexed (JS Date)
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const employees = await prisma.employee.findMany({ orderBy: { name: 'asc' } });
  const attendances = await prisma.attendance.findMany({
    where: { date: { gte: start, lte: end } }
  });

  return employees.map(emp => {
    const records = attendances.filter(a => a.employeeId === emp.id);
    const presentDays = records.filter(a => a.status === 'PRESENT').length;
    const halfDays = records.filter(a => a.status === 'HALF_DAY').length;
    const absentDays = records.filter(a => a.status === 'ABSENT').length;
    const markedDays = presentDays + halfDays + absentDays;

    // Full month = dailySalary × 30
    const fullMonthSalary = emp.dailySalary * 30;
    // Deductions: each absent = 1 day, half day = 0.5 day
    const deductionDays = absentDays + halfDays * 0.5;
    const deductionAmount = deductionDays * emp.dailySalary;
    const earnedSalary = fullMonthSalary - deductionAmount;

    return {
      employee: emp,
      presentDays,
      halfDays,
      absentDays,
      markedDays,
      fullMonthSalary,
      deductionAmount,
      earnedSalary,
    };
  });
}
