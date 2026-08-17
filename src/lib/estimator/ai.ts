import { PropertyType, QualityTier, InteriorStyle, EstimationResult } from "./types";
import { generateFullEstimate } from "./engine";
import prisma from "@/lib/prisma";

export interface AIPromptInput {
  prompt?: string;
  propertyType?: PropertyType;
  totalSqft?: number;
  qualityTier?: QualityTier;
  style?: InteriorStyle;
  clientName?: string;
  clientMobile?: string;
}

// Parses natural language prompts to detect sqft, property type, rooms, budget, and style
export function parseNaturalLanguagePrompt(prompt: string): Partial<AIPromptInput> {
  const result: Partial<AIPromptInput> = {};
  const lower = prompt.toLowerCase();

  // Detect sqft (e.g., "1200 sqft", "950 sq ft", "1500sqft", "800 square feet")
  const sqftMatch = lower.match(/(\d+)\s*(?:sqft|sq\s*ft|sq\.ft|square\s*feet|sq\s*feet)/i);
  if (sqftMatch && sqftMatch[1]) {
    const parsedSqft = parseInt(sqftMatch[1], 10);
    if (parsedSqft >= 100 && parsedSqft <= 20000) {
      result.totalSqft = parsedSqft;
    }
  }

  // Detect property type
  if (lower.includes("studio")) result.propertyType = "STUDIO";
  else if (lower.includes("1bhk") || lower.includes("1 bhk") || lower.includes("1-bhk") || lower.includes("1 bedroom")) result.propertyType = "1BHK";
  else if (lower.includes("2bhk") || lower.includes("2 bhk") || lower.includes("2-bhk") || lower.includes("2 bedroom")) result.propertyType = "2BHK";
  else if (lower.includes("3bhk") || lower.includes("3 bhk") || lower.includes("3-bhk") || lower.includes("3 bedroom")) result.propertyType = "3BHK";
  else if (lower.includes("4bhk") || lower.includes("4 bhk") || lower.includes("4-bhk") || lower.includes("4 bedroom") || lower.includes("5bhk")) result.propertyType = "4BHK";
  else if (lower.includes("villa") || lower.includes("bungalow") || lower.includes("duplex") || lower.includes("row house") || lower.includes("penthouse")) result.propertyType = "VILLA";
  else if (lower.includes("office") || lower.includes("commercial") || lower.includes("workspace") || lower.includes("corporate")) result.propertyType = "OFFICE";

  // Detect quality tier
  if (lower.includes("luxury") || lower.includes("royal") || lower.includes("high-end") || lower.includes("premium luxury") || lower.includes("teak") || lower.includes("acrylic") || lower.includes("pu")) {
    result.qualityTier = "LUXURY";
  } else if (lower.includes("economy") || lower.includes("budget") || lower.includes("cheap") || lower.includes("low cost") || lower.includes("affordable")) {
    result.qualityTier = "ECONOMY";
  } else if (lower.includes("standard") || lower.includes("premium")) {
    result.qualityTier = "STANDARD";
  }

  // Detect style
  if (lower.includes("minimalist") || lower.includes("minimal")) result.style = "MINIMALIST";
  else if (lower.includes("scandinavian") || lower.includes("nordic")) result.style = "SCANDINAVIAN";
  else if (lower.includes("traditional") || lower.includes("classic") || lower.includes("indian")) result.style = "TRADITIONAL";
  else if (lower.includes("industrial") || lower.includes("loft")) result.style = "INDUSTRIAL";
  else if (lower.includes("luxury") || lower.includes("contemporary")) result.style = "LUXURY";
  else if (lower.includes("modern")) result.style = "MODERN";

  return result;
}

// Calls Gemini AI API if configured in database settings or process.env, or uses intelligent engine
export async function generateAIEstimate(input: AIPromptInput): Promise<EstimationResult> {
  // If a natural language prompt is given, parse it to extract parameters
  let extracted: Partial<AIPromptInput> = {};
  if (input.prompt) {
    extracted = parseNaturalLanguagePrompt(input.prompt);
  }

  const propertyType: PropertyType = input.propertyType || extracted.propertyType || "2BHK";
  const defaultSqfts: Record<PropertyType, number> = {
    STUDIO: 400,
    "1BHK": 600,
    "2BHK": 950,
    "3BHK": 1450,
    "4BHK": 2400,
    VILLA: 3200,
    OFFICE: 1200,
    RETAIL: 800,
    CUSTOM: 1000,
  };
  const totalSqft: number = input.totalSqft || extracted.totalSqft || defaultSqfts[propertyType] || 1000;
  const qualityTier: QualityTier = input.qualityTier || extracted.qualityTier || "STANDARD";
  const style: InteriorStyle = input.style || extracted.style || "MODERN";

  // Check if Gemini API key exists in Prisma settings or env
  let apiKey = process.env.GEMINI_API_KEY || "";
  try {
    const apiKeySetting = await prisma.setting.findUnique({
      where: { key: "geminiApiKey" },
    });
    if (apiKeySetting && apiKeySetting.value) {
      apiKey = apiKeySetting.value;
    }
  } catch {
    // If DB is offline, continue with process.env or fallback
  }

  // Base deterministic calculation
  const baseResult = generateFullEstimate(
    propertyType,
    totalSqft,
    qualityTier,
    style,
    input.clientName,
    input.clientMobile
  );

  // If we have Gemini API Key and a user prompt, call Gemini to enrich the estimate
  if (apiKey && input.prompt) {
    try {
      const systemPrompt = `You are an expert master carpenter, interior architect, and furniture estimator for Bhurjala Furniture ERP.
Analyze this user requirement: "${input.prompt}"
Property Type: ${propertyType}, Sqft: ${totalSqft}, Quality Tier: ${qualityTier}, Style: ${style}.

Return a JSON object with:
1. "designInsights": array of 4-5 bullet points offering specific space planning, aesthetic advice, and material recommendations for this specific house.
2. "customRecommendations": array of 2-3 custom furniture or space-saving suggestions tailored to this project.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.designInsights && Array.isArray(parsed.designInsights)) {
            baseResult.designInsights = [
              ...parsed.designInsights,
              ...(parsed.customRecommendations || []),
            ];
          }
        }
      }
    } catch (err) {
      console.warn("Gemini AI API call failed or timed out, using intelligent local engine fallback:", err);
    }
  } else if (input.prompt) {
    // Enrich local insights based on user prompt keywords
    baseResult.designInsights.unshift(
      `Custom Planning Note: Configured for "${input.prompt}" with optimized furniture placement and ${qualityTier.toLowerCase()} finish.`
    );
  }

  return baseResult;
}
