"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Home, 
  Building, 
  Building2, 
  Castle, 
  Briefcase, 
  Wrench, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Check, 
  FileText, 
  Printer, 
  Layers, 
  Hammer, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  Copy, 
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search
} from "lucide-react";
import { 
  PropertyType, 
  QualityTier, 
  InteriorStyle, 
  EstimationResult, 
  RoomEstimate, 
  FurnitureItemSpec 
} from "@/lib/estimator/types";
import { PROPERTY_PRESETS, TIER_CONFIG } from "@/lib/estimator/engine";
import { 
  generateEstimateAction, 
  saveEstimate, 
  getEstimates, 
  deleteEstimate, 
  convertEstimateToProject 
} from "@/app/actions/estimator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const STYLE_OPTIONS: { id: InteriorStyle; label: string; desc: string }[] = [
  { id: "MODERN", label: "Modern Contemporary", desc: "Clean lines, sleek profiles, warm LED accents & muted tones" },
  { id: "MINIMALIST", label: "Minimalist Scandinavian", desc: "Clutter-free, functional, light woodgrains & pastel whites" },
  { id: "LUXURY", label: "Royal Luxury & Glam", desc: "Fluted panels, PU finish, gold brass trims & velvet upholstery" },
  { id: "TRADITIONAL", label: "Classic Indian Traditional", desc: "Solid teak textures, ornate mandir carvings & rich walnut" },
  { id: "INDUSTRIAL", label: "Industrial & Loft", desc: "Dark charcoal metal frames, rustic oak & exposed matte textures" },
];

