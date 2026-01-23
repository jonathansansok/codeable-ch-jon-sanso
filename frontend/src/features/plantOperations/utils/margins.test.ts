import { describe, expect, it } from "vitest";
import { marginsToRecord } from "./margins";

describe("marginsToRecord", () => {
  it("fills missing tiers with 0", () => {
    const r = marginsToRecord([
      { tier: "KG_300", marginPercent: 15 },
      { tier: "T_10", marginPercent: 20 }
    ]);
    expect(r.KG_300).toBe(15);
    expect(r.T_10).toBe(20);
    expect(r.T_30).toBe(0);
  });
});
