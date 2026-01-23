import { z } from "zod";

const MSG = {
  invalid: "Valor inválido",
  negative: "No puede ser\nnegativo",
  max: "Máximo\n100%"
};

export const marginSchema = z
  .number()
  .finite()
  .min(0, MSG.negative)
  .max(100, MSG.max);

export function parseMargin(raw: string) {
  const t = raw.trim();
  if (t === "") return { ok: true as const, value: 0 };

  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false as const, message: MSG.invalid };

  const r = marginSchema.safeParse(n);
  if (!r.success) {
    return {
      ok: false as const,
      message: r.error.issues[0]?.message ?? MSG.invalid
    };
  }

  return { ok: true as const, value: r.data };
}
