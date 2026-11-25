export type VehicleSelection = { makeId: string; modelId: string; year: number; trimId?: string };
export type FitmentResult = {
  productId: string; status: "verified" | "requires-review" | "incompatible"; notes: string[];
  specifications: { diameterInches: number; widthInches: number; boltPattern: string; offsetMm: number; centerBoreMm?: number };
};