export default function AIEstimatorPage() {
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"wizard" | "saved">("wizard");

  // Step 1: Core Parameters
  const [propertyType, setPropertyType] = useState<PropertyType>("2BHK");
  const [totalSqft, setTotalSqft] = useState<number>(950);
  const [qualityTier, setQualityTier] = useState<QualityTier>("STANDARD");
  const [interiorStyle, setInteriorStyle] = useState<InteriorStyle>("MODERN");
  const [aiPrompt, setAiPrompt] = useState<string>("");

  // Client Details
  const [clientName, setClientName] = useState<string>("");
  const [clientMobile, setClientMobile] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // State for generated estimation result
  const [estimate, setEstimate] = useState<EstimationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<{ id: string; number: string } | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  // Saved estimates state
  const [savedEstimates, setSavedEstimates] = useState<any[]>([]);
  const [savedQuery, setSavedQuery] = useState<string>("");
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false);

  // New item modal/inline state per room
  const [addingItemToRoomId, setAddingItemToRoomId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Storage");
  const [newItemDimensions, setNewItemDimensions] = useState("4ft x 2ft x 6ft");
  const [newItemPrice, setNewItemPrice] = useState(12000);
  const [newItemMaterial, setNewItemMaterial] = useState("18mm Marine Plywood + 1mm Laminate");

  // Initial estimate generation on load
  useEffect(() => {
    handleGenerate();
  }, []);

  // Update sqft when property preset changes
  const handleSelectPreset = (preset: (typeof PROPERTY_PRESETS)[0]) => {
    setPropertyType(preset.id);
    setTotalSqft(preset.defaultSqft);
  };

  // Generate or recalculate estimate
  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveSuccess(null);
    try {
      const result = await generateEstimateAction({
        propertyType,
        totalSqft,
        qualityTier,
        style: interiorStyle,
        prompt: aiPrompt,
        clientName,
        clientMobile,
      });

      setEstimate(result);
      // Expand all rooms by default
      const exp: Record<string, boolean> = {};
      result.rooms.forEach((r) => {
        exp[r.id] = true;
      });
      setExpandedRooms(exp);
    } catch (err) {
      console.error("Failed to generate estimate:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle room expansion
  const toggleRoomExpand = (roomId: string) => {
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  // Toggle room selection
  const toggleRoomSelection = (roomId: string) => {
    if (!estimate) return;
    const updatedRooms = estimate.rooms.map((r) => {
      if (r.id === roomId) {
        return { ...r, isSelected: !r.isSelected };
      }
      return r;
    });
    recalculateFromRooms(updatedRooms, estimate.qualityTier);
  };

  // Toggle item selection
  const toggleItemSelection = (roomId: string, itemId: string) => {
    if (!estimate) return;
    const updatedRooms = estimate.rooms.map((r) => {
      if (r.id === roomId) {
        const updatedItems = r.furnitureItems.map((i) => {
          if (i.id === itemId) {
            return { ...i, isSelected: !i.isSelected };
          }
          return i;
        });
        const subtotal = updatedItems
          .filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.totalPrice, 0);
        return { ...r, furnitureItems: updatedItems, subtotal };
      }
      return r;
    });
    recalculateFromRooms(updatedRooms, estimate.qualityTier);
  };

  // Update item quantity
  const updateItemQuantity = (roomId: string, itemId: string, delta: number) => {
    if (!estimate) return;
    const updatedRooms = estimate.rooms.map((r) => {
      if (r.id === roomId) {
        const updatedItems = r.furnitureItems.map((i) => {
          if (i.id === itemId) {
            const newQty = Math.max(1, i.quantity + delta);
            return {
              ...i,
              quantity: newQty,
              totalPrice: i.selectedPrice * newQty,
            };
          }
          return i;
        });
        const subtotal = updatedItems
          .filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.totalPrice, 0);
        return { ...r, furnitureItems: updatedItems, subtotal };
      }
      return r;
    });
    recalculateFromRooms(updatedRooms, estimate.qualityTier);
  };

  // Update item unit price
  const updateItemPrice = (roomId: string, itemId: string, newPrice: number) => {
    if (!estimate) return;
    const updatedRooms = estimate.rooms.map((r) => {
      if (r.id === roomId) {
        const updatedItems = r.furnitureItems.map((i) => {
          if (i.id === itemId) {
            return {
              ...i,
              selectedPrice: newPrice,
              totalPrice: newPrice * i.quantity,
            };
          }
          return i;
        });
        const subtotal = updatedItems
          .filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.totalPrice, 0);
        return { ...r, furnitureItems: updatedItems, subtotal };
      }
      return r;
    });
    recalculateFromRooms(updatedRooms, estimate.qualityTier);
  };

  // Delete item from room
  const deleteItemFromRoom = (roomId: string, itemId: string) => {
    if (!estimate) return;
    const updatedRooms = estimate.rooms.map((r) => {
      if (r.id === roomId) {
        const updatedItems = r.furnitureItems.filter((i) => i.id !== itemId);
        const subtotal = updatedItems
          .filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.totalPrice, 0);
        return { ...r, furnitureItems: updatedItems, subtotal };
      }
      return r;
    });
    recalculateFromRooms(updatedRooms, estimate.qualityTier);
  };

  // Add custom item
  const handleAddCustomItem = (roomId: string) => {
    if (!estimate || !newItemName.trim()) return;
    const newItem: FurnitureItemSpec = {
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      dimensions: newItemDimensions,
      quantity: 1,
      unit: "Pcs",
      recommendedMaterial: newItemMaterial,
      hardwareSpecs: "Standard fittings",
      basePrice: newItemPrice,
      economyPrice: Math.round(newItemPrice * 0.75),
      luxuryPrice: Math.round(newItemPrice * 1.55),
      selectedPrice: newItemPrice,
      totalPrice: newItemPrice,
      isSelected: true,
    };

    const updatedRooms = estimate.rooms.map((r) => {
      if (r.id === roomId) {
        const updatedItems = [...r.furnitureItems, newItem];
        const subtotal = updatedItems
          .filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.totalPrice, 0);
        return { ...r, furnitureItems: updatedItems, subtotal };
      }
      return r;
    });

    setAddingItemToRoomId(null);
    setNewItemName("");
    recalculateFromRooms(updatedRooms, estimate.qualityTier);
  };

  // Switch tier and recalculate prices
  const switchQualityTier = (newTier: QualityTier) => {
    setQualityTier(newTier);
    if (!estimate) return;

    const updatedRooms = estimate.rooms.map((r) => {
      const updatedItems = r.furnitureItems.map((i) => {
        let p = i.basePrice;
        if (newTier === "ECONOMY") p = i.economyPrice;
        if (newTier === "LUXURY") p = i.luxuryPrice;
        return {
          ...i,
          selectedPrice: p,
          totalPrice: p * i.quantity,
        };
      });
      const subtotal = updatedItems
        .filter((i) => i.isSelected)
        .reduce((sum, i) => sum + i.totalPrice, 0);
      return { ...r, furnitureItems: updatedItems, subtotal };
    });

    recalculateFromRooms(updatedRooms, newTier);
  };

  // Helper to recompute totals, furniture counts, and BOM
  const recalculateFromRooms = (rooms: RoomEstimate[], tier: QualityTier) => {
    if (!estimate) return;

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

    // Recompute simplified BOM
    const activeWoodSqft = rooms
      .filter((r) => r.isSelected)
      .reduce((sum, r) => {
        return (
          sum +
          r.furnitureItems
            .filter((i) => i.isSelected)
            .reduce((iSum, i) => iSum + (i.category === "Cabinetry" ? 80 : 50) * i.quantity, 0)
        );
      }, 0);

    const plywood18mmSheets = Math.max(2, Math.ceil((activeWoodSqft * 0.65 * 1.15) / 32));
    const plywood12mmSheets = Math.max(1, Math.ceil((activeWoodSqft * 0.25 * 1.15) / 32));
    const plywood6mmSheets = Math.max(1, Math.ceil((activeWoodSqft * 0.15 * 1.15) / 32));
    const laminateSheets = Math.max(2, Math.ceil(plywood18mmSheets * 1.8));
    const laborCarpenterDays = Math.max(3, Math.round((plywood18mmSheets + plywood12mmSheets) * 0.9));

    setEstimate({
      ...estimate,
      qualityTier: tier,
      rooms,
      grandTotal,
      totalFurnitureCount,
      tierSummary: {
        economyTotal,
        standardTotal,
        luxuryTotal,
        ratePerSqft: Math.round(grandTotal / Math.max(1, totalSqft)),
      },
      bom: {
        ...estimate.bom,
        plywood18mmSheets,
        plywood12mmSheets,
        plywood6mmSheets,
        laminateSheets,
        laborCarpenterDays,
        estimatedTotalProductionCost: Math.round(grandTotal * 0.65),
      },
    });
  };

  // Save estimate to database
  const handleSaveEstimate = async () => {
    if (!estimate) return;
    setIsSaving(true);
    try {
      const res = await saveEstimate({
        clientName,
        clientMobile,
        propertyType,
        totalSqft,
        qualityTier,
        style: interiorStyle,
        totalCost: estimate.grandTotal,
        rooms: estimate.rooms,
        bom: estimate.bom,
        notes,
      });

      if (res.success && res.estimateId && res.estimateNumber) {
        setSaveSuccess({ id: res.estimateId, number: res.estimateNumber });
      } else {
        alert(res.error || "Failed to save estimate");
      }
    } catch (err) {
      console.error("Save estimate error:", err);
      alert("An error occurred while saving the estimate");
    } finally {
      setIsSaving(false);
    }
  };

  // Convert to Project
  const handleConvertToProject = async () => {
    if (!saveSuccess?.id) {
      // First save if not yet saved
      if (!estimate) return;
      setIsSaving(true);
      const res = await saveEstimate({
        clientName,
        clientMobile,
        propertyType,
        totalSqft,
        qualityTier,
        style: interiorStyle,
        totalCost: estimate.grandTotal,
        rooms: estimate.rooms,
        bom: estimate.bom,
        notes,
      });
      setIsSaving(false);
      if (res.success && res.estimateId) {
        const projRes = await convertEstimateToProject(res.estimateId);
        if (projRes.success && projRes.projectId) {
          router.push(`/projects/${projRes.projectId}`);
        } else {
          alert(projRes.error || "Failed to create project");
        }
      }
    } else {
      const projRes = await convertEstimateToProject(saveSuccess.id);
      if (projRes.success && projRes.projectId) {
        router.push(`/projects/${projRes.projectId}`);
      } else {
        alert(projRes.error || "Failed to create project");
      }
    }
  };

  // Load saved estimates
  const loadSavedEstimates = async () => {
    setIsLoadingSaved(true);
    try {
      const data = await getEstimates(savedQuery);
      setSavedEstimates(data);
    } catch (err) {
      console.error("Error loading saved estimates:", err);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (activeTab === "saved") {
      loadSavedEstimates();
    }
  }, [activeTab, savedQuery]);

  const handleDeleteSaved = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved estimate?")) return;
    await deleteEstimate(id);
    loadSavedEstimates();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-xs font-bold text-red-300">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI Space & Furniture Estimator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              House & Commercial Furniture Estimator
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl">
              Calculate exact room-wise furniture requirements, recommended dimensions, raw plywood & laminate sheets (BOM), and 3-tier price estimates by square footage.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-gray-800/80 p-1.5 rounded-xl border border-gray-700">
            <button
              onClick={() => setActiveTab("wizard")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "wizard"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              New Estimate
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "saved"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Saved Estimates
            </button>
          </div>
        </div>
      </div>

      {activeTab === "saved" ? (
        /* SAVED ESTIMATES TAB */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Saved Client Estimates</h2>
              <p className="text-xs text-gray-500">View, print or convert saved proposals</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search estimate or client..."
                value={savedQuery}
                onChange={(e) => setSavedQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {isLoadingSaved ? (
            <div className="py-12 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-xs font-semibold">Loading saved estimates...</p>
            </div>
          ) : savedEstimates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase text-[11px] bg-gray-50">
                    <th className="py-3 px-4">Estimate No.</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Property & Area</th>
                    <th className="py-3 px-4">Quality Tier</th>
                    <th className="py-3 px-4 text-right">Total (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {savedEstimates.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{item.estimateNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{item.clientName || "Walk-in Customer"}</p>
                        <p className="text-xs text-gray-400">{item.clientMobile || "No mobile"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-800">{item.propertyType}</span>
                        <span className="text-gray-500 ml-1">({item.totalSqft} sqft)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            item.qualityTier === "LUXURY"
                              ? "bg-purple-100 text-purple-700"
                              : item.qualityTier === "STANDARD"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.qualityTier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-gray-900">
                        ₹{item.totalCost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/estimator/${item.id}/print`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs"
                          title="Print Quotation"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteSaved(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-600">No saved estimates yet</p>
              <p className="text-xs text-gray-400 mt-1">Generate a new estimate and click Save Estimate.</p>
            </div>
          )}
        </div>
      ) : (
        /* WIZARD & GENERATOR VIEW */
        <div className="space-y-6">
          {/* STEP 1: SPACE & PROPERTY CONFIGURATION */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary mb-1">
                <span>Step 1</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">Property & Space Specs</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Select House Type & Square Footage
              </h2>
            </div>

            {/* Property Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
              {PROPERTY_PRESETS.map((preset) => {
                const isSelected = propertyType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/5 text-gray-900 shadow-sm ring-2 ring-primary/20"
                        : "border-gray-200 bg-gray-50/60 hover:bg-gray-100/80 text-gray-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-base font-extrabold ${isSelected ? "text-primary" : "text-gray-800"}`}>
                          {preset.id}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-900 leading-tight">{preset.label}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 font-medium">~{preset.defaultSqft} sqft</p>
                  </button>
                );
              })}
            </div>

            {/* Sqft Slider & Number Input */}
            <div className="bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Total Built-up / Carpet Area (Sq.Ft.)
                  </label>
                  <p className="text-xs text-gray-400">Drag slider or enter exact square feet</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="150"
                    max="10000"
                    step="25"
                    value={totalSqft}
                    onChange={(e) => setTotalSqft(Math.max(100, parseInt(e.target.value) || 100))}
                    className="w-28 px-3 py-1.5 font-extrabold text-base text-gray-900 bg-white border border-gray-300 rounded-xl text-right outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-gray-500">SQFT</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="200"
                max="4000"
                step="25"
                value={totalSqft}
                onChange={(e) => setTotalSqft(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[450, 650, 950, 1200, 1500, 1800, 2400, 3200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTotalSqft(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      totalSqft === val
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {val} sqft
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Tier Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Interior Quality & Finish Tier
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["ECONOMY", "STANDARD", "LUXURY"] as const).map((tierKey) => {
                  const cfg = TIER_CONFIG[tierKey];
                  const isSelected = qualityTier === tierKey;
                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => switchQualityTier(tierKey)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 text-gray-900 ring-2 ring-primary/20 shadow-sm"
                          : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`font-extrabold text-sm ${
                              tierKey === "LUXURY"
                                ? "text-purple-700"
                                : tierKey === "STANDARD"
                                ? "text-primary"
                                : "text-amber-700"
                            }`}
                          >
                            {cfg.name}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-2">{cfg.description}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                        <p>
                          <strong className="text-gray-700">Material:</strong> {cfg.materialSummary}
                        </p>
                        <p>
                          <strong className="text-gray-700">Hardware:</strong> {cfg.hardwareSummary}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interior Style Selection & AI Natural Language Prompt */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Style dropdown */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Design Theme / Style
                </label>
                <select
                  value={interiorStyle}
                  onChange={(e) => setInteriorStyle(e.target.value as InteriorStyle)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Natural Language Prompt Input */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>AI Prompt / Client Custom Requirements (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3BHK flat in Karamsad, need kids bunk bed, breakfast counter, budget 7 Lakhs"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* Recalculate / Generate Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Calculating Furniture Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Furniture Estimate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* STEP 2 & 3: ESTIMATION RESULTS & ROOM BREAKDOWN */}
          {estimate && (
            <div className="space-y-6">
              {/* SUMMARY STATS & TIER COMPARISON */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Grand Total Card */}
                <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-5 rounded-2xl sm:rounded-3xl shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold text-red-200">
                      Estimated Total ({estimate.qualityTier})
                    </span>
                    <IndianRupee className="w-5 h-5 text-red-200" />
                  </div>
                  <div className="my-3">
                    <p className="text-2xl sm:text-3xl font-black">
                      ₹{estimate.grandTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-100 mt-1">
                      Avg ₹{estimate.tierSummary.ratePerSqft}/sqft • {estimate.totalFurnitureCount} Furniture Items
                    </p>
                  </div>
                  <div className="text-[11px] text-red-100 bg-white/10 px-2.5 py-1 rounded-lg">
                    {estimate.rooms.filter((r) => r.isSelected).length} Furnished Rooms Included
                  </div>
                </div>

                {/* Economy Option */}
                <button
                  type="button"
                  onClick={() => switchQualityTier("ECONOMY")}
                  className={`p-5 rounded-2xl sm:rounded-3xl border text-left transition-all flex flex-col justify-between ${
                    estimate.qualityTier === "ECONOMY"
                      ? "border-amber-500 bg-amber-50/80 ring-2 ring-amber-400"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">
                      Economy Budget Tier
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                      ₹{estimate.tierSummary.economyTotal.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Commercial Plywood + 0.8mm Laminate</p>
                  </div>
                  <span className="text-xs text-amber-700 font-bold mt-2">Select Economy</span>
                </button>

                {/* Standard Option */}
                <button
                  type="button"
                  onClick={() => switchQualityTier("STANDARD")}
                  className={`p-5 rounded-2xl sm:rounded-3xl border text-left transition-all flex flex-col justify-between ${
                    estimate.qualityTier === "STANDARD"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold uppercase text-primary tracking-wider">
                        Standard Premium
                      </span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-primary text-white rounded-full font-bold">
                        Popular
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                      ₹{estimate.tierSummary.standardTotal.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">BWR Marine Ply + 1mm High Gloss</p>
                  </div>
                  <span className="text-xs text-primary font-bold mt-2">Select Standard</span>
                </button>

                {/* Luxury Option */}
                <button
                  type="button"
                  onClick={() => switchQualityTier("LUXURY")}
                  className={`p-5 rounded-2xl sm:rounded-3xl border text-left transition-all flex flex-col justify-between ${
                    estimate.qualityTier === "LUXURY"
                      ? "border-purple-600 bg-purple-50/80 ring-2 ring-purple-400"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold uppercase text-purple-700 tracking-wider">
                      Luxury Royal Custom
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                      ₹{estimate.tierSummary.luxuryTotal.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">HDHMR/Teak + Acrylic/PU + Hafele</p>
                  </div>
                  <span className="text-xs text-purple-700 font-bold mt-2">Select Luxury</span>
                </button>
              </div>

              {/* BILL OF MATERIALS & PRODUCTION REQUIREMENTS */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Estimated Material & Production Bill of Materials (BOM)
                      </h3>
                      <p className="text-xs text-gray-500">
                        Raw materials and carpentry days required to fabricate this project
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-500 font-semibold uppercase">18mm Plywood</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {estimate.bom.plywood18mmSheets}{" "}
                      <span className="text-xs font-normal text-gray-500">Sheets (8x4)</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-500 font-semibold uppercase">12mm / 6mm Ply</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {estimate.bom.plywood12mmSheets + estimate.bom.plywood6mmSheets}{" "}
                      <span className="text-xs font-normal text-gray-500">Sheets</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-500 font-semibold uppercase">Laminates</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {estimate.bom.laminateSheets}{" "}
                      <span className="text-xs font-normal text-gray-500">Sheets (8x4)</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-500 font-semibold uppercase">Soft-Close Hinges</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {estimate.bom.softCloseHingesPairs}{" "}
                      <span className="text-xs font-normal text-gray-500">Pairs</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-500 font-semibold uppercase">Drawer Channels</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {estimate.bom.telescopicSlidesSets}{" "}
                      <span className="text-xs font-normal text-gray-500">Sets</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70">
                    <p className="text-[11px] text-gray-500 font-semibold uppercase">Carpentry Labor</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      ~{estimate.bom.laborCarpenterDays}{" "}
                      <span className="text-xs font-normal text-gray-500">Man-Days</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* AI SPACE PLANNING & DESIGN INSIGHTS */}
              {estimate.designInsights && estimate.designInsights.length > 0 && (
                <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI Space Planning & Architectural Insights</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900">
                    {estimate.designInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ROOM-BY-ROOM FURNITURE CUSTOMIZATION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Room-by-Room Furniture Plan</h3>
                    <p className="text-xs text-gray-500">
                      Customize quantities, adjust prices, or add bespoke items per room
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {estimate.rooms.map((room) => {
                    const isExpanded = !!expandedRooms[room.id];
                    return (
                      <div
                        key={room.id}
                        className={`rounded-2xl border transition-all ${
                          room.isSelected
                            ? "bg-white border-gray-200 shadow-xs"
                            : "bg-gray-50/60 border-gray-200 opacity-60"
                        }`}
                      >
                        {/* Room Header Accordion */}
                        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 select-none">
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={room.isSelected}
                              onChange={() => toggleRoomSelection(room.id)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                            />
                            <div
                              onClick={() => toggleRoomExpand(room.id)}
                              className="cursor-pointer min-w-0"
                            >
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                                  {room.name}
                                </h4>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-md">
                                  {room.approxSqft} sqft
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {room.furnitureItems.filter((i) => i.isSelected).length} items included
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-sm sm:text-base font-extrabold text-gray-900">
                                ₹{room.subtotal.toLocaleString()}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleRoomExpand(room.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* Items Table */}
                        {isExpanded && room.isSelected && (
                          <div className="border-t border-gray-100 p-4 sm:p-5 space-y-3 bg-gray-50/40 rounded-b-2xl">
                            {room.furnitureItems.map((item) => (
                              <div
                                key={item.id}
                                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  item.isSelected
                                    ? "bg-white border-gray-200"
                                    : "bg-gray-100/50 border-gray-200/60 opacity-50"
                                }`}
                              >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={item.isSelected}
                                    onChange={() => toggleItemSelection(room.id, item.id)}
                                    className="w-4 h-4 mt-1 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                                        {item.category}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                      Size: <strong className="text-gray-700">{item.dimensions}</strong>
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                                      Specs: {item.recommendedMaterial}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(room.id, item.id, -1)}
                                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 font-bold rounded-l-lg"
                                    >
                                      -
                                    </button>
                                    <span className="px-2.5 py-1 text-xs font-bold text-gray-900">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(room.id, item.id, 1)}
                                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 font-bold rounded-r-lg"
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Unit Price editable */}
                                  <div className="w-24 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      step="500"
                                      value={item.selectedPrice}
                                      onChange={(e) =>
                                        updateItemPrice(
                                          room.id,
                                          item.id,
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg text-right font-medium outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <span className="text-[10px] text-gray-400 block">per unit</span>
                                  </div>

                                  {/* Total Item Price */}
                                  <div className="w-24 text-right">
                                    <p className="font-extrabold text-gray-900 text-sm">
                                      ₹{item.totalPrice.toLocaleString()}
                                    </p>
                                  </div>

                                  {/* Delete Item */}
                                  <button
                                    type="button"
                                    onClick={() => deleteItemFromRoom(room.id, item.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                    title="Remove item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Add Custom Item Section */}
                            {addingItemToRoomId === room.id ? (
                              <div className="p-4 bg-white rounded-xl border border-primary/40 space-y-3">
                                <h5 className="text-xs font-bold text-gray-900">Add Custom Item to {room.name}</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="text-[11px] font-semibold text-gray-600">Item Name</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Fluted Wall Panelling"
                                      value={newItemName}
                                      onChange={(e) => setNewItemName(e.target.value)}
                                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-semibold text-gray-600">Dimensions</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 8ft x 6ft"
                                      value={newItemDimensions}
                                      onChange={(e) => setNewItemDimensions(e.target.value)}
                                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-semibold text-gray-600">Price (₹)</label>
                                    <input
                                      type="number"
                                      value={newItemPrice}
                                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setAddingItemToRoomId(null)}
                                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddCustomItem(room.id)}
                                    className="px-4 py-1.5 text-xs bg-primary text-white rounded-lg font-semibold shadow-xs"
                                  >
                                    Add Item
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingItemToRoomId(room.id);
                                  setNewItemName("");
                                }}
                                className="w-full py-2.5 border border-dashed border-gray-300 hover:border-primary text-primary font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors bg-white/70"
                              >
                                <Plus size={15} />
                                <span>Add Custom Furniture / Cabinetry to {room.name}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: CLIENT INFO, SAVE & ERP INTEGRATIONS */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary mb-1">
                    <span>Step 4</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500">Proposal & ERP Actions</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Client Proposal & Direct ERP Conversion
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Client Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Patel"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Client Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={clientMobile}
                      onChange={(e) => setClientMobile(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Special Notes / Terms</label>
                    <input
                      type="text"
                      placeholder="e.g. Includes GST, delivery in 35 days"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Estimate #{saveSuccess.number} saved successfully to database!</span>
                    </div>
                    <Link
                      href={`/estimator/${saveSuccess.id}/print`}
                      target="_blank"
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Proposal</span>
                    </Link>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSaveEstimate}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save Estimate"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConvertToProject}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Convert to ERP Project</span>
                  </button>

                  <Link
                    href="/billing/new"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Create Billing Invoice</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
