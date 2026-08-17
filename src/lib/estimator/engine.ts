import {
  PropertyType,
  QualityTier,
  InteriorStyle,
  RoomEstimate,
  FurnitureItemSpec,
  BillOfMaterials,
  CostTierSummary,
  EstimationResult,
  EstimatePreset,
} from "./types";

export const PROPERTY_PRESETS: EstimatePreset[] = [
  {
    id: "1BHK",
    label: "1 BHK Apartment",
    subtitle: "Compact modern flat (Hall, Bed, Kitchen, Bath)",
    defaultSqft: 600,
    minSqft: 400,
    maxSqft: 800,
    icon: "Home",
    popularRooms: ["Living Room", "Master Bedroom", "Modular Kitchen", "Dining Area"],
  },
  {
    id: "2BHK",
    label: "2 BHK Apartment",
    subtitle: "Standard family home (Hall, 2 Beds, Kitchen, Dining)",
    defaultSqft: 950,
    minSqft: 750,
    maxSqft: 1300,
    icon: "Building",
    popularRooms: ["Living Room", "Master Bedroom", "Bedroom 2", "Modular Kitchen", "Dining Area", "Foyer / Entryway"],
  },
  {
    id: "3BHK",
    label: "3 BHK Apartment / Floor",
    subtitle: "Spacious family residence with master suites & study",
    defaultSqft: 1450,
    minSqft: 1200,
    maxSqft: 2200,
    icon: "Building2",
    popularRooms: ["Living Room", "Master Bedroom", "Bedroom 2 (Kids)", "Bedroom 3 (Guest)", "Modular Kitchen", "Dining Area", "Foyer / Entryway", "Pooja Room"],
  },
  {
    id: "4BHK",
    label: "4 BHK Luxury Flat / Penthouse",
    subtitle: "Premium grand space with entertainment & suites",
    defaultSqft: 2400,
    minSqft: 2000,
    maxSqft: 3800,
    icon: "Castle",
    popularRooms: ["Living Room", "Master Bedroom", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Modular Kitchen", "Dining Area", "Foyer", "Home Office / Study", "Pooja Room", "Balcony"],
  },
  {
    id: "VILLA",
    label: "Independent Villa / Bungalow",
    subtitle: "Multi-level custom luxury house with outdoor & lounge",
    defaultSqft: 3200,
    minSqft: 2200,
    maxSqft: 6000,
    icon: "Hotel",
    popularRooms: ["Living Room", "Master Suite", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Modular Kitchen", "Dining Hall", "Home Office", "Lounge / Bar", "Pooja Room", "Foyer", "Balcony / Deck"],
  },
  {
    id: "STUDIO",
    label: "Studio Apartment",
    subtitle: "Space-saving open layout with multifunctional furniture",
    defaultSqft: 400,
    minSqft: 250,
    maxSqft: 600,
    icon: "Sparkles",
    popularRooms: ["Living & Sleeping Studio", "Modular Kitchenette", "Entry Storage"],
  },
  {
    id: "OFFICE",
    label: "Commercial Office / Workspace",
    subtitle: "Desks, conference tables, storage, cabins & reception",
    defaultSqft: 1200,
    minSqft: 500,
    maxSqft: 5000,
    icon: "Briefcase",
    popularRooms: ["Reception & Waiting", "Main Workstation Bay", "Director Cabin", "Conference Room", "Pantry Area"],
  },
  {
    id: "CUSTOM",
    label: "Custom Space",
    subtitle: "Tailor-made room selection and dimension configuration",
    defaultSqft: 1000,
    minSqft: 100,
    maxSqft: 10000,
    icon: "Wrench",
    popularRooms: ["Living Room", "Master Bedroom", "Modular Kitchen"],
  },
];

export const TIER_CONFIG: Record<
  QualityTier,
  {
    name: string;
    description: string;
    multiplier: number;
    materialSummary: string;
    hardwareSummary: string;
    ratePerSqft: number; // Avg standard interior cost per sqft in India
  }
> = {
  ECONOMY: {
    name: "Economy / Budget Tier",
    description: "Cost-effective, durable commercial plywood with 0.8mm matte laminates & standard fittings.",
    multiplier: 0.75,
    materialSummary: "Commercial MR Grade Plywood, 0.8mm Inner/Outer Laminate, PVC Edge Banding (0.8mm)",
    hardwareSummary: "Standard Soft-Close Hinges, Regular Telescopic Ball Bearing Slides, SS Handles",
    ratePerSqft: 650,
  },
  STANDARD: {
    name: "Standard / Premium Tier",
    description: "Best balance of quality & price: 100% BWR/BWP Marine Ply, 1mm High-Gloss/Suede Laminates & branded soft-close hardware.",
    multiplier: 1.0,
    materialSummary: "BWR / BWP 710 Marine Grade Plywood, 1mm High-Pressure Decorative Laminates, 2mm Edge Banding",
    hardwareSummary: "Ebco / Godrej Soft-Close Hinges, Heavy-Duty Telescopic Channels, Sleek Profile Handles",
    ratePerSqft: 980,
  },
  LUXURY: {
    name: "Luxury / Royal Custom Tier",
    description: "Architectural luxury: HDHMR / Marine 710 with Acrylic / PU Polish / Natural Wood Veneer & Hafele/Hettich smart fittings.",
    multiplier: 1.55,
    materialSummary: "Calibrated BWP Marine 710 / HDHMR Boards, Anti-Scratch Acrylic / PU Polish / Natural Teak Veneer",
    hardwareSummary: "Hafele / Hettich Soft-Close Hinges, Tandem Quadro Soft-Close Drawers, Profile LED Lighting, Hydraulic Bed Lift",
    ratePerSqft: 1650,
  },
};

// Generates base furniture items for a room based on room type, room sqft, and style
export function generateRoomFurniture(
  roomType: string,
  roomSqft: number,
  style: InteriorStyle = "MODERN"
): FurnitureItemSpec[] {
  const items: FurnitureItemSpec[] = [];

  const createItem = (
    idSuffix: string,
    name: string,
    category: string,
    dimensions: string,
    quantity: number,
    basePrice: number,
    recommendedMaterial: string,
    hardwareSpecs: string,
    isOptional = false
  ): FurnitureItemSpec => {
    const economyPrice = Math.round(basePrice * 0.75);
    const luxuryPrice = Math.round(basePrice * 1.55);
    return {
      id: `${roomType.toLowerCase()}_${idSuffix}`,
      name,
      category,
      dimensions,
      quantity,
      unit: "Pcs",
      recommendedMaterial,
      hardwareSpecs,
      basePrice,
      economyPrice,
      luxuryPrice,
      selectedPrice: basePrice,
      totalPrice: basePrice * quantity,
      isOptional,
      isSelected: true,
    };
  };

  switch (roomType) {
    case "LIVING": {
      const isLarge = roomSqft > 220;
      if (isLarge) {
        items.push(
          createItem(
            "sofa",
            "L-Shape 6-Seater Sectional Sofa",
            "Seating",
            "8.5ft x 5.5ft x 3ft",
            1,
            38000,
            "Solid Sal Wood Frame + 40-Density Sleepwell Foam + Velvet/Boucle Fabric",
            "High-tensile zigzag springs, solid metal legs"
          )
        );
      } else {
        items.push(
          createItem(
            "sofa",
            "3-Seater Premium Comfort Sofa",
            "Seating",
            "6.5ft x 3ft x 2.8ft",
            1,
            24000,
            "Treated Hardwood Frame + High-Resilience Foam + Linen Fabric",
            "Anti-sag springs, wooden tapered legs"
          )
        );
      }

      items.push(
        createItem(
          "coffee_table",
          "Centre Coffee Table with Storage Drawers",
          "Table",
          "3.5ft x 2ft x 1.5ft",
          1,
          8500,
          "18mm Marine Plywood + 1mm Laminate / Fluted Charcoal Trims",
          "Soft-close drawer slides, matte metal base"
        )
      );

      const tvSize = isLarge ? "8ft x 7ft Full Wall Unit with Backlit Fluted Panels" : "6ft x 4.5ft Wall-Mounted Entertainment Unit";
      const tvPrice = isLarge ? 32000 : 18500;
      items.push(
        createItem(
          "tv_unit",
          "TV Entertainment & Media Wall Unit",
          "Cabinetry",
          tvSize,
          1,
          tvPrice,
          "18mm BWP Plywood + 1mm Acrylic/Laminate + Louvre/Fluted Louvers",
          "Concealed wire ducts, soft-close drawers, profile LED channels"
        )
      );

      items.push(
        createItem(
          "accent_chair",
          "Lounge Accent Armchair",
          "Seating",
          "2.5ft x 2.5ft x 3ft",
          isLarge ? 2 : 1,
          11500,
          "Moulded High-Density Foam + Velvet Upholstery + Metal Legs",
          "Powder-coated gold/black metal frame",
          true
        )
      );

      items.push(
        createItem(
          "shoe_rack",
          "Foyer Shoe Storage Unit with Padded Bench",
          "Storage",
          "3.5ft x 1.2ft x 2.5ft",
          1,
          9500,
          "18mm Marine Plywood + 1mm Matte Laminate + Leatherette Seat Cushion",
          "Louvred shutter ventilation, hydraulic hinges"
        )
      );

      if (isLarge) {
        items.push(
          createItem(
            "partition",
            "Decorative CNC Jali / Fluted Partition Screen",
            "Decor",
            "4ft x 8ft Floor-to-Ceiling",
            1,
            14000,
            "18mm HDHMR / Teak Wood Frame + Brass Metal Inlays",
            "Ceiling anchor hardware, concealed edge trims",
            true
          )
        );
      }
      break;
    }

    case "MASTER_BED": {
      const isSpacious = roomSqft > 160;
      items.push(
        createItem(
          "bed",
          "King Size Hydraulic Storage Bed (6x6.5ft)",
          "Bedding",
          "6.5ft x 6.8ft x 3.8ft (Headboard)",
          1,
          36000,
          "18mm Marine Plywood Box + 12mm Top Lid + Cushioned Headboard",
          "2x Heavy-Duty 150kg Gas-Lift Hydraulic Pumps, Reinforced corner brackets"
        )
      );

      items.push(
        createItem(
          "nightstands",
          "Bedside Nightstands with Drawers",
          "Storage",
          "1.5ft x 1.3ft x 1.5ft",
          2,
          5200,
          "18mm Marine Plywood + 1mm Laminate / Fluted Finish",
          "Soft-close telescopic drawer slides"
        )
      );

      const wardrobeDoors = isSpacious ? "4-Door Floor-to-Ceiling Wardrobe with Top Loft" : "3-Door Full-Height Wardrobe with Top Loft";
      const wardrobeDim = isSpacious ? "8ft x 7ft x 2ft + 2.5ft Loft" : "6ft x 7ft x 2ft + 2.5ft Loft";
      const wardrobePrice = isSpacious ? 58000 : 44000;
      items.push(
        createItem(
          "wardrobe",
          wardrobeDoors,
          "Cabinetry",
          wardrobeDim,
          1,
          wardrobePrice,
          "18mm BWP Marine Plywood Carcass & Shutters + 1mm Laminate + 0.8mm Inner Liner",
          "Soft-close 3D hinges, inner hanging rods, lockable jewellery locker, sensor LED strips"
        )
      );

      items.push(
        createItem(
          "dressing_unit",
          "Modern Dressing Unit with Full-Length Mirror & Vanity Storage",
          "Cabinetry",
          "2.5ft x 1.2ft x 6.5ft",
          1,
          13500,
          "18mm Marine Plywood + 5mm Saint-Gobain Backlit Mirror + Storage Shelves",
          "Warm LED backlight strip, soft-close drawer, bangle organizer tray"
        )
      );

      if (isSpacious) {
        items.push(
          createItem(
            "study_desk",
            "Floating Bedroom Work / Study Desk with Overhead Shelf",
            "Table",
            "4ft x 1.8ft x 2.5ft",
            1,
            11000,
            "18mm Marine Plywood + 1mm Anti-Scratch Laminate",
            "Cable grommet, soft-close drawer, wall anchors",
            true
          )
        );
      }
      break;
    }

    case "BEDROOM": {
      // Bedroom 2 / Kids Room / Guest Room
      items.push(
        createItem(
          "bed",
          "Queen Size Bed with 2-Side Drawer Storage (5x6.5ft)",
          "Bedding",
          "5.5ft x 6.8ft x 3.5ft",
          1,
          28000,
          "18mm Marine Plywood + 1mm Laminate + Upholstered Headrest",
          "Heavy-duty drawer bottom rollers / runners, metal corner joinery"
        )
      );

      items.push(
        createItem(
          "nightstand",
          "Bedside Nightstand with 1 Drawer",
          "Storage",
          "1.5ft x 1.3ft x 1.5ft",
          1,
          4800,
          "18mm Marine Plywood + 1mm Laminate",
          "Telescopic soft-close slide, minimalist handle"
        )
      );

      items.push(
        createItem(
          "wardrobe",
          "3-Door Floor-to-Ceiling Wardrobe with Loft Storage",
          "Cabinetry",
          "6ft x 7ft x 2ft + 2ft Loft",
          1,
          42000,
          "18mm BWP Plywood + 1mm Laminate Outer + 0.8mm Inner Liner",
          "Soft-close hinges, aluminium profile edge handles, hanger rods"
        )
      );

      items.push(
        createItem(
          "study_table",
          "Student / Kids Study Table with Bookshelf Unit",
          "Table",
          "3.5ft x 2ft x 4.5ft",
          1,
          12500,
          "18mm Marine Plywood + 1mm Dual-Tone Laminate",
          "Keyboard tray/drawer, overhead open cubbies, cable grommet"
        )
      );
      break;
    }

    case "KITCHEN": {
      // Modular Kitchen: calculates base on approx running ft
      const runningFt = Math.max(10, Math.min(26, Math.round(roomSqft * 0.16 + 6)));
      items.push(
        createItem(
          "base_cabinets",
          `Modular Kitchen Base Cabinets (${runningFt} Running Feet)`,
          "Cabinetry",
          `${runningFt} Rft x 2ft Deep x 2.8ft High`,
          1,
          runningFt * 2100,
          "18mm BWP 710 Marine Waterproof Plywood + 1mm Acrylic/High-Gloss Laminate",
          "SS 304 Tandem Cutlery/Cup-Saucer/Thali wire baskets, soft-close drawer channels"
        )
      );

      const overheadFt = Math.round(runningFt * 0.8);
      items.push(
        createItem(
          "overhead_cabinets",
          `Wall-Mounted Overhead Storage Cabinets (${overheadFt} Running Feet)`,
          "Cabinetry",
          `${overheadFt} Rft x 1.2ft Deep x 2ft High`,
          1,
          overheadFt * 1650,
          "18mm BWP Marine Plywood + Frosted Glass Shutters with Aluminium Frame",
          "Bi-fold hydraulic lift-up flaps, soft-close hinges, under-cabinet LED profile"
        )
      );

      items.push(
        createItem(
          "loft_cabinets",
          `Kitchen Ceiling Loft Storage (${runningFt} Running Feet)`,
          "Storage",
          `${runningFt} Rft x 2ft Deep x 2ft High`,
          1,
          runningFt * 1200,
          "18mm Marine Plywood + 1mm Laminate Outer / 0.8mm White Inner",
          "Concealed magnetic push-to-open latches / soft-close hinges"
        )
      );

      if (roomSqft > 120) {
        items.push(
          createItem(
            "pantry_unit",
            "Full-Height Tall Pantry Unit with 6-Layer Pull-Out Baskets",
            "Storage",
            "2ft x 2ft x 7ft",
            1,
            26000,
            "18mm BWP Marine Plywood + Acrylic Finish",
            "SS 304 heavy-duty tandem pantry pull-out mechanism with 120kg capacity",
            true
          )
        );
      }
      break;
    }

    case "DINING": {
      const isLarge = roomSqft > 140;
      const chairCount = isLarge ? 6 : 4;
      const tableDim = isLarge ? "5.5ft x 3ft x 2.5ft (6-Seater)" : "4ft x 3ft x 2.5ft (4-Seater)";
      const tablePrice = isLarge ? 34000 : 22000;

      items.push(
        createItem(
          "dining_set",
          `${chairCount}-Seater Dining Table Set with Cushioned Chairs`,
          "Table",
          tableDim,
          1,
          tablePrice,
          "Solid Teak / Sheesham Wood Structure + Toughened Glass/Nano Marble Top + Padded Fabric Chairs",
          "Anti-scratch floor glides, reinforced tenon & mortise joinery"
        )
      );

      items.push(
        createItem(
          "crockery_unit",
          "Modern Crockery Display Cabinet with Glass Shutters & LED Lighting",
          "Cabinetry",
          "4ft x 1.3ft x 6.5ft",
          1,
          24000,
          "18mm Marine Plywood + Fluted Glass Shutters in Black Aluminium Profile + LED strips",
          "Soft-close pivot hinges, glass shelf supports, sensor touch switch",
          true
        )
      );
      break;
    }

    case "FOYER": {
      items.push(
        createItem(
          "foyer_console",
          "Entryway Foyer Console Table & Backlit Accent Mirror",
          "Decor",
          "3.5ft x 1.2ft x 2.8ft",
          1,
          11500,
          "18mm Marine Plywood + Fluted Panel Texture + Fluted Mirror",
          "Concealed wall bracket, warm LED ambient ring"
        )
      );

      items.push(
        createItem(
          "shoe_cabinet",
          "Ventilated Multi-Tier Shoe Cabinet with Drawer",
          "Storage",
          "3ft x 1.2ft x 3.5ft",
          1,
          9500,
          "18mm Marine Plywood + 1mm Anti-Fungal Laminate",
          "Slotted louver shutters for air circulation, key organizing drawer"
        )
      );
      break;
    }

    case "STUDY": {
      items.push(
        createItem(
          "work_desk",
          "Executive Work Desk with Wire Management & 3-Drawer Pedestal",
          "Table",
          "5ft x 2.2ft x 2.5ft",
          1,
          16500,
          "18mm Marine Plywood + 1mm Anti-Scratch Matte Laminate Top",
          "Central lockable 3-tier drawer pedestal, built-in wire trunking"
        )
      );

      items.push(
        createItem(
          "bookshelf",
          "Wall-to-Wall Bookshelf & Display Storage Unit",
          "Storage",
          "5ft x 1.2ft x 6.5ft",
          1,
          21000,
          "18mm Marine Plywood + 1mm Woodgrain Laminate",
          "Glass shutter sections, adjustable shelf brackets"
        )
      );
      break;
    }

    case "POOJA": {
      items.push(
        createItem(
          "mandir",
          "Artistic Wooden Mandir Unit with CNC Jali Shutters & Storage Drawers",
          "Cabinetry",
          "3.5ft x 1.5ft x 5.5ft",
          1,
          22000,
          "18mm Marine Plywood + Teak Wood Carvings + Corian/Brass Inlay Work",
          "Pull-out prasad tray, brass bell bells, telescopic drawers for puja samagri"
        )
      );
      break;
    }

    case "BALCONY": {
      items.push(
        createItem(
          "balcony_set",
          "All-Weather Balcony Coffee Table & 2 Cane/Wicker Chairs",
          "Seating",
          "Table: 2ft Round, 2x Ergonomic Chairs",
          1,
          12500,
          "Synthetic Weatherproof PE Rattan Wicker + Powder-Coated Metal Frame + Glass Top",
          "UV-resistant outdoor finish, water-repellent cushions",
          true
        )
      );
      break;
    }

    default: {
      items.push(
        createItem(
          "custom_storage",
          "Multi-Purpose Storage Cabinet & Shelving",
          "Storage",
          "4ft x 1.5ft x 6ft",
          1,
          16000,
          "18mm Marine Plywood + 1mm Laminate",
          "Soft-close hinges, adjustable shelf pins"
        )
      );
    }
  }

  return items;
}

// Allocates sqft across rooms realistically based on property type and total sqft
export function calculateRoomAllocations(
  propertyType: PropertyType,
  totalSqft: number
): { name: string; type: string; approxSqft: number }[] {
  switch (propertyType) {
    case "STUDIO":
      return [
        { name: "Living & Sleeping Studio", type: "LIVING", approxSqft: Math.round(totalSqft * 0.65) },
        { name: "Modular Kitchenette", type: "KITCHEN", approxSqft: Math.round(totalSqft * 0.22) },
        { name: "Entryway & Storage", type: "FOYER", approxSqft: Math.round(totalSqft * 0.13) },
      ];

    case "1BHK":
      return [
        { name: "Living Room", type: "LIVING", approxSqft: Math.round(totalSqft * 0.38) },
        { name: "Master Bedroom", type: "MASTER_BED", approxSqft: Math.round(totalSqft * 0.32) },
        { name: "Modular Kitchen", type: "KITCHEN", approxSqft: Math.round(totalSqft * 0.18) },
        { name: "Dining Area", type: "DINING", approxSqft: Math.round(totalSqft * 0.12) },
      ];

    case "2BHK":
      return [
        { name: "Living Room", type: "LIVING", approxSqft: Math.round(totalSqft * 0.28) },
        { name: "Master Bedroom", type: "MASTER_BED", approxSqft: Math.round(totalSqft * 0.24) },
        { name: "Bedroom 2 (Kids / Guest)", type: "BEDROOM", approxSqft: Math.round(totalSqft * 0.20) },
        { name: "Modular Kitchen", type: "KITCHEN", approxSqft: Math.round(totalSqft * 0.14) },
        { name: "Dining Area", type: "DINING", approxSqft: Math.round(totalSqft * 0.09) },
        { name: "Foyer / Entryway", type: "FOYER", approxSqft: Math.round(totalSqft * 0.05) },
      ];

    case "3BHK":
      return [
        { name: "Living Room", type: "LIVING", approxSqft: Math.round(totalSqft * 0.25) },
        { name: "Master Bedroom", type: "MASTER_BED", approxSqft: Math.round(totalSqft * 0.20) },
        { name: "Bedroom 2 (Kids)", type: "BEDROOM", approxSqft: Math.round(totalSqft * 0.17) },
        { name: "Bedroom 3 (Guest / Parent)", type: "BEDROOM", approxSqft: Math.round(totalSqft * 0.15) },
        { name: "Modular Kitchen", type: "KITCHEN", approxSqft: Math.round(totalSqft * 0.11) },
        { name: "Dining Area", type: "DINING", approxSqft: Math.round(totalSqft * 0.07) },
        { name: "Foyer / Entryway", type: "FOYER", approxSqft: Math.round(totalSqft * 0.03) },
        { name: "Pooja Room", type: "POOJA", approxSqft: Math.round(totalSqft * 0.02) },
      ];

    case "4BHK":
    case "VILLA":
      return [
        { name: "Living & Formal Drawing Room", type: "LIVING", approxSqft: Math.round(totalSqft * 0.22) },
        { name: "Master Suite", type: "MASTER_BED", approxSqft: Math.round(totalSqft * 0.18) },
        { name: "Bedroom 2 (Kids Suite)", type: "BEDROOM", approxSqft: Math.round(totalSqft * 0.14) },
        { name: "Bedroom 3 (Guest Suite)", type: "BEDROOM", approxSqft: Math.round(totalSqft * 0.13) },
        { name: "Bedroom 4 / Parents Suite", type: "BEDROOM", approxSqft: Math.round(totalSqft * 0.12) },
        { name: "Modular Island Kitchen", type: "KITCHEN", approxSqft: Math.round(totalSqft * 0.10) },
        { name: "Dining Hall", type: "DINING", approxSqft: Math.round(totalSqft * 0.05) },
        { name: "Home Office / Study", type: "STUDY", approxSqft: Math.round(totalSqft * 0.03) },
        { name: "Grand Foyer", type: "FOYER", approxSqft: Math.round(totalSqft * 0.02) },
        { name: "Pooja Mandir Room", type: "POOJA", approxSqft: Math.round(totalSqft * 0.01) },
      ];

    case "OFFICE":
      return [
        { name: "Reception & Visitor Lounge", type: "LIVING", approxSqft: Math.round(totalSqft * 0.20) },
        { name: "Director / Executive Cabin", type: "STUDY", approxSqft: Math.round(totalSqft * 0.25) },
        { name: "Conference & Meeting Room", type: "DINING", approxSqft: Math.round(totalSqft * 0.25) },
        { name: "Open Workstation Area", type: "BEDROOM", approxSqft: Math.round(totalSqft * 0.20) },
        { name: "Staff Pantry & Storage", type: "KITCHEN", approxSqft: Math.round(totalSqft * 0.10) },
      ];

    default:
      return [
        { name: "Living Room", type: "LIVING", approxSqft: Math.round(totalSqft * 0.40) },
        { name: "Master Bedroom", type: "MASTER_BED", approxSqft: Math.round(totalSqft * 0.35) },
        { name: "Modular Kitchen", type: "KITCHEN", approxSqft: Math.round(totalSqft * 0.25) },
      ];
  }
}

// Computes the Bill of Materials (BOM) based on active furniture items
export function calculateBillOfMaterials(
  rooms: RoomEstimate[],
  qualityTier: QualityTier
): BillOfMaterials {
  let totalWoodworkingSqft = 0;
  let totalDrawers = 0;
  let totalShutters = 0;

  for (const room of rooms) {
    if (!room.isSelected) continue;
    for (const item of room.furnitureItems) {
      if (!item.isSelected) continue;
      const qty = item.quantity;

      // Estimate surface woodworking area based on item category
      if (item.category === "Cabinetry" || item.category === "Storage") {
        totalWoodworkingSqft += 80 * qty;
        totalShutters += 4 * qty;
        totalDrawers += 2 * qty;
      } else if (item.category === "Bedding") {
        totalWoodworkingSqft += 95 * qty;
        totalDrawers += 2 * qty;
        totalShutters += 1 * qty;
      } else if (item.category === "Table") {
        totalWoodworkingSqft += 40 * qty;
        totalDrawers += 1 * qty;
      } else if (item.category === "Seating") {
        totalWoodworkingSqft += 25 * qty;
      } else {
        totalWoodworkingSqft += 30 * qty;
        totalShutters += 1 * qty;
      }
    }
  }

  // Standard 8ft x 4ft sheet = 32 sq ft
  // Plywood sheet calculation with 15% wastage allowance
  const plywood18mmSheets = Math.max(2, Math.ceil((totalWoodworkingSqft * 0.65 * 1.15) / 32));
  const plywood12mmSheets = Math.max(1, Math.ceil((totalWoodworkingSqft * 0.25 * 1.15) / 32));
  const plywood6mmSheets = Math.max(1, Math.ceil((totalWoodworkingSqft * 0.15 * 1.15) / 32));

  // Laminate sheets (outer 1mm + inner 0.8mm liner)
  const laminateSheets = Math.max(2, Math.ceil(plywood18mmSheets * 1.8));
  const edgeBandingMeters = Math.round(plywood18mmSheets * 24); // approx 24m per sheet perimeter

  const softCloseHingesPairs = Math.max(4, Math.round(totalShutters * 2));
  const telescopicSlidesSets = Math.max(2, Math.round(totalDrawers));
  const handlesCount = Math.max(4, Math.round(totalShutters + totalDrawers));
  const fevicolAdhesiveKg = Math.max(5, Math.round(plywood18mmSheets * 1.8));

  // Carpentry man-days: 1 carpenter produces ~0.8 to 1.2 sheets fabricated per day
  const laborCarpenterDays = Math.max(3, Math.round((plywood18mmSheets + plywood12mmSheets) * 0.9));

  // Estimated material & labor cost breakdown
  const sheetRate = qualityTier === "LUXURY" ? 3200 : qualityTier === "STANDARD" ? 2200 : 1500;
  const laminateRate = qualityTier === "LUXURY" ? 2800 : qualityTier === "STANDARD" ? 1600 : 950;
  const hardwareRate = qualityTier === "LUXURY" ? 650 : qualityTier === "STANDARD" ? 380 : 220;
  const laborDailyWage = 950; // Daily carpenter wage in ₹

  const materialCost =
    plywood18mmSheets * sheetRate +
    plywood12mmSheets * (sheetRate * 0.7) +
    plywood6mmSheets * (sheetRate * 0.4) +
    laminateSheets * laminateRate +
    softCloseHingesPairs * hardwareRate +
    telescopicSlidesSets * (hardwareRate * 1.5) +
    fevicolAdhesiveKg * 240 +
    edgeBandingMeters * 35;

  const laborCost = laborCarpenterDays * laborDailyWage;
  const totalProductionCost = Math.round(materialCost + laborCost);

  return {
    plywood18mmSheets,
    plywood12mmSheets,
    plywood6mmSheets,
    laminateSheets,
    edgeBandingMeters,
    softCloseHingesPairs,
    telescopicSlidesSets,
    handlesCount,
    fevicolAdhesiveKg,
    laborCarpenterDays,
    estimatedMaterialCost: Math.round(materialCost),
    estimatedLaborCost: Math.round(laborCost),
    estimatedTotalProductionCost: totalProductionCost,
  };
}

// Generates the comprehensive estimation result
export function generateFullEstimate(
  propertyType: PropertyType,
  totalSqft: number,
  qualityTier: QualityTier = "STANDARD",
  style: InteriorStyle = "MODERN",
  clientName?: string,
  clientMobile?: string
): EstimationResult {
  const roomAllocations = calculateRoomAllocations(propertyType, totalSqft);

  const rooms: RoomEstimate[] = roomAllocations.map((alloc, idx) => {
    const furnitureItems = generateRoomFurniture(alloc.type, alloc.approxSqft, style);
    
    // Apply selected tier pricing to each item
    const configuredItems = furnitureItems.map((item) => {
      let unitPrice = item.basePrice;
      if (qualityTier === "ECONOMY") unitPrice = item.economyPrice;
      if (qualityTier === "LUXURY") unitPrice = item.luxuryPrice;

      return {
        ...item,
        selectedPrice: unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const subtotal = configuredItems
      .filter((i) => i.isSelected)
      .reduce((sum, i) => sum + i.totalPrice, 0);

    return {
      id: `room_${idx + 1}_${alloc.type.toLowerCase()}`,
      name: alloc.name,
      type: alloc.type,
      approxSqft: alloc.approxSqft,
      furnitureItems: configuredItems,
      subtotal,
      isSelected: true,
    };
  });

  const grandTotal = rooms
    .filter((r) => r.isSelected)
    .reduce((sum, r) => sum + r.subtotal, 0);

  const totalFurnitureCount = rooms
    .filter((r) => r.isSelected)
    .reduce(
      (sum, r) =>
        sum +
        r.furnitureItems
          .filter((i) => i.isSelected)
          .reduce((itemSum, i) => itemSum + i.quantity, 0),
      0
    );

  // Compute 3-tier comparative totals
  let economyTotal = 0;
  let standardTotal = 0;
  let luxuryTotal = 0;

  for (const room of rooms) {
    if (!room.isSelected) continue;
    for (const item of room.furnitureItems) {
      if (!item.isSelected) continue;
      economyTotal += item.economyPrice * item.quantity;
      standardTotal += item.basePrice * item.quantity;
      luxuryTotal += item.luxuryPrice * item.quantity;
    }
  }

  const bom = calculateBillOfMaterials(rooms, qualityTier);

  // Generate architectural design insights
  const designInsights: string[] = [
    `Space Optimization: Allocates ${totalSqft} sqft across ${rooms.length} functional zones with minimum 3ft walking clearance.`,
    `Material Durability: Standardized on calibrated BWP 710 marine plywood carcasses with moisture resistance for maximum longevity.`,
    `Production Timeline: Estimated ${bom.laborCarpenterDays} carpenter days (~${Math.ceil(bom.laborCarpenterDays / 3)} weeks with 3-man carpentry team).`,
    `Storage Capacity: Includes integrated top lofts in all wardrobes to maximize vertical ceiling storage without consuming carpet area.`,
  ];

  if (propertyType === "3BHK" || propertyType === "4BHK" || propertyType === "VILLA") {
    designInsights.push(
      "Luxury Accents: Features fluted wall panels, profile LED backlights, and CNC jali partitions for upscale aesthetic appeal."
    );
  }

  return {
    propertyType,
    totalSqft,
    qualityTier,
    style,
    clientName,
    clientMobile,
    rooms,
    totalFurnitureCount,
    grandTotal,
    tierSummary: {
      economyTotal,
      standardTotal,
      luxuryTotal,
      ratePerSqft: Math.round(grandTotal / Math.max(1, totalSqft)),
    },
    bom,
    designInsights,
    createdAt: new Date().toISOString(),
  };
}
