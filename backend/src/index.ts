import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use("/graphql", expressMiddleware(server));

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    process.stdout.write(`GraphQL ready on http://localhost:${port}/graphql\n`);
  });
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
