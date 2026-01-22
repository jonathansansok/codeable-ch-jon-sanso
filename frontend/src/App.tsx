import React, { useMemo, useState } from "react";
import { ApolloProvider, useMutation, useQuery } from "@apollo/client";
import { apollo } from "./apollo";
import { Q_PLANTS, Q_PLANT_OPERATIONS, Q_VOLUME_TIERS, M_SET_MARGIN } from "./graphql";

type Tier = "KG_300" | "KG_500" | "T_1" | "T_3" | "T_5" | "T_10" | "T_20" | "T_30";

function tierLabel(t: Tier) {
  if (t === "KG_300") return "300 kg";
  if (t === "KG_500") return "500 kg";
  if (t === "T_1") return "1 T";
  if (t === "T_3") return "3 T";
  if (t === "T_5") return "5 T";
  if (t === "T_10") return "10 T";
  if (t === "T_20") return "20 T";
  return "30 T";
}

function Screen() {
  const plantsQ = useQuery(Q_PLANTS);
  const tiersQ = useQuery(Q_VOLUME_TIERS);

  const plants = plantsQ.data?.plants ?? [];
  const tiers = (tiersQ.data?.volumeTiers ?? []) as Tier[];

  const [plantId, setPlantId] = useState<string>("");

  React.useEffect(() => {
    if (!plantId && plants.length > 0) setPlantId(plants[0].id);
  }, [plantId, plants]);

  const rowsQ = useQuery(Q_PLANT_OPERATIONS, {
    variables: { plantId },
    skip: !plantId,
    fetchPolicy: "cache-and-network",
  });

  const [setMargin] = useMutation(M_SET_MARGIN);

  const rows = rowsQ.data?.plantOperations ?? [];

  const table = useMemo(() => {
    return rows.map((r: any) => {
      const byTier = new Map<string, number>();
      for (const m of r.margins ?? []) byTier.set(String(m.tier), Number(m.marginPercent));
      return {
        id: r.id,
        operationId: r.operation.id,
        name: r.operation.name,
        basePriceUsd: r.operation.basePriceUsd,
        linkMode: r.operation.linkMode,
        byTier,
      };
    });
  }, [rows]);

  if (plantsQ.loading || tiersQ.loading) return <div>Cargando...</div>;
  if (plantsQ.error) return <div>Error: {String(plantsQ.error.message)}</div>;
  if (tiersQ.error) return <div>Error: {String(tiersQ.error.message)}</div>;

  return (
    <div>
      <div>
        <select value={plantId} onChange={(e) => setPlantId(e.target.value)}>
          {plants.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {rowsQ.loading && <div>Cargando operaciones...</div>}
      {rowsQ.error && <div>Error: {String(rowsQ.error.message)}</div>}

      <table>
        <thead>
          <tr>
            <th>Operación</th>
            <th>Base USD</th>
            <th>Vincular</th>
            {tiers.map((t) => (
              <th key={t}>{tierLabel(t)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {table.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{Number(r.basePriceUsd).toFixed(2)}</td>
              <td>{r.linkMode}</td>
              {tiers.map((t) => {
                const v = r.byTier.get(String(t)) ?? 0;
                const alert = v <= 5;
                return (
                  <td key={t}>
                    <input
                      type="number"
                      step="0.01"
                      value={String(v)}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        r.byTier.set(String(t), Number.isFinite(next) ? next : 0);
                      }}
                      onBlur={async (e) => {
                        const next = Number(e.target.value);
                        const safe = Number.isFinite(next) ? next : 0;
                        await setMargin({
                          variables: {
                            plantId,
                            operationId: r.operationId,
                            input: { tier: t, marginPercent: safe },
                          },
                          refetchQueries: [{ query: Q_PLANT_OPERATIONS, variables: { plantId } }],
                        });
                      }}
                    />
                    {alert ? <div>El número no puede ser menor a 5%</div> : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  return (
    <ApolloProvider client={apollo}>
      <Screen />
    </ApolloProvider>
  );
}
