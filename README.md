# codeable-ch-jon-sanso

Assessment Práctico – Configuración de Cotización (Clientes) v2

## Stack
- Backend: Node.js 20.x + GraphQL (Apollo Server) + Prisma + MySQL
- Frontend: React (Vite) + Apollo Client v4 + Material UI (MUI) + TailwindCSS + Zod
- Testing: Backend (node:test) | Frontend (Vitest + React Testing Library + MSW)

## URLs
- Frontend: http://localhost:5173
- GraphQL Playground: http://localhost:4000/graphql

## Requisitos
- Node.js 20.x
- NPM
- MySQL local (XAMPP / Workbench / servicio) o Docker (stack completo)

---

## 0) Variables de entorno

### 0.1 Backend (local) — `backend/.env`
```env
DATABASE_URL="mysql://root@localhost:3306/quoting"
PORT=4000
0.2 Frontend (local) — frontend/.env (opcional)
env
   
VITE_GRAPHQL_URL=http://localhost:4000/graphql
1) DEV sin Docker (para abrir en Google Chrome)
1.1 MySQL local
Yo uso MySQL local (XAMPP/servicio). Con eso:

Host: localhost:3306

DB: quoting

User: root

Pass: vacío o el que tengas configurado

Si no existe la DB:

sql
   
CREATE DATABASE quoting;
1.2 Backend (DEV)

   
cd backend
npm i
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
Backend GraphQL (Playground):

http://localhost:4000/graphql

1.3 Frontend (DEV)

   
cd frontend
npm i
npm run dev
Frontend:

http://localhost:5173

1.4 Abrir en Chrome
Yo abro directamente:

http://localhost:5173 (UI)

http://localhost:4000/graphql (Playground)

1.5 Smoke test GraphQL (PowerShell)
powershell
   
$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
2) PROD sin Docker (build + run)
Objetivo: compilar y ejecutar backend y levantar el build del frontend con vite preview.

2.1 Backend (PROD)

   
cd backend
npm i
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
GraphQL:

http://localhost:4000/graphql

2.2 Frontend (PROD)

   
cd frontend
npm i
npm run build
npm run preview
Frontend (preview):

http://localhost:5173

Notas:

vite preview expone un server de preview (no es Nginx).

Si quisiera simular “PROD con Nginx” sin Docker, serviría frontend/dist con un Nginx local.

3) Docker (stack completo)
Incluye MySQL + Backend + Frontend.

3.1 Docker DEV (hot reload)
MySQL (Docker):

Host: localhost:3307

DB: codeable

User: root

Pass: rootpass

Levantar limpio:


   
docker compose down -v
docker compose up --build
Logs:


   
docker compose logs -f backend
docker compose logs -f frontend
URLs:

Frontend: http://localhost:5173

GraphQL: http://localhost:4000/graphql

Notas:

En docker-compose.yml, el backend espera DB saludable y luego corre prisma generate, prisma migrate deploy y seed si SEED_ON_START=1.

3.2 Docker PROD (build + runner)
Levantar limpio:


   
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
Ver estado:


   
docker compose -f docker-compose.prod.yml ps
Logs:


   
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
URLs:

Frontend (runner): http://localhost:5173

GraphQL: http://localhost:4000/graphql

Notas:

En PROD, frontend corre sobre Nginx (nginx:1.27-alpine) y backend corre node dist/index.js.

En docker-compose.prod.yml, SEED_ON_START=0 por defecto.

4) Demo GraphQL (Playground)
Abrir:

http://localhost:4000/graphql

4.1 Listar plantas
graphql
   
query Plants {
  plants {
    id
    name
    code
  }
}
4.2 Obtener matriz por planta (tabla)
graphql
   
query PlantOperationsMatrix($plantId: ID!) {
  plantOperationsMatrix(plantId: $plantId) {
    id
    plant { id name code }
    operation { id name basePriceUsd linkMode }
    margins { tier marginPercent isLowMargin }
  }
}
Variables:

json
   
{ "plantId": "PLANT_ID" }
4.3 Editar una celda (margen por tier)
graphql
   
mutation SetMargin($plantId: ID!, $operationId: ID!) {
  setMargin(
    plantId: $plantId
    operationId: $operationId
    input: { tier: T_3, marginPercent: 4.5 }
  ) {
    id
    margins { tier marginPercent isLowMargin }
  }
}
Variables:

json
   
{ "plantId": "PLANT_ID", "operationId": "OPERATION_ID" }
4.4 Editar una fila completa (bulk)
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
    margins { tier marginPercent isLowMargin }
  }
}
Variables:

json
   
{ "plantOperationId": "PLANT_OPERATION_ID" }
5) Frontend (UI)
5.1 Alcance implementado (consigna)
Pantalla tipo matriz por planta: selector + tabla editable por rangos (300 kg, 500 kg, 1T, 3T, 5T, 10T, 20T, 30T).

Edición inline por celda (commit en onBlur).

Regla de alerta: si margen <= 5% muestro alerta visual (tooltip + highlight).

Guardado por planta (persistencia vía mutations GraphQL).

Filtro frontend: “Ver solo empresas con datos sobre-escritos” (sin cambiar backend).

5.2 Estructura (carpetas)
src/app/: providers + theme (MUI + light/dark)

src/shared/: UI shell (PageShell)

src/features/plantOperations/

api/: gql + hooks

ui/: page + table + dialog

utils/: tiers / margins helpers

validation/: Zod parse/validate

5.3 Tests (Frontend)
Los tests del frontend son unit/integration con mocks de GraphQL (MSW/mocks), no requieren backend.

Watch:


   
cd frontend
npm run test
CI (una vez):


   
cd frontend
npm run test:run
Incluye:

validation/margin.test.ts (unit: parseMargin)

utils/tiers.test.ts (unit: tierLabel)

utils/margins.test.ts (unit: marginsToRecord)

ui/PlantOperationsPage.test.tsx (integration: edición, blur commit, tooltip <= 5%)

6) Backend
6.1 Requerimientos implementados (consigna)
Prisma modela plantas, operaciones, y configuración de márgenes por rangos.

GraphQL schema + resolvers:

Consultar operaciones con costos/márgenes por planta.

Crear/editar operaciones.

Setear margen por tier y bulk.

6.2 Tests (Backend)
Los tests del backend son integration tests (contract GraphQL + resolvers + Prisma + MySQL).

Recomendación: DB separada para tests (Windows/XAMPP): quoting_test.

Crear DB:

sql
   
CREATE DATABASE quoting_test;
Aplicar migraciones (PowerShell):

powershell
   
cd backend
$env:DATABASE_URL="mysql://root@localhost:3306/quoting_test"; npx prisma migrate dev
Correr tests (PowerShell):

powershell
   
cd backend
$env:DATABASE_URL="mysql://root@localhost:3306/quoting_test"; npm run test
Cobertura funcional (resumen):

plantOperationsMatrix retorna operaciones aunque falte relación previa.

isLowMargin true cuando marginPercent <= 5.

upsertOperation rechaza basePriceUsd negativo.

upsertPlant valida name no vacío (trim).

upsertOperation nombre unique: error legible.

setMarginsBulk actualiza múltiples tiers.

Teardown: prisma.$disconnect().

7) Git (Parte 4)
7.1 Convención de branching
Rama principal: main

Feature branches: feature/... (ej: feature/margins, feature/color)

7.2 Mantener branch actualizado con main
Rebase (rama personal):


   
git checkout feature/color
git fetch origin
git rebase origin/main
Si hay conflictos:


   
git add .
git rebase --continue
Push:


   
git push -f origin feature/color
Merge (rama compartida, evitar rebase):


   
git checkout feature/color
git fetch origin
git merge origin/main
git push origin feature/color
7.3 Conflicto si otro dev edita schema.graphql
Actualizar rama:


   
git fetch origin
git rebase origin/main
Resolver conflicto:

Revisar marcadores <<<<<<<, =======, >>>>>>>

Integrar ambos cambios dejando un único schema coherente (sumar tipos/campos cuando corresponde)

Validar:


   
npm run build
npm test
Continuar:


   
git add schema.graphql
git rebase --continue
8) Entregables (checklist consigna)
Prisma DB model: backend/prisma/schema.prisma

GraphQL schema + resolvers: backend/src/**

React components (tabla costos/márgenes): frontend/src/features/plantOperations/**

Instrucciones para correr el proyecto detalladas al principio de este archivo README