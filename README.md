# codeable-ch-jon-sanso
Main hotfix line

docker compose up -d --build
docker compose logs -f backend
docker compose logs -f frontend
URLs:

Front: http://localhost:5173

GraphQL: http://localhost:4000/graphql



4) Run PROD (limpio)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f backend


Probás:

http://localhost:5173

http://localhost:4000/graphql