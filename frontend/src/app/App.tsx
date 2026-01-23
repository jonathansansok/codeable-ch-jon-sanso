import { PageShell } from "../shared/ui/PageShell";

import { PlantOperationsPage } from "../../src/features/plantOperations/ui/PlantOperationsPage";
export default function App() {
  return (
    <PageShell title="Configuración de Cotización">
      <PlantOperationsPage />
    </PageShell>
  );
}
