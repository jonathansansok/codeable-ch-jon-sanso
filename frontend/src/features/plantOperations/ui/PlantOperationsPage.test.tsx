import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlantOperationsPage } from "./PlantOperationsPage";

type Tier =
  | "KG_300"
  | "KG_500"
  | "T_1"
  | "T_3"
  | "T_5"
  | "T_10"
  | "T_20"
  | "T_30";

type Plant = { id: string; name: string; code?: string | null };

type PlantOpRow = {
  id: string;
  plant: Plant;
  operation: {
    id: string;
    name: string;
    basePriceUsd: number;
    linkMode: "NONE" | "BY_STRUCTURE";
  };
  margins: Array<{ tier: Tier; marginPercent: number }>;
};

const plant: Plant = { id: "p1", name: "Perú", code: "PE" };

const plantOpRow: PlantOpRow = {
  id: "po1",
  plant,
  operation: {
    id: "op1",
    name: "KROWDY",
    basePriceUsd: 250,
    linkMode: "BY_STRUCTURE",
  },
  margins: [
    { tier: "KG_300", marginPercent: 15 },
    { tier: "KG_500", marginPercent: 15 },
    { tier: "T_1", marginPercent: 15 },
    { tier: "T_3", marginPercent: 15 },
    { tier: "T_5", marginPercent: 15 },
    { tier: "T_10", marginPercent: 15 },
    { tier: "T_20", marginPercent: 15 },
    { tier: "T_30", marginPercent: 15 },
  ],
};

const refetchMock = vi.fn(async () => ({ data: { plantOperations: [plantOpRow] } }));
const setMarginMock = vi.fn(async () => ({
  data: { setMargin: { id: "po1", margins: [{ tier: "KG_300", marginPercent: 4 }] } },
}));

vi.mock("../api/plantOperations.hooks", () => {
  return {
    usePlants: () => ({
      loading: false,
      error: undefined,
      data: { plants: [plant] },
    }),
   usePlantOperations: () => ({
  loading: false,
  error: undefined,
  data: { plantOperations: [plantOpRow] },
  refetch: refetchMock,
}),

    useSetMargin: () => [
      setMarginMock,
      { loading: false, error: undefined, data: undefined },
    ],
  };
});

describe("PlantOperationsPage integration", () => {
  it("edits a cell and commits on blur; shows low-margin tooltip", async () => {
    const user = userEvent.setup();

    render(<PlantOperationsPage />);

    await screen.findByText("KROWDY");

    const table = screen.getByRole("table");
    const row = within(table).getByText("KROWDY").closest("tr");
    expect(row).toBeTruthy();
    if (!row) return;

    const inputs = within(row).getAllByRole("spinbutton");
    expect(inputs.length).toBeGreaterThan(0);

    await user.clear(inputs[0]);
    await user.type(inputs[0], "4");

    await screen.findByText("El número no puede ser menor a 5%");

    await user.tab();

    expect(setMarginMock).toHaveBeenCalled();
    expect(refetchMock).toHaveBeenCalled();
  });
});
