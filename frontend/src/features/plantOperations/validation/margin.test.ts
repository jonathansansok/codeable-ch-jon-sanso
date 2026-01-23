import { describe, expect, it } from "vitest";
import { parseMargin } from "./margin";

describe("parseMargin", () => {
  it("empty -> 0 ok", () => {
    const r = parseMargin("");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(0);
  });

  it("invalid -> ok=false", () => {
    const r = parseMargin("abc");
    expect(r.ok).toBe(false);
  });

  it("negative -> ok=false", () => {
    const r = parseMargin("-1");
    expect(r.ok).toBe(false);
  });

  it("valid -> ok=true", () => {
    const r = parseMargin("15.5");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(15.5);
  });
});
