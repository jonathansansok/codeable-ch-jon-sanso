import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

import { useMemo, useState } from "react";

const GET_PLANTS = gql`
  query GetPlants {
    plants {
      id
      name
      code
    }
  }
`;

const GET_PLANT_OPERATIONS = gql`
  query GetPlantOperations($plantId: ID!) {
    plantOperations(plantId: $plantId) {
      id
      plant {
        id
        name
        code
      }
      operation {
        id
        name
        basePriceUsd
        linkMode
      }
      margins {
        tier
        marginPercent
      }
    }
  }
`;

const SET_MARGIN = gql`
  mutation SetMargin($plantId: ID!, $operationId: ID!, $input: SetMarginInput!) {
    setMargin(plantId: $plantId, operationId: $operationId, input: $input) {
      id
      margins {
        tier
        marginPercent
      }
    }
  }
`;

type Plant = { id: string; name: string; code?: string | null };

type Tier =
  | "KG_300"
  | "KG_500"
  | "T_1"
  | "T_3"
  | "T_5"
  | "T_10"
  | "T_20"
  | "T_30";

type Margin = { tier: Tier; marginPercent: number };

type PlantOpRow = {
  id: string;
  plant: { id: string; name: string; code?: string | null };
  operation: { id: string; name: string; basePriceUsd: number; linkMode: "NONE" | "BY_STRUCTURE" };
  margins: Margin[];
};

type GetPlantsData = { plants: Plant[] };
type GetPlantOperationsData = { plantOperations: PlantOpRow[] };

function tierLabel(t: Tier) {
  if (t === "KG_300") return "300 kg";
  if (t === "KG_500") return "500 kg";
  if (t === "T_1") return "1T";
  if (t === "T_3") return "3T";
  if (t === "T_5") return "5T";
  if (t === "T_10") return "10T";
  if (t === "T_20") return "20T";
  return "30T";
}

function num(v: unknown) {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function App() {
  const plantsQ = useQuery<GetPlantsData>(GET_PLANTS);

const plants = useMemo(() => plantsQ.data?.plants ?? [], [plantsQ.data]);


  const defaultPlantId = useMemo(() => plants[0]?.id ?? "", [plants]);

  const [plantId, setPlantId] = useState<string>("");

  const effectivePlantId = plantId || defaultPlantId;

  const tiers = useMemo<Tier[]>(
    () => ["KG_300", "KG_500", "T_1", "T_3", "T_5", "T_10", "T_20", "T_30"],
    []
  );

  const plantOpsQ = useQuery<GetPlantOperationsData>(GET_PLANT_OPERATIONS, {
    variables: { plantId: effectivePlantId },
    skip: !effectivePlantId,
    fetchPolicy: "cache-and-network",
  });

  const [setMargin, setMarginM] = useMutation(SET_MARGIN);

  const [draft, setDraft] = useState<Record<string, string>>({});

  const rows = plantOpsQ.data?.plantOperations ?? [];

  async function commitCell(operationId: string, tier: Tier, currentValue: number) {
    const key = `${operationId}:${tier}`;
    const raw = draft[key];
    if (raw == null) return;

    const next = raw.trim() === "" ? 0 : Number(raw);
    if (!Number.isFinite(next)) return;

    if (next === currentValue) {
      setDraft((prev: Record<string, string>) => {
        const copy: Record<string, string> = { ...prev };
        delete copy[key];
        return copy;
      });
      return;
    }

    await setMargin({
      variables: { plantId: effectivePlantId, operationId, input: { tier, marginPercent: next } },
    });

    await plantOpsQ.refetch();

    setDraft((prev: Record<string, string>) => {
      const copy: Record<string, string> = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  if (plantsQ.loading) return <div>Loading plants...</div>;
  if (plantsQ.error) return <div>Error plants: {plantsQ.error.message}</div>;

  return (
    <div>
      <h2>Configuración de Cotización</h2>

      <div>
        <label>Planta: </label>
        <select value={effectivePlantId} onChange={(e) => setPlantId(e.target.value)}>
          {plants.map((p: Plant) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.code ? `(${p.code})` : ""}
            </option>
          ))}
        </select>
      </div>

      {plantOpsQ.loading && <div>Loading operations...</div>}
      {plantOpsQ.error && <div>Error operations: {plantOpsQ.error.message}</div>}

      {!plantOpsQ.loading && rows.length === 0 && <div>Sin operaciones para esta planta.</div>}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Operación</th>
              <th>Base USD</th>
              <th>LinkMode</th>
              {tiers.map((t: Tier) => (
                <th key={t}>{tierLabel(t)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r: PlantOpRow) => {
              const marginByTier = new Map<Tier, number>();
              r.margins.forEach((m: Margin) => marginByTier.set(m.tier, num(m.marginPercent)));

              return (
                <tr key={r.id}>
                  <td>{r.operation.name}</td>
                  <td>{num(r.operation.basePriceUsd).toFixed(2)}</td>
                  <td>{r.operation.linkMode}</td>

                  {tiers.map((t: Tier) => {
                    const key = `${r.operation.id}:${t}`;
                    const current = marginByTier.get(t) ?? 0;
                    const value = draft[key] ?? String(current);

                    const parsed = value.trim() === "" ? 0 : Number(value);
                    const alert = Number.isFinite(parsed) && parsed <= 5;

                    return (
                      <td key={t}>
                        <input
                          type="number"
                          step="0.01"
                          value={value}
                          onChange={(e) => setDraft((prev: Record<string, string>) => ({ ...prev, [key]: e.target.value }))}
                          onBlur={() => commitCell(r.operation.id, t, current)}
                        />
                        {alert && <div>ALERTA (≤ 5%)</div>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {setMarginM.loading && <div>Guardando...</div>}
      {setMarginM.error && <div>Error guardando: {setMarginM.error.message}</div>}
    </div>
  );
}
