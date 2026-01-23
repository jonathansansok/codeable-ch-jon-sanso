import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import { useMemo, useState } from "react";
import { PlantSelector } from "./PlantSelector";
import { PlantOperationsTable } from "./PlantOperationsTable";
import {
  usePlants,
  usePlantOperations,
  useSetMargin,
} from "../api/plantOperations.hooks";
import type { Tier } from "../../../types/domain";

export function PlantOperationsPage() {
  const plantsQ = usePlants();
  const plants = useMemo(() => plantsQ.data?.plants ?? [], [plantsQ.data]);

  const defaultPlantId = useMemo(() => plants[0]?.id ?? "", [plants]);
  const [plantId, setPlantId] = useState<string>("");

  const effectivePlantId = plantId || defaultPlantId;

  const opsQ = usePlantOperations(effectivePlantId);
  const rows = opsQ.data?.plantOperations ?? [];

  const [setMargin, setMarginM] = useSetMargin();

  async function onCommit(opId: string, tier: Tier, nextValue: number) {
    await setMargin({
      variables: {
        plantId: effectivePlantId,
        operationId: opId,
        input: { tier, marginPercent: nextValue },
      },
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
    return (
      <Alert severity="error">Error plants: {plantsQ.error.message}</Alert>
    );
  }

  return (
    <Box className="space-y-4">
      <Box className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <Box className="md:col-span-5 lg:col-span-4">
          <PlantSelector
            plants={plants}
            value={effectivePlantId}
            onChange={setPlantId}
          />
        </Box>

        <Box className="md:col-span-7 lg:col-span-8">
          <Box className="flex items-center justify-end gap-3">
            {setMarginM.loading && (
              <Typography variant="body2">Guardando…</Typography>
            )}
          </Box>
        </Box>
      </Box>

      {opsQ.loading && (
        <Box className="flex items-center justify-center py-10">
          <CircularProgress />
        </Box>
      )}

      {opsQ.error && (
        <Alert severity="error">Error operations: {opsQ.error.message}</Alert>
      )}

      {!opsQ.loading && rows.length === 0 && (
        <Alert severity="info">Sin operaciones para esta planta.</Alert>
      )}

      {rows.length > 0 && (
        <PlantOperationsTable rows={rows} onCommit={onCommit} />
      )}

      {setMarginM.error && (
        <Alert severity="error">
          Error guardando: {setMarginM.error.message}
        </Alert>
      )}
    </Box>
  );
}
