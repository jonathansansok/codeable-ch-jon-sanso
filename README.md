# codeable-ch-jon-sanso

## URLs
- Front (DEV Docker): http://localhost:5173
- Front (PROD Docker): http://localhost:5173
- GraphQL: http://localhost:4000/graphql
- MySQL (host): localhost:3307 (user: root, pass: rootpass, db: codeable)

---

## 1) Run LOCAL (sin Docker)

### Backend
```bash
cd backend
npm i
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
Backend GraphQL:

http://localhost:4000/graphql

Frontend
bash
Copiar código
cd frontend
npm i
npm run dev
Frontend:

http://localhost:5173

Smoke test GraphQL (PowerShell)
powershell
Copiar código
$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
2) Docker DEV (hot reload)
Levantar
bash
Copiar código
docker compose down -v
docker compose up --build
Logs
bash
Copiar código
docker compose logs -f backend
docker compose logs -f frontend
URLs
Front: http://localhost:5173

GraphQL: http://localhost:4000/graphql

Smoke test GraphQL (PowerShell)
powershell
Copiar código
$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
3) Docker PROD (build + runner)
Levantar limpio
bash
Copiar código
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
Ver estado
bash
Copiar código
docker compose -f docker-compose.prod.yml ps
Logs
bash
Copiar código
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
URLs
Front (nginx): http://localhost:5173

GraphQL: http://localhost:4000/graphql

Smoke test GraphQL (PowerShell)
powershell
Copiar código
$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
Nota: GraphQL en navegador
Al abrir http://localhost:4000/graphql en el navegador puede mostrarse:
"Send a POST request to query this endpoint"
Esto es esperado: el endpoint GraphQL requiere POST con JSON (ver smoke tests).

yaml
Copiar código

---

### Dos ajustes mínimos recomendados (para que quede impecable)
1) **El warning `SEED_ON_START` en `docker-compose.prod.yml`**
   - Lo estás viendo porque `SEED_ON_START` no está definido y Compose lo “defaultea”.
   - Solución pro: en `docker-compose.prod.yml`, definilo como `"0"` o agregá `.env.prod`.

2) **URL de GraphQL en PROD**
   - En PROD real, el frontend no debería apuntar a `localhost:4000` (eso es para tu PC).
   - Para el assessment está perfecto, pero en README podés aclarar: “para despliegue real, setear `VITE_GRAPHQL_URL` al host del server”.

---

## 4) Git workflow (Parte 4 del assessment)

### Branching convention
Uso branches por feature con prefijo consistente:

- `feature/installers` (setup inicial del stack)
- `feature/dockerize` (Docker DEV con hot reload)
- `feature/dockerize-prod` (Docker PROD con build + runner)

Ejemplo de creación:
```bash
git checkout -b feature/margins
