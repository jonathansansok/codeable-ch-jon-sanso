import { describe, expect, it } from "vitest";
import { tierLabel } from "./tiers";

describe("tierLabel", () => {
  it("maps tiers to labels", () => {
    expect(tierLabel("KG_300")).toBe("300 kg");
    expect(tierLabel("KG_500")).toBe("500 kg");
    expect(tierLabel("T_1")).toBe("1T");
    expect(tierLabel("T_3")).toBe("3T");
    expect(tierLabel("T_5")).toBe("5T");
    expect(tierLabel("T_10")).toBe("10T");
    expect(tierLabel("T_20")).toBe("20T");
    expect(tierLabel("T_30")).toBe("30T");
  });
});
