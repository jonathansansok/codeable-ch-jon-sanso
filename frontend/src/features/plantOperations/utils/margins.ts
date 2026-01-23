import type { Margin, Tier } from "../../../types/domain";
import { TIERS } from "./tiers";

export function mapMargins(margins: Margin[]) {
  const m = new Map<Tier, number>();
  for (const x of margins) m.set(x.tier, Number(x.marginPercent));
  return m;
}

export function marginsToRecord(margins: Margin[]) {
  const mm = mapMargins(margins);
  const out: Record<string, number> = {};
  for (const t of TIERS) out[t] = mm.get(t) ?? 0;
  return out;
}
