import { prisma } from "./prisma";
import { Prisma, VolumeTier } from "@prisma/client";

function toFloat(v: any) {
  if (v == null) return 0;
  return typeof v === "number" ? v : Number(v);
}

function assertPercent(n: number) {
  if (!Number.isFinite(n)) throw new Error("marginPercent inválido");
  if (n < 0 || n > 100) throw new Error("marginPercent fuera de rango");
}

async function getOrCreatePlantOperation(plantId: string, operationId: string) {
  const existing = await prisma.plantOperation.findUnique({
    where: { plantId_operationId: { plantId, operationId } },
  });
  if (existing) return existing;

  return prisma.plantOperation.create({
    data: { plantId, operationId },
  });
}

async function loadRow(id: string) {
  const row = await prisma.plantOperation.findUnique({
    where: { id },
    include: {
      plant: true,
      operation: true,
      margins: true,
    },
  });
  if (!row) throw new Error("PlantOperation no encontrado");
  return row;
}

export const resolvers = {
  Query: {
    plants: () => prisma.plant.findMany({ orderBy: { name: "asc" } }),
    operations: () => prisma.operation.findMany({ orderBy: { name: "asc" } }),
    plantOperations: async (_: any, args: { plantId: string }) => {
      const rows = await prisma.plantOperation.findMany({
        where: { plantId: args.plantId },
        include: { plant: true, operation: true, margins: true },
        orderBy: { createdAt: "asc" },
      });
      return rows;
    },
    volumeTiers: () => Object.values(VolumeTier),
  },

  Mutation: {
    upsertPlant: async (_: any, args: { input: { id?: string; name: string; code?: string | null } }) => {
      const { id, name, code } = args.input;
      if (id) {
        return prisma.plant.update({
          where: { id },
          data: { name, code: code ?? null },
        });
      }
      return prisma.plant.create({ data: { name, code: code ?? null } });
    },

    upsertOperation: async (
      _: any,
      args: { input: { id?: string; name: string; basePriceUsd: number; linkMode: "NONE" | "BY_STRUCTURE" } }
    ) => {
      const { id, name, basePriceUsd, linkMode } = args.input;
      const base = new Prisma.Decimal(basePriceUsd);
      if (id) {
        return prisma.operation.update({
          where: { id },
          data: { name, basePriceUsd: base, linkMode },
        });
      }
      return prisma.operation.create({
        data: { name, basePriceUsd: base, linkMode },
      });
    },

    ensurePlantOperation: async (_: any, args: { plantId: string; operationId: string }) => {
      const po = await getOrCreatePlantOperation(args.plantId, args.operationId);
      return loadRow(po.id);
    },

    setMargin: async (_: any, args: { plantId: string; operationId: string; input: { tier: VolumeTier; marginPercent: number } }) => {
      const { tier, marginPercent } = args.input;
      assertPercent(marginPercent);

      const po = await getOrCreatePlantOperation(args.plantId, args.operationId);

      await prisma.volumeMargin.upsert({
        where: { plantOperationId_tier: { plantOperationId: po.id, tier } },
        update: { marginPercent: new Prisma.Decimal(marginPercent) },
        create: { plantOperationId: po.id, tier, marginPercent: new Prisma.Decimal(marginPercent) },
      });

      return loadRow(po.id);
    },

    setMarginsBulk: async (_: any, args: { plantOperationId: string; inputs: { tier: VolumeTier; marginPercent: number }[] }) => {
      for (const it of args.inputs) assertPercent(it.marginPercent);

      await prisma.$transaction(
        args.inputs.map((it) =>
          prisma.volumeMargin.upsert({
            where: { plantOperationId_tier: { plantOperationId: args.plantOperationId, tier: it.tier } },
            update: { marginPercent: new Prisma.Decimal(it.marginPercent) },
            create: { plantOperationId: args.plantOperationId, tier: it.tier, marginPercent: new Prisma.Decimal(it.marginPercent) },
          })
        )
      );

      return loadRow(args.plantOperationId);
    },
  },

  Operation: {
    basePriceUsd: (o: any) => toFloat(o.basePriceUsd),
  },

  MarginByTier: {
    marginPercent: (m: any) => toFloat(m.marginPercent),
  },

  PlantOperationRow: {
    margins: (row: any) => {
      const byTier = new Map<string, any>();
      for (const m of row.margins ?? []) byTier.set(String(m.tier), m);

      const tiers = Object.values(VolumeTier);
      return tiers.map((t) => {
        const m = byTier.get(String(t));
        return { tier: t, marginPercent: m ? toFloat(m.marginPercent) : 0 };
      });
    },
  },
};
