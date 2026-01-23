# codeable-ch-jon-sanso

## URLs
- Front (DEV Docker): http://localhost:5173
- Front (PROD Docker - Nginx): http://localhost:5173
- GraphQL: http://localhost:4000/graphql
- MySQL (host): localhost:3307 (user: root, pass: rootpass, db: codeable)

---

## 1) Run LOCAL (sin Docker)

### Backend
   
cd backend
npm i
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
Backend GraphQL:

http://localhost:4000/graphql

Frontend
    

cd frontend
npm i
npm run dev
Frontend:

http://localhost:5173

Smoke test GraphQL (PowerShell)
powershell

$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
2) Docker DEV (hot reload)
Levantar
    

docker compose down -v
docker compose up --build
Logs
    

docker compose logs -f backend
docker compose logs -f frontend
URLs:

Front: http://localhost:5173

GraphQL: http://localhost:4000/graphql

Smoke test GraphQL (PowerShell)
powershell

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
URLs:

Front (nginx): http://localhost:5173

GraphQL: http://localhost:4000/graphql

Smoke test GraphQL (PowerShell)
powershell

$body = @{ query = 'query { __typename }' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/graphql' -ContentType 'application/json' -Body $body
Nota: GraphQL en navegador
Al abrir http://localhost:4000/graphql en el navegador puede mostrarse:

Send a POST request to query this endpoint

Esto es esperado: el endpoint GraphQL requiere POST con JSON (ver smoke tests).