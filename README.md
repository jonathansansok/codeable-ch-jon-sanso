codeable-ch-jon-sanso
Assessment Práctico – Configuración de Cotización (Clientes) v2
Backend: Node.js 20.x + GraphQL (Apollo Server) + Prisma + MySQL. Frontend: React + Apollo Client.
URLs
•	Frontend (DEV): http://localhost:5173
•	Frontend (PROD - Nginx): http://localhost:5173
•	GraphQL: http://localhost:4000/graphql
Notas sobre MySQL:
•	Local (sin Docker): MySQL en localhost:3306, base de datos quoting.
•	Docker: MySQL expuesto en localhost:3307 (root/rootpass), base de datos codeable (según docker-compose).
Requisitos
•	Node.js 20.x (recomendado por la consigna).
•	MySQL disponible (XAMPP/Workbench/servicio local) o Docker para el stack completo.
Environment
Ejemplo de archivo .env para correr el backend en local:
DATABASE_URL="mysql://root@localhost:3306/quoting"
PORT=4000
1) Run LOCAL (sin Docker)
Backend
cd backend
npm i
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
GraphQL Playground / endpoint:
http://localhost:4000/graphql
Frontend
cd frontend
npm i
npm run dev
Frontend:
http://localhost:5173
Smoke test GraphQL (PowerShell)
$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
2) Docker DEV (hot reload)
Levantar
docker compose down -v
docker compose up --build
Logs
docker compose logs -f backend
docker compose logs -f frontend
URLs
•	Frontend: http://localhost:5173
## Frontend

### Tech Stack
- React (Vite)
- Apollo Client v4 (GraphQL)
- Material UI (MUI) v7 + Emotion (styling engine)
- TailwindCSS (utility classes para layout/spacing)
- Zod (validación de inputs)
- Testing: Vitest + React Testing Library + MSW (mock de GraphQL en integración)

### Estructura (orientada a recruiter / mantenible)
- `src/app/` providers y theme (ColorMode + MUI ThemeProvider)
- `src/shared/` UI shell reutilizable (`PageShell`)
- `src/features/plantOperations/`
  - `api/` queries/mutations + hooks
  - `ui/` página + tabla + selector
  - `utils/` helpers (tiers, labels)
  - `validation/` parse/validate (Zod)

### UI / UX (según consigna)
- Pantalla de matriz por planta (PlantSelector + tabla)
- Edición de celda por tier (commit onBlur)
- Alerta de margen bajo (≤ 5%) en la celda (Tooltip + highlight)
- Filtro frontend: “Ver solo empresas con datos sobre-escritos” (sin tocar backend)

### Ejecutar Frontend (Local)

cd frontend
npm i
npm run dev
Frontend:

http://localhost:5173

Variables de Entorno (Frontend)
Opcional para apuntar a GraphQL:

VITE_GRAPHQL_URL=http://localhost:4000/graphql

Tests (Frontend)
Los tests del frontend son integration tests de UI con mock de GraphQL vía MSW
(no requiere backend corriendo).

Correr en modo watch:

cd frontend
npm run test
Correr una vez (CI):

cd frontend
npm run test:run
Notas:

Se puede ejecutar npm run dev y npm run test en paralelo sin conflicto.

MSW intercepta requests GraphQL en tests y responde con fixtures tipados.
•	GraphQL: http://localhost:4000/graphql
Smoke test GraphQL (PowerShell)
$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
3) Docker PROD (build + runner)
Levantar limpio
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
Ver estado
docker compose -f docker-compose.prod.yml ps
Logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
URLs
•	Frontend (nginx): http://localhost:5173
•	GraphQL: http://localhost:4000/graphql
GraphQL Demo (Playground)
Abrir:
http://localhost:4000/graphql
1) Listar plantas
query Plants {
  plants {
    id
    name
    code
  }
}
2) Obtener matriz completa por planta (tabla)
query PlantOperationsMatrix($plantId: ID!) {
  plantOperationsMatrix(plantId: $plantId) {
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
      isLowMargin
    }
  }
}
Variables:
{ "plantId": "PLANT_ID" }
3) Editar una celda (margen por tier)
mutation SetMargin($plantId: ID!, $operationId: ID!) {
  setMargin(
    plantId: $plantId
    operationId: $operationId
    input: { tier: T_3, marginPercent: 4.5 }
  ) {
    id
    margins {
      tier
      marginPercent
      isLowMargin
    }
  }
}
Variables:
{
  "plantId": "PLANT_ID",
  "operationId": "OPERATION_ID"
}
4) Editar una fila completa (bulk)
mutation SetMarginsBulk($plantOperationId: ID!) {
  setMarginsBulk(
    plantOperationId: $plantOperationId
    inputs: [
      { tier: KG_300, marginPercent: 15 }
      { tier: KG_500, marginPercent: 15 }
      { tier: T_1, marginPercent: 15 }
      { tier: T_3, marginPercent: 4.5 }
      { tier: T_5, marginPercent: 14 }
      { tier: T_10, marginPercent: 20 }
      { tier: T_20, marginPercent: 15 }
      { tier: T_30, marginPercent: 15 }
    ]
  ) {
    id
    margins {
      tier
      marginPercent
      isLowMargin
    }
  }
}
Variables:
{ "plantOperationId": "PLANT_OPERATION_ID" }


## Tests

Los tests son **integration tests** (GraphQL contract + resolvers + Prisma + MySQL).  
Para no afectar la base de datos de demo (`quoting`), se recomienda usar una DB separada para tests: `quoting_test`.

### Setup DB de tests (una sola vez)

0. Notas (Windows / XAMPP / Prisma)

En Windows, si usás MySQL local via XAMPP, asegurate de que el servicio esté iniciado antes de correr migraciones/seed/tests.

1) Crear DB `quoting_test` en MySQL:
```sql

CREATE DATABASE quoting_test;


2. Aplicar migraciones sobre quoting_test (PowerShell):

cd backend
$env:DATABASE_URL="mysql://root@localhost:3306/quoting_test"; npx prisma migrate dev

3. Correr tests usando quoting_test (PowerShell)
cd backend
$env:DATABASE_URL="mysql://root@localhost:3306/quoting_test"; npm run test

NOTA:

plantOperationsMatrix devuelve operaciones aunque no exista PlantOperation

isLowMargin true cuando marginPercent <= 5

upsertOperation rechaza basePriceUsd negativo

upsertPlant rechaza name vacío (trim)

upsertOperation nombre unique devuelve error legible

setMarginsBulk actualiza múltiples tiers

teardown (solo cleanup: prisma.$disconnect())

* 6 tests funcionales/integration + 1 teardown.
