import type { Tier } from "../../../types/domain";

export const TIERS: Tier[] = ["KG_300", "KG_500", "T_1", "T_3", "T_5", "T_10", "T_20", "T_30"];

export function tierLabel(t: Tier) {
  if (t === "KG_300") return "300 kg";
  if (t === "KG_500") return "500 kg";
  if (t === "T_1") return "1T";
  if (t === "T_3") return "3T";
  if (t === "T_5") return "5T";
  if (t === "T_10") return "10T";
  if (t === "T_20") return "20T";
  return "30T";
}

export function num(v: unknown) {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}
