export type ManufacturingType = "FORGED" | "CAST";
export type WheelCollection =
  | "APEX"
  | "GT"
  | "SPRINT"
  | "ENDURANCE"
  | "RALLY"
  | "HERITAGE";

export type WheelProduct = {
  slug: string;
  model: string;
  collection: WheelCollection;
  manufacturing: ManufacturingType;
  code: string;
  description: string;
  design: string;
  finishCount: number;
  diameterRange: string;
  widths?: string[];
  offsets?: string[];
  pcd?: string[];
  centerBores?: string[];
  image: string;
  imageAlt: string;
  imageSource: string;
  imageSourceUrl: string;
  sample: true;
};

export const wheelCollections: {
  id: WheelCollection;
  subtitle: string;
  description: string;
}[] = [
  { id: "APEX", subtitle: "TRACK PERFORMANCE", description: "Track-inspired geometry and a focused performance aesthetic." },
  { id: "GT", subtitle: "GRAND TOURING", description: "Balanced proportions for a refined grand-touring presence." },
  { id: "SPRINT", subtitle: "STREET SPORT", description: "Direct, modern spoke language for everyday performance." },
  { id: "ENDURANCE", subtitle: "PERFORMANCE ENGINEERING", description: "Purposeful structural expression with an endurance-racing attitude." },
  { id: "RALLY", subtitle: "ADVENTURE PERFORMANCE", description: "Robust visual character for performance-oriented utility vehicles." },
  { id: "HERITAGE", subtitle: "CLASSIC MOTORSPORT", description: "Timeless motorsport references interpreted with a contemporary edge." },
];

export const wheelProducts: WheelProduct[] = [
  {
    slug: "apex-f-vector",
    model: "VECTOR",
    collection: "APEX",
    manufacturing: "FORGED",
    code: "F-AP-VEC-001",
    description: "A track-inspired split-spoke concept with a precise, technical character.",
    design: "Split 5-spoke",
    finishCount: 3,
    diameterRange: "19–21 in",
    image: "https://images.pexels.com/photos/41081788/pexels-photo-41081788.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a detailed custom alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · Tnarg",
    imageSourceUrl: "https://www.pexels.com/photo/close-up-of-custom-car-alloy-wheel-41081788/",
    sample: true,
  },
  {
    slug: "gt-f-monza",
    model: "MONZA",
    collection: "GT",
    manufacturing: "FORGED",
    code: "F-GT-MON-001",
    description: "A refined multi-spoke concept designed around grand-touring proportions.",
    design: "Multi-spoke",
    finishCount: 4,
    diameterRange: "20–22 in",
    image: "https://images.pexels.com/photos/28467931/pexels-photo-28467931.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a multi-spoke alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · FBO Media",
    imageSourceUrl: "https://www.pexels.com/photo/close-up-of-stylish-car-wheel-with-alloy-rims-28467931/",
    sample: true,
  },
  {
    slug: "sprint-f-strike",
    model: "STRIKE",
    collection: "SPRINT",
    manufacturing: "FORGED",
    code: "F-SP-STR-001",
    description: "A clean, directional spoke concept for a contemporary street-sport stance.",
    design: "Directional 5-spoke",
    finishCount: 3,
    diameterRange: "18–20 in",
    image: "https://images.pexels.com/photos/12191103/pexels-photo-12191103.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a dark performance alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · Ibrahim Bilgin",
    imageSourceUrl: "https://www.pexels.com/photo/close-up-of-a-car-wheel-12191103/",
    sample: true,
  },
  {
    slug: "endurance-f-forge",
    model: "FORGE",
    collection: "ENDURANCE",
    manufacturing: "FORGED",
    code: "F-EN-FOR-001",
    description: "An engineering-led multi-spoke concept with a robust motorsport visual language.",
    design: "Structural multi-spoke",
    finishCount: 3,
    diameterRange: "19–22 in",
    image: "https://images.pexels.com/photos/35612805/pexels-photo-35612805.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a performance alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · FBO Media",
    imageSourceUrl: "https://www.pexels.com/photo/close-up-of-stylish-alloy-wheel-rim-35612805/",
    sample: true,
  },
  {
    slug: "gt-c-vector",
    model: "VECTOR",
    collection: "GT",
    manufacturing: "CAST",
    code: "C-GT-VEC-001",
    description: "A cast-wheel interpretation of the GT collection's balanced multi-spoke design.",
    design: "Multi-spoke",
    finishCount: 3,
    diameterRange: "18–20 in",
    image: "https://images.pexels.com/photos/32070739/pexels-photo-32070739.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a polished alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · János Csatlós",
    imageSourceUrl: "https://www.pexels.com/photo/close-up-of-stylish-car-wheel-with-polished-alloy-rim-32070739/",
    sample: true,
  },
  {
    slug: "sprint-c-pulse",
    model: "PULSE",
    collection: "SPRINT",
    manufacturing: "CAST",
    code: "C-SP-PUL-001",
    description: "A lightweight-looking five-spoke concept with a crisp street-sport profile.",
    design: "5-spoke",
    finishCount: 4,
    diameterRange: "17–20 in",
    image: "https://images.pexels.com/photos/8886301/pexels-photo-8886301.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a silver alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · Mike Bird",
    imageSourceUrl: "https://www.pexels.com/photo/photograph-of-a-blue-car-s-wheel-8886301/",
    sample: true,
  },
  {
    slug: "rally-c-grit",
    model: "GRIT",
    collection: "RALLY",
    manufacturing: "CAST",
    code: "C-RA-GRI-001",
    description: "A purposeful wheel concept with a strong, utility-oriented visual character.",
    design: "Robust multi-spoke",
    finishCount: 3,
    diameterRange: "17–20 in",
    image: "https://images.pexels.com/photos/32725835/pexels-photo-32725835.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a gold alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · Luke Miller",
    imageSourceUrl: "https://www.pexels.com/photo/close-up-of-custom-gold-alloy-car-wheel-32725835/",
    sample: true,
  },
  {
    slug: "heritage-c-classic",
    model: "CLASSIC",
    collection: "HERITAGE",
    manufacturing: "CAST",
    code: "C-HR-CLA-001",
    description: "A classic-inspired mesh concept drawing on enduring motorsport proportions.",
    design: "Mesh multi-spoke",
    finishCount: 3,
    diameterRange: "17–19 in",
    image: "https://images.pexels.com/photos/12152871/pexels-photo-12152871.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Reference photograph of a detailed alloy wheel; not an Euresis production product.",
    imageSource: "Pexels · Ivan Kazlouski",
    imageSourceUrl: "https://www.pexels.com/photo/close-up-photo-of-a-rim-12152871/",
    sample: true,
  },
];

