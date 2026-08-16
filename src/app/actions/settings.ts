"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_SETTINGS: Record<string, string> = {
  companyName: "Bhurjala Furniture",
  address: "Karamsad, Anand- 388325",
  phone: "+91 98765 43210",
  email: "",
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const result = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export async function saveSettings(formData: FormData) {
  const keys = ["companyName", "address", "phone", "email"];
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
}
