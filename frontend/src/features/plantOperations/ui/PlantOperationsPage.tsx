//frontend\src\features\plantOperations\ui\PlantOperationsPage.tsx
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { PlantSelector } from "./PlantSelector";
import { PlantOperationsTable } from "./PlantOperationsTable";
import { usePlants, usePlantOperations, useSetMargin } from "../api/plantOperations.hooks";
import type { PlantOpRow, Tier } from "../../../types/domain";

function isOverwrittenRow(r: PlantOpRow) {
  const vals = r.margins.map((m) => Number(m.marginPercent));
  if (vals.length === 0) return false;
  const counts = new Map<number, number>();
  for (const v of vals) counts.set(v, (counts.get(v) ?? 0) + 1);
  let mode = vals[0];
  let best = 0;
  for (const [k, c] of counts) {
    if (c > best) {
      best = c;
      mode = k;
    }
  }
  return vals.some((v) => v !== mode);
}
export function PlantOperationsPage() {
  const plantsQ = usePlants();
  const plants = useMemo(() => plantsQ.data?.plants ?? [], [plantsQ.data]);

  const defaultPlantId = useMemo(() => plants[0]?.id ?? "", [plants]);
  const [plantId, setPlantId] = useState<string>("");
  const effectivePlantId = plantId || defaultPlantId;

  const opsQ = usePlantOperations(effectivePlantId);
const rawRows = useMemo(() => opsQ.data?.plantOperations ?? [], [opsQ.data]);

const [onlyOverwritten, setOnlyOverwritten] = useState(false);
const rows = useMemo(() => {
  if (!onlyOverwritten) return rawRows;
  return rawRows.filter(isOverwrittenRow);
}, [onlyOverwritten, rawRows]);


  const [setMargin, setMarginM] = useSetMargin();

  async function onCommit(opId: string, tier: Tier, nextValue: number) {
    await setMargin({
      variables: {
        plantId: effectivePlantId,
        operationId: opId,
        input: { tier, marginPercent: nextValue }
      }
    });

    await opsQ.refetch();
  }

  if (plantsQ.loading) {
    return (
      <Box className="flex items-center justify-center py-20">
        <CircularProgress />
      </Box>
    );
  }

  if (plantsQ.error) {
    return <Alert severity="error">Error plants: {plantsQ.error.message}</Alert>;
  }

  return (
    <Box className="space-y-4">
      <Box className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <Box className="md:col-span-5 lg:col-span-4">
          <PlantSelector plants={plants} value={effectivePlantId} onChange={setPlantId} />
        </Box>

        <Box className="md:col-span-7 lg:col-span-8">
          <Box className="flex items-center justify-end gap-3">
            <FormControlLabel
              control={
                <Switch
                  checked={onlyOverwritten}
                  onChange={(e) => setOnlyOverwritten(e.target.checked)}
                />
              }
              label="Ver solo empresas con datos sobre-escritos"
            />

            {setMarginM.loading && <Typography variant="body2">Guardando…</Typography>}
          </Box>
        </Box>
      </Box>

      {opsQ.loading && (
        <Box className="flex items-center justify-center py-10">
          <CircularProgress />
        </Box>
      )}

      {opsQ.error && <Alert severity="error">Error operations: {opsQ.error.message}</Alert>}

      {!opsQ.loading && rows.length === 0 && (
        <Alert severity="info">Sin operaciones para esta planta.</Alert>
      )}

     {rows.length > 0 && (
  <PlantOperationsTable
    plantId={effectivePlantId}
    rows={rows}
    onCommit={onCommit}
    onRefetch={async () => {
  await opsQ.refetch();
}}
  />
)}


      {setMarginM.error && <Alert severity="error">Error guardando: {setMarginM.error.message}</Alert>}
    </Box>
  );
}
