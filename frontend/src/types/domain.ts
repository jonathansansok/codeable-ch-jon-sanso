export type Tier =
  | "KG_300"
  | "KG_500"
  | "T_1"
  | "T_3"
  | "T_5"
  | "T_10"
  | "T_20"
  | "T_30";

export type LinkMode = "NONE" | "BY_STRUCTURE";

export type Plant = { id: string; name: string; code?: string | null };

export type Margin = { tier: Tier; marginPercent: number };

export type PlantOpRow = {
  id: string;
  plant: Plant;
  operation: { id: string; name: string; basePriceUsd: number; linkMode: LinkMode };
  margins: Margin[];
};
