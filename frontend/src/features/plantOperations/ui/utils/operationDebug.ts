import type { PlantOpRow, Tier } from "../../../../types/domain";
import { num } from "../../utils/tiers";

function clipTextForCopy(v: unknown) {
  const s = String(v ?? "");
  return s.trim();
}

export function buildOpDebugText(r: PlantOpRow, tiers: Tier[]) {
  const lines: string[] = [];
  lines.push(`id: ${clipTextForCopy(r.operation.id)}`);
  lines.push(`name: ${clipTextForCopy(r.operation.name)}`);
  lines.push(`basePriceUsd: ${num(r.operation.basePriceUsd)}`);
  lines.push(`linkMode: ${clipTextForCopy(r.operation.linkMode)}`);

  const marginByTier = new Map<Tier, number>();
  for (const m of r.margins) marginByTier.set(m.tier, num(m.marginPercent));

  lines.push("");
  lines.push("margins:");
  for (const t of tiers) {
    const v = marginByTier.get(t) ?? 0;
    lines.push(`  ${t}: ${v}`);
  }

  return lines.join("\n");
}