export const demoVehicles = {
  Make: ["BMW", "Mercedes-Benz", "Porsche", "Audi", "Toyota"],
  "BMW": {
    Model: ["3 Series", "5 Series", "M3"],
    "3 Series": { Year: ["2022", "2023", "2024", "2025"], "2024": ["330i", "M340i"] },
    "5 Series": { Year: ["2022", "2023", "2024", "2025"], "2024": ["530i", "540i"] },
    M3: { Year: ["2022", "2023", "2024", "2025"], "2024": ["Base", "Competition"] },
  },
  "Mercedes-Benz": {
    Model: ["C-Class", "E-Class", "AMG C 63"],
    "C-Class": { Year: ["2022", "2023", "2024", "2025"], "2024": ["C 300", "AMG C 43"] },
    "E-Class": { Year: ["2022", "2023", "2024", "2025"], "2024": ["E 350", "E 450"] },
    "AMG C 63": { Year: ["2022", "2023", "2024", "2025"], "2024": ["S E PERFORMANCE"] },
  },
  Porsche: {
    Model: ["911", "718 Cayman", "Taycan"],
    "911": { Year: ["2022", "2023", "2024", "2025"], "2024": ["Carrera", "Carrera GTS", "Turbo S"] },
    "718 Cayman": { Year: ["2022", "2023", "2024", "2025"], "2024": ["Base", "GTS 4.0"] },
    Taycan: { Year: ["2022", "2023", "2024", "2025"], "2024": ["4S", "Turbo"] },
  },
  Audi: {
    Model: ["A4", "A6", "RS 6"],
    A4: { Year: ["2022", "2023", "2024", "2025"], "2024": ["40 TFSI", "45 TFSI"] },
    A6: { Year: ["2022", "2023", "2024", "2025"], "2024": ["45 TFSI", "55 TFSI"] },
    "RS 6": { Year: ["2022", "2023", "2024", "2025"], "2024": ["Avant"] },
  },
  Toyota: {
    Model: ["GR Supra", "GR86", "Land Cruiser"],
    "GR Supra": { Year: ["2022", "2023", "2024", "2025"], "2024": ["3.0", "3.0 Premium"] },
    GR86: { Year: ["2022", "2023", "2024", "2025"], "2024": ["Base", "Premium"] },
    "Land Cruiser": { Year: ["2022", "2023", "2024", "2025"], "2024": ["GX", "VX"] },
  },
} as const;
