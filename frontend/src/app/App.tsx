import { useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { PageShell } from "../shared/ui/PageShell";
import { PlantOperationsPage } from "../features/plantOperations/ui/PlantOperationsPage";

type NavKey =
  | "precios_base"
  | "waste"
  | "costos_indirectos"
  | "clientes"
  | "comisiones"
  | "tipos_cambio"
  | "tasa_financiera_anual"
  | "logistica"
  | "embalaje_especial";

export default function App() {
  const navItems = useMemo(
    () => [
      { key: "precios_base", label: "Precios Base" },
      { key: "waste", label: "Waste" },
      { key: "costos_indirectos", label: "Costos indirectos" },
      { key: "clientes", label: "Clientes" },
      { key: "comisiones", label: "Comisiones" },
      { key: "tipos_cambio", label: "Tipos de cambio" },
      { key: "tasa_financiera_anual", label: "Tasa financiera anual" },
      { key: "logistica", label: "Logística" },
      { key: "embalaje_especial", label: "Embalaje especial" }
    ],
    []
  );

  const [active, setActive] = useState<NavKey>("clientes");

  return (
    <PageShell
      title="Configuración de Cotización"
      navItems={navItems}
      activeNavKey={active}
      onNavChange={(k) => setActive(k as NavKey)}
    >
      {active === "clientes" ? (
        <PlantOperationsPage />
      ) : (
        <Paper variant="outlined" className="p-6">
          <Typography variant="h6" fontWeight={800}>
            {navItems.find((x) => x.key === active)?.label}
          </Typography>
          <Box className="mt-2">
            <Typography color="text.secondary">
              Placeholder UI. El foco de este assessment está en “Clientes” (tabla editable con márgenes por volumen).
            </Typography>
          </Box>
        </Paper>
      )}
    </PageShell>
  );
}
