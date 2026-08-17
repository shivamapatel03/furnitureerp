export type PropertyType =
  | "STUDIO"
  | "1BHK"
  | "2BHK"
  | "3BHK"
  | "4BHK"
  | "VILLA"
  | "OFFICE"
  | "RETAIL"
  | "CUSTOM";

export type QualityTier = "ECONOMY" | "STANDARD" | "LUXURY";

export type InteriorStyle =
  | "MODERN"
  | "MINIMALIST"
  | "LUXURY"
  | "TRADITIONAL"
  | "SCANDINAVIAN"
  | "INDUSTRIAL";

export interface FurnitureItemSpec {
  id: string;
  name: string;
  category: string; // "Seating", "Storage", "Bedding", "Table", "Cabinetry", "Decor"
  dimensions: string; // e.g. "6ft x 6.5ft x 3.5ft"
  dimensionsFt?: { l: number; w: number; h: number };
  quantity: number;
  unit: string;
  recommendedMaterial: string;
  hardwareSpecs?: string;
  basePrice: number; // Standard tier unit price in ₹
  economyPrice: number;
  luxuryPrice: number;
  selectedPrice: number;
  totalPrice: number;
  isOptional?: boolean;
  isSelected: boolean;
  notes?: string;
}

export interface RoomEstimate {
  id: string;
  name: string; // "Living Room", "Master Bedroom", "Modular Kitchen", etc.
  type: string; // "LIVING", "MASTER_BED", "BEDROOM", "KITCHEN", "DINING", "FOYER", "STUDY", "BALCONY", "POOJA", "OTHER"
  approxSqft: number;
  furnitureItems: FurnitureItemSpec[];
  subtotal: number;
  isSelected: boolean;
}

export interface BillOfMaterials {
  plywood18mmSheets: number; // 8ft x 4ft sheets
  plywood12mmSheets: number;
  plywood6mmSheets: number;
  laminateSheets: number; // 8ft x 4ft sheets
  edgeBandingMeters: number;
  softCloseHingesPairs: number;
  telescopicSlidesSets: number;
  handlesCount: number;
  fevicolAdhesiveKg: number;
  laborCarpenterDays: number;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  estimatedTotalProductionCost: number;
}

export interface CostTierSummary {
  economyTotal: number;
  standardTotal: number;
  luxuryTotal: number;
  ratePerSqft: number;
}

export interface EstimationResult {
  propertyType: PropertyType;
  totalSqft: number;
  qualityTier: QualityTier;
  style: InteriorStyle;
  clientName?: string;
  clientMobile?: string;
  rooms: RoomEstimate[];
  totalFurnitureCount: number;
  grandTotal: number;
  tierSummary: CostTierSummary;
  bom: BillOfMaterials;
  designInsights: string[];
  notes?: string;
  createdAt?: string;
}

export interface EstimatePreset {
  id: PropertyType;
  label: string;
  subtitle: string;
  defaultSqft: number;
  minSqft: number;
  maxSqft: number;
  icon: string;
  popularRooms: string[];
}
