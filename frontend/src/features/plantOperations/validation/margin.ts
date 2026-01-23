//frontend\src\features\plantOperations\validation\margin.ts
import { z } from "zod";

export const marginSchema = z
  .number()
  .finite()
  .min(0, "El margen no puede ser negativo")
  .max(100, "El margen no puede ser mayor a 100");

export function parseMargin(raw: string) {
  const t = raw.trim();
  if (t === "") return { ok: true as const, value: 0 };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false as const, message: "Valor inválido" };
  const r = marginSchema.safeParse(n);
  if (!r.success) return { ok: false as const, message: r.error.issues[0]?.message ?? "Valor inválido" };
  return { ok: true as const, value: r.data };
}
