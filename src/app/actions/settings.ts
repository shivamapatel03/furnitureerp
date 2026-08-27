"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_SETTINGS: Record<string, string> = {
  companyName: "Bhurjala Furniture",
  address: "Karamsad, Anand- 388325",
  phone: "+91 98765 43210",
  email: "",
  geminiApiKey: "",
  secretAccessCode: "2026",
  defaultSqftRate: "850",
};

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany();
    const result = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  } catch (error) {
    console.warn("Could not fetch settings from DB (cold start/network), using defaults:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(formData: FormData) {
  try {
    const keys = ["companyName", "address", "phone", "email", "geminiApiKey", "secretAccessCode", "defaultSqftRate"];
    for (const key of keys) {
      const value = (formData.get(key) as string) ?? "";
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    revalidatePath("/settings");
    revalidatePath("/billing");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return { success: false, error: error.message || "Failed to save settings." };
  }
}
