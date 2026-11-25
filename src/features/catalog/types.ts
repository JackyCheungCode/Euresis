export type WheelProduct = {
  id: string; slug: string; name: string; collection: string; images: string[];
  price?: { amount: number; currency: string };
  specifications: { diameterInches?: number; widthInches?: number; boltPattern?: string; offsetMm?: number; centerBoreMm?: number; loadRatingKg?: number };
};
