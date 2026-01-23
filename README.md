# codeable-ch-jon-sanso

Assessment Práctico – Configuración de Cotización (Clientes) v2

Backend: Node.js 20.x + GraphQL (Apollo Server) + Prisma + MySQL  
Frontend: React (Vite) + Apollo Client

---

## 0) URLs

- Frontend (DEV): http://localhost:5173
- Frontend (PROD - Nginx): http://localhost:5173
- GraphQL: http://localhost:4000/graphql

---

## 1) MySQL (notas)

### Local (sin Docker)
- Host: localhost:3306
- DB: quoting
- User: root
- Pass: (vacío / según tu setup)

### Docker (stack completo)
- Host: localhost:3307
- DB: codeable
- User: root
- Pass: rootpass  
- Fuente: docker-compose del repo

---

## 2) Requisitos

- Node.js 20.x (recomendado por consigna)
- MySQL disponible (XAMPP/Workbench/servicio local) **o** Docker (para levantar stack completo)
- NPM instalado

---

## 3) Environment

### Backend `.env` (local)
Ejemplo mínimo:

```env
DATABASE_URL="mysql://root@localhost:3306/quoting"
PORT=4000
Frontend .env (opcional)
Para apuntar a GraphQL:

env
 
VITE_GRAPHQL_URL=http://localhost:4000/graphql
4) Run LOCAL (sin Docker)
4.1 Backend
 
cd backend
npm i
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
Endpoint GraphQL / Playground:

http://localhost:4000/graphql

4.2 Frontend
 
cd frontend
npm i
npm run dev
Frontend:

http://localhost:5173

4.3 Smoke test GraphQL (PowerShell)
powershell
 
$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
5) Docker DEV (hot reload)
5.1 Levantar limpio
 
docker compose down -v
docker compose up --build
5.2 Logs
 
docker compose logs -f backend
docker compose logs -f frontend
5.3 URLs
Frontend: http://localhost:5173

GraphQL: http://localhost:4000/graphql

6) Docker PROD (build + runner)
6.1 Levantar limpio
 
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
6.2 Ver estado
 
docker compose -f docker-compose.prod.yml ps
6.3 Logs
 
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
6.4 URLs
Frontend (nginx): http://localhost:5173

GraphQL: http://localhost:4000/graphql

7) Frontend
7.1 Tech Stack
React (Vite)

Apollo Client v4 (GraphQL)

Material UI (MUI) v7 + Emotion

TailwindCSS (utility classes para layout/spacing)

Zod (validación de inputs)

Testing: Vitest + React Testing Library + MSW (mock de GraphQL en integración)

7.2 Estructura (recruiter-friendly / mantenible)
src/app/
Providers y theme (ColorMode + MUI ThemeProvider)

src/shared/
UI shell reutilizable (PageShell)

src/features/plantOperations/

api/ queries/mutations + hooks

ui/ página + tabla + selector

utils/ helpers (tiers, labels)

validation/ parse/validate (Zod)

7.3 UI / UX (según consigna)
Pantalla de matriz por planta (PlantSelector + tabla)

Edición de celda por tier (commit onBlur)

Alerta de margen bajo (≤ 5%) en la celda (Tooltip + highlight)

Filtro frontend: “Ver solo empresas con datos sobre-escritos” (sin tocar backend)

7.4 Ejecutar Frontend (Local)
 
cd frontend
npm i
npm run dev
http://localhost:5173

7.5 Tests (Frontend)
Los tests del frontend son integration tests de UI con mock de GraphQL vía MSW
(no requiere backend corriendo).

Modo watch:

 
cd frontend
npm run test
Una vez (CI):

 
cd frontend
npm run test:run
Tests incluidos (4 archivos):

validation/margin.test.ts
Unit test: parseMargin (vacío, inválido, negativo, decimal válido)

utils/tiers.test.ts
Unit test: tierLabel (KG_300, T_1, etc. → “300 kg”, “1T”, “10T”)

utils/margins.test.ts
Unit test: marginsToRecord (completa tiers faltantes con 0)

ui/PlantOperationsPage.test.tsx
Integration (RTL): render “KROWDY”, edición de margen, alerta <= 5%, commit al blur (refetch)

8) GraphQL Demo (Playground)
Abrir:

http://localhost:4000/graphql

8.1 Listar plantas
graphql
 
query Plants {
  plants {
    id
    name
    code
  }
}
8.2 Obtener matriz completa por planta (tabla)
graphql
 
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

json
 
{ "plantId": "PLANT_ID" }
8.3 Editar una celda (margen por tier)
graphql
 
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

json
 
{
  "plantId": "PLANT_ID",
  "operationId": "OPERATION_ID"
}
8.4 Editar una fila completa (bulk)
graphql
 
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

json
 
{ "plantOperationId": "PLANT_OPERATION_ID" }
9) Tests (Backend)
Los tests del backend son integration tests (GraphQL contract + resolvers + Prisma + MySQL).
Para no afectar la base demo (quoting), se recomienda usar DB separada: quoting_test.

9.1 Setup DB de tests (una sola vez)
Notas (Windows / XAMPP / Prisma):

Si usás MySQL local via XAMPP, asegurate de que el servicio esté iniciado antes de migraciones/seed/tests.

Crear DB quoting_test en MySQL:

sql
 
CREATE DATABASE quoting_test;
Aplicar migraciones sobre quoting_test (PowerShell):

powershell
 
cd backend
$env:DATABASE_URL="mysql://root@localhost:3306/quoting_test"; npx prisma migrate dev
Correr tests usando quoting_test (PowerShell):

powershell
 
cd backend
$env:DATABASE_URL="mysql://root@localhost:3306/quoting_test"; npm run test
9.2 Cobertura funcional (notas)
plantOperationsMatrix devuelve operaciones aunque no exista PlantOperation

isLowMargin true cuando marginPercent <= 5

upsertOperation rechaza basePriceUsd negativo

upsertPlant rechaza name vacío (trim)

upsertOperation nombre unique devuelve error legible

setMarginsBulk actualiza múltiples tiers

Teardown: solo cleanup prisma.$disconnect()

Total: 6 tests funcionales/integration + 1 teardown

10) Git
10.1 Convención de branching
Branch principal: main

Feature branches: feature/... (ej. feature/margins, feature/color)

10.2 Mantener mi branch actualizado con main (simulación operativa)
Cambiar a la rama:

 
git checkout feature/color
Traer cambios del remoto:

 
git fetch origin
Rebase con main:

 
git rebase origin/main
Si hubo conflictos:

resolver archivos

git add .

git rebase --continue

Subir rama:

Si es rama personal (rebase):

 
git push -f origin feature/color
Si es rama compartida, evitar rebase; usar merge:

 
git merge origin/main
git push origin feature/color
Abrir PR hacia main con la rama sincronizada.

10.3 Manejo de conflicto si otro dev edita schema.graphql
Traer cambios:

 
git fetch origin
Actualizar rama:

 
git rebase origin/main
(o merge si la rama es compartida)

Resolver conflicto en schema.graphql:

revisar marcadores <<<<<<< ======= >>>>>>>

integrar ambos cambios de forma coherente (sumar tipos/campos cuando corresponde)

dejar un único schema consistente

Validar:

 
npm run build
npm test
Marcar resuelto y continuar:

 
git add schema.graphql
git rebase --continue
(o commit si fue merge)

Subir:

git push -f si fue rebase

git push normal si fue merge

makefile
 
::contentReference[oaicite:0]{index=0}