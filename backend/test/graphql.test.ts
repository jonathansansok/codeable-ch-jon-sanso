import test from "node:test";
import assert from "node:assert/strict";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../src/schema.js";
import { resolvers } from "../src/resolvers.js";
import { prisma } from "../src/prisma.js";

async function makeServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  return server;
}

async function resetDb() {
  await prisma.volumeMargin.deleteMany();
  await prisma.plantOperation.deleteMany();
  await prisma.operation.deleteMany();
  await prisma.plant.deleteMany();
}

test("plantOperationsMatrix devuelve operaciones aunque no exista PlantOperation", async () => {
  await resetDb();

  const server = await makeServer();

  const plant = await prisma.plant.create({ data: { name: "Perú", code: "PE" } });
  const opA = await prisma.operation.create({
    data: { name: "Operación A", basePriceUsd: 250, linkMode: "BY_STRUCTURE" },
  });
  const opB = await prisma.operation.create({
    data: { name: "Operación B", basePriceUsd: 300, linkMode: "BY_STRUCTURE" },
  });

  const res = await server.executeOperation({
    query: `
      query($plantId: ID!) {
        plantOperationsMatrix(plantId: $plantId) {
          id
          operation { id name }
          margins { tier marginPercent isLowMargin }
        }
      }
    `,
    variables: { plantId: plant.id },
  });

  assert.equal(res.body.kind, "single");
  assert.equal(res.body.singleResult.errors?.length ?? 0, 0);

  const rows = (res.body.singleResult.data as any).plantOperationsMatrix as any[];
  assert.equal(rows.length, 2);

  const ids = rows.map((r) => r.operation.id).sort();
  assert.deepEqual(ids, [opA.id, opB.id].sort());
});

test("isLowMargin true cuando marginPercent <= 5", async () => {
  await resetDb();

  const server = await makeServer();

  const plant = await prisma.plant.create({ data: { name: "Perú", code: "PE" } });
  const op = await prisma.operation.create({
    data: { name: "Operación A", basePriceUsd: 250, linkMode: "BY_STRUCTURE" },
  });

  const setRes = await server.executeOperation({
    query: `
      mutation($plantId: ID!, $operationId: ID!) {
        setMargin(
          plantId: $plantId,
          operationId: $operationId,
          input: { tier: T_3, marginPercent: 5 }
        ) {
          id
          margins { tier marginPercent isLowMargin }
        }
      }
    `,
    variables: { plantId: plant.id, operationId: op.id },
  });

  assert.equal(setRes.body.kind, "single");
  assert.equal(setRes.body.singleResult.errors?.length ?? 0, 0);

  const margins = (setRes.body.singleResult.data as any).setMargin.margins as any[];
  const t3 = margins.find((m) => m.tier === "T_3");
  assert.ok(t3);
  assert.equal(Number(t3.marginPercent), 5);
  assert.equal(Boolean(t3.isLowMargin), true);
});
//Test de validación: basePriceUsd negativo debe fallar
test("upsertOperation rechaza basePriceUsd negativo", async () => {
  await resetDb();
  const server = await makeServer();

  const res = await server.executeOperation({
    query: `
      mutation {
        upsertOperation(input: {
          name: "Operación X"
          basePriceUsd: -1
          linkMode: BY_STRUCTURE
        }) {
          id
        }
      }
    `,
  });

  assert.equal(res.body.kind, "single");
  assert.ok(res.body.singleResult.errors?.length);
  const msg = String(res.body.singleResult.errors?.[0]?.message ?? "");
  assert.ok(msg.includes("basePriceUsd"));
});



//Test de validación: Plant.name vacío (trim) debe fallar
test("upsertPlant rechaza name vacío (trim)", async () => {
  await resetDb();
  const server = await makeServer();

  const res = await server.executeOperation({
    query: `
      mutation {
        upsertPlant(input: { name: "   ", code: "AR" }) {
          id
        }
      }
    `,
  });

  assert.equal(res.body.kind, "single");
  assert.ok(res.body.singleResult.errors?.length);
  const msg = String(res.body.singleResult.errors?.[0]?.message ?? "");
  assert.ok(msg.toLowerCase().includes("name"));
});

//C) Test de unicidad: Operation.name unique (P2002) debe devolver mensaje legible 
test("upsertOperation nombre unique devuelve error legible", async () => {
  await resetDb();
  const server = await makeServer();

  const first = await server.executeOperation({
    query: `
      mutation {
        upsertOperation(input: {
          name: "Operación DUP"
          basePriceUsd: 10
          linkMode: NONE
        }) { id }
      }
    `,
  });

  assert.equal(first.body.kind, "single");
  assert.equal(first.body.singleResult.errors?.length ?? 0, 0);

  const second = await server.executeOperation({
    query: `
      mutation {
        upsertOperation(input: {
          name: "Operación DUP"
          basePriceUsd: 20
          linkMode: NONE
        }) { id }
      }
    `,
  });

  assert.equal(second.body.kind, "single");
  assert.ok(second.body.singleResult.errors?.length);
  const msg = String(second.body.singleResult.errors?.[0]?.message ?? "");
  assert.ok(msg.toLowerCase().includes("unicidad"));
});


//Test de bulk: actualiza varios tiers y verifica resultados
test("setMarginsBulk actualiza múltiples tiers", async () => {
  await resetDb();
  const server = await makeServer();

  const plant = await prisma.plant.create({ data: { name: "Perú", code: "PE" } });
  const op = await prisma.operation.create({
    data: { name: "Operación A", basePriceUsd: 250, linkMode: "BY_STRUCTURE" },
  });

  const rowRes = await server.executeOperation({
    query: `
      mutation($plantId: ID!, $operationId: ID!) {
        ensurePlantOperation(plantId: $plantId, operationId: $operationId) {
          id
        }
      }
    `,
    variables: { plantId: plant.id, operationId: op.id },
  });

  assert.equal(rowRes.body.kind, "single");
  assert.equal(rowRes.body.singleResult.errors?.length ?? 0, 0);

  const plantOperationId = (rowRes.body.singleResult.data as any).ensurePlantOperation.id as string;

  const bulkRes = await server.executeOperation({
    query: `
      mutation($id: ID!) {
        setMarginsBulk(
          plantOperationId: $id
          inputs: [
            { tier: KG_300, marginPercent: 12 }
            { tier: T_3, marginPercent: 4.9 }
          ]
        ) {
          id
          margins { tier marginPercent isLowMargin }
        }
      }
    `,
    variables: { id: plantOperationId },
  });

  assert.equal(bulkRes.body.kind, "single");
  assert.equal(bulkRes.body.singleResult.errors?.length ?? 0, 0);

  const margins = (bulkRes.body.singleResult.data as any).setMarginsBulk.margins as any[];

  const kg300 = margins.find((m) => m.tier === "KG_300");
  const t3 = margins.find((m) => m.tier === "T_3");

  assert.equal(Number(kg300.marginPercent), 12);
  assert.equal(Boolean(kg300.isLowMargin), false);

  assert.equal(Number(t3.marginPercent), 4.9);
  assert.equal(Boolean(t3.isLowMargin), true);
});
test("teardown", async () => {
  await prisma.$disconnect();
});