"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProjects() {
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      materialUsages: { include: { product: true } },
    }
  });
}

export async function getProjectById(id: string) {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      materialUsages: {
        include: { product: true },
        orderBy: { createdAt: 'asc' },
      },
    }
  });
}

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const siteAddress = formData.get("siteAddress") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;
  const startDateStr = formData.get("startDate") as string;
  const deadlineStr = formData.get("deadline") as string;
  const customerMobile = formData.get("customerMobile") as string;
  const customerName = formData.get("customerName") as string;

  if (!name) throw new Error("Project name is required");

  let customerId: string | undefined = undefined;
  if (customerMobile) {
    const customer = await prisma.customer.upsert({
      where: { mobile: customerMobile },
      update: {},
      create: { name: customerName || customerMobile, mobile: customerMobile },
    });
    customerId = customer.id;
  }

  await prisma.project.create({
    data: {
      name,
      siteAddress: siteAddress || null,
      status: status || "PLANNING",
      notes: notes || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      customerId: customerId ?? null,
    }
  });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const siteAddress = formData.get("siteAddress") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;
  const startDateStr = formData.get("startDate") as string;
  const deadlineStr = formData.get("deadline") as string;
  const customerMobile = formData.get("customerMobile") as string;
  const customerName = formData.get("customerName") as string;

  if (!name) throw new Error("Project name is required");

  let customerId: string | null = null;
  if (customerMobile) {
    const customer = await prisma.customer.upsert({
      where: { mobile: customerMobile },
      update: {},
      create: { name: customerName || customerMobile, mobile: customerMobile },
    });
    customerId = customer.id;
  }

  await prisma.project.update({
    where: { id },
    data: {
      name,
      siteAddress: siteAddress || null,
      status: status || "PLANNING",
      notes: notes || null,
      startDate: startDateStr ? new Date(startDateStr) : null,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      customerId,
    }
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
}

export async function addMaterialToProject(projectId: string, data: {
  productId: string;
  quantity: number;
  area: string;
  notes: string;
}) {
  await prisma.materialUsage.create({
    data: {
      projectId,
      productId: data.productId,
      quantity: data.quantity,
      area: data.area || null,
      notes: data.notes || null,
    }
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteMaterialUsage(id: string, projectId: string) {
  await prisma.materialUsage.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}
