import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { prisma } from "./prisma.js";

async function main() {
  const app = express();

  const corsOrigin = (process.env.CORS_ORIGIN ?? "").trim();
  app.use(
    cors(
      corsOrigin
        ? { origin: corsOrigin.split(",").map((s) => s.trim()), credentials: true }
        : {},
    ),
  );

  app.use(express.json({ limit: "2mb" }));

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use("/graphql", expressMiddleware(server));

  const port = Number(process.env.PORT ?? 4000);
  const httpServer = app.listen(port, () => {
    process.stdout.write(`GraphQL ready on http://localhost:${port}/graphql\n`);
  });

  const shutdown = async () => {
    httpServer.close(() => undefined);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
