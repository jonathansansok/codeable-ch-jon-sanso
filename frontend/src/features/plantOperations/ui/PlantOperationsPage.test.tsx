//frontend\src\features\plantOperations\ui\PlantOperationsPage.test.tsx
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { AppProviders } from "../../../app/providers/AppProviders";
import { PlantOperationsPage } from "./PlantOperationsPage";

type Tier = "KG_300" | "KG_500" | "T_1" | "T_3" | "T_5" | "T_10" | "T_20" | "T_30";

type Plant = { id: string; name: string; code?: string | null };

type PlantOpRow = {
  id: string;
  plant: Plant;
  operation: { id: string; name: string; basePriceUsd: number; linkMode: "NONE" | "BY_STRUCTURE" };
  margins: Array<{ tier: Tier; marginPercent: number }>;
};

type SetMarginVars = {
  plantId: string;
  operationId: string;
  input: { tier: Tier; marginPercent: number };
};

const plant: Plant = { id: "p1", name: "Perú", code: "PE" };

const plantOpRow: PlantOpRow = {
  id: "po1",
  plant,
  operation: { id: "op1", name: "KROWDY", basePriceUsd: 250, linkMode: "BY_STRUCTURE" },
  margins: [
    { tier: "KG_300", marginPercent: 15 },
    { tier: "KG_500", marginPercent: 15 },
    { tier: "T_1", marginPercent: 15 },
    { tier: "T_3", marginPercent: 15 },
    { tier: "T_5", marginPercent: 15 },
    { tier: "T_10", marginPercent: 15 },
    { tier: "T_20", marginPercent: 15 },
    { tier: "T_30", marginPercent: 15 }
  ]
};

function pickOperationName(body: { operationName?: string | null; query?: string | null }) {
  const op = String(body.operationName ?? "").trim();
  if (op) return op;

  const q = String(body.query ?? "");
  const m = q.match(/\b(query|mutation)\s+([A-Za-z0-9_]+)/);
  return m?.[2] ? String(m[2]) : "";
}

const server = setupServer(
  http.post("http://test/graphql", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      query?: string | null;
      variables?: unknown;
      operationName?: string | null;
    };

    const opName = pickOperationName(body).toLowerCase();
    const q = String(body.query ?? "").toLowerCase();
    const vars = (body.variables ?? {}) as Record<string, unknown>;

    const isPlants =
      opName === "getplants" ||
      q.includes("plants") && q.includes("query");

    if (isPlants) {
      return HttpResponse.json({ data: { plants: [plant] } });
    }

    const isPlantOps =
      opName === "getplantoperations" ||
      (q.includes("plantoperations") && q.includes("query") && !q.includes("plantoperationsmatrix"));

    if (isPlantOps) {
      const plantId = String((vars as { plantId?: string }).plantId ?? "");
      return HttpResponse.json({
        data: { plantOperations: plantId === "p1" ? [plantOpRow] : [] }
      });
    }

    const isPlantOpsMatrix =
      opName === "plantoperationsmatrix" ||
      opName === "getplantoperationsmatrix" ||
      (q.includes("plantoperationsmatrix") && q.includes("query"));

    if (isPlantOpsMatrix) {
      const plantId = String((vars as { plantId?: string }).plantId ?? "");
      return HttpResponse.json({
        data: { plantOperationsMatrix: plantId === "p1" ? [plantOpRow] : [] }
      });
    }

    const isSetMargin =
      opName === "setmargin" ||
      (q.includes("setmargin") && q.includes("mutation"));

    if (isSetMargin) {
      const v = vars as SetMarginVars;
      return HttpResponse.json({
        data: {
          setMargin: {
            id: "po1",
            margins: [{ tier: v.input.tier, marginPercent: v.input.marginPercent }]
          }
        }
      });
    }

    return HttpResponse.json(
      { errors: [{ message: `Unhandled GraphQL op: ${opName || "anonymous"}` }] },
      { status: 500 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function buildTestClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "http://test/graphql", fetch }),
    cache: new InMemoryCache()
  });
}

describe("PlantOperationsPage integration", () => {
  it("edits a cell and commits on blur; shows low-margin tooltip", async () => {
    const user = userEvent.setup();
    const client = buildTestClient();

    render(
      <ApolloProvider client={client}>
        <AppProviders>
          <PlantOperationsPage />
        </AppProviders>
      </ApolloProvider>
    );

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
  });
});
