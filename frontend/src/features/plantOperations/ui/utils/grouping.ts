import type { PlantOpRow } from "../../../../types/domain";

type RowItem =
  | { kind: "group"; id: string; label: string; count: number }
  | { kind: "row"; id: string; row: PlantOpRow };

export function groupKey(name: string) {
  const c = (name || "A").trim().toUpperCase().charCodeAt(0);
  if (c <= "I".charCodeAt(0)) return "Tipo A";
  if (c <= "R".charCodeAt(0)) return "Tipo B";
  return "Tipo C";
}

export function buildItems(rows: PlantOpRow[]) {
  const buckets = new Map<string, PlantOpRow[]>();
  for (const r of rows) {
    const g = groupKey(r.operation.name);
    const arr = buckets.get(g) ?? [];
    arr.push(r);
    buckets.set(g, arr);
  }

  const order = ["Tipo A", "Tipo B", "Tipo C"];
  const out: RowItem[] = [];
  for (const g of order) {
    const arr = buckets.get(g);
    if (!arr || arr.length === 0) continue;
    out.push({ kind: "group", id: `g:${g}`, label: g, count: arr.length });
    for (const r of arr) out.push({ kind: "row", id: r.id, row: r });
  }
  return out;
}

export type { RowItem };
