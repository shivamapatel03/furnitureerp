"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAIEstimate, AIPromptInput } from "@/lib/estimator/ai";
import { EstimationResult } from "@/lib/estimator/types";

export async function generateEstimateAction(input: AIPromptInput): Promise<EstimationResult> {
  return await generateAIEstimate(input);
}

export async function saveEstimate(data: {
  clientName?: string;
  clientMobile?: string;
  propertyType: string;
  totalSqft: number;
  qualityTier: string;
  style?: string;
  totalCost: number;
  rooms: any[];
  bom: any;
  notes?: string;
}) {
  try {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    
    let count = 0;
    try {
      count = await prisma.estimate.count({
        where: {
          estimateNumber: { startsWith: `EST-${dateStr}` },
        },
      });
    } catch {
      count = Math.floor(Math.random() * 900) + 100;
    }

    const estimateNumber = `EST-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

    const estimate = await prisma.estimate.create({
      data: {
        estimateNumber,
        clientName: data.clientName || null,
        clientMobile: data.clientMobile || null,
        propertyType: data.propertyType,
        totalSqft: data.totalSqft,
        qualityTier: data.qualityTier,
        style: data.style || "MODERN",
        totalCost: data.totalCost,
        roomsData: JSON.stringify(data.rooms),
        bomData: JSON.stringify(data.bom),
        notes: data.notes || null,
        status: "DRAFT",
      },
    });

    // If clientMobile is provided, upsert customer record for CRM
    if (data.clientMobile && data.clientName) {
      try {
        await prisma.customer.upsert({
          where: { mobile: data.clientMobile },
          update: { name: data.clientName },
          create: { name: data.clientName, mobile: data.clientMobile },
        });
      } catch (err) {
        console.warn("Failed to upsert customer on estimate save:", err);
      }
    }

    revalidatePath("/estimator");
    return { success: true, estimateId: estimate.id, estimateNumber };
  } catch (error: any) {
    console.error("Error saving estimate:", error);
    return { success: false, error: error.message || "Failed to save estimate" };
  }
}

export async function getEstimates(query?: string) {
  try {
    const where = query
      ? {
          OR: [
            { estimateNumber: { contains: query, mode: "insensitive" as const } },
            { clientName: { contains: query, mode: "insensitive" as const } },
            { clientMobile: { contains: query, mode: "insensitive" as const } },
            { propertyType: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {};

    return await prisma.estimate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return [];
  }
}

export async function getEstimateById(id: string) {
  try {
    return await prisma.estimate.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching estimate by id:", error);
    return null;
  }
}

export async function deleteEstimate(id: string) {
  try {
    await prisma.estimate.delete({
      where: { id },
    });
    revalidatePath("/estimator");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting estimate:", error);
    return { success: false, error: error.message || "Failed to delete estimate" };
  }
}

export async function convertEstimateToProject(estimateId: string) {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
    });

    if (!estimate) {
      return { success: false, error: "Estimate not found" };
    }

    // 1. Find or create customer
    let customerId: string | null = null;
    if (estimate.clientMobile) {
      const customer = await prisma.customer.upsert({
        where: { mobile: estimate.clientMobile },
        update: { name: estimate.clientName || estimate.clientMobile },
        create: {
          name: estimate.clientName || "Valued Client",
          mobile: estimate.clientMobile,
        },
      });
      customerId = customer.id;
    }

    // 2. Create Project
    const projectName = `${estimate.clientName || "Client"} - ${estimate.propertyType} (${estimate.totalSqft} Sqft)`;
    const project = await prisma.project.create({
      data: {
        name: projectName,
        customerId,
        status: "PLANNING",
        notes: `Converted from AI Estimate #${estimate.estimateNumber}.\nQuality Tier: ${estimate.qualityTier}, Style: ${estimate.style || "MODERN"}.\nTotal Estimated Value: ₹${estimate.totalCost.toLocaleString()}.\n\nClient Notes: ${estimate.notes || "None"}`,
        startDate: new Date(),
      },
    });

    // 3. Mark estimate as CONVERTED_TO_PROJECT
    await prisma.estimate.update({
      where: { id: estimateId },
      data: { status: "CONVERTED_TO_PROJECT" },
    });

    revalidatePath("/projects");
    revalidatePath("/estimator");
    return { success: true, projectId: project.id };
  } catch (error: any) {
    console.error("Error converting estimate to project:", error);
    return { success: false, error: error.message || "Failed to convert estimate to project" };
  }
}
