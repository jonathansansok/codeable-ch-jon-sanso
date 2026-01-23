import { prisma } from "./prisma.js";
import { Prisma, VolumeTier, LinkMode } from "@prisma/client";

function toFloat(v: any) {
  if (v == null) return 0;
  return typeof v === "number" ? v : Number(v);
}

function normalizeText(v: any) {
  return String(v ?? "").trim();
}

function assertNonEmpty(label: string, v: string) {
  if (!v) throw new Error(`${label} requerido`);
}

function assertMaxLen(label: string, v: string, max: number) {
  if (v.length > max) throw new Error(`${label} excede ${max} caracteres`);
}

function assertPercent(n: number) {
  if (!Number.isFinite(n)) throw new Error("marginPercent inválido");
  if (n < 0 || n > 100) throw new Error("marginPercent fuera de rango");
}

function assertUsd(n: number) {
  if (!Number.isFinite(n)) throw new Error("basePriceUsd inválido");
  if (n < 0) throw new Error("basePriceUsd no puede ser negativo");
}

function mapPrismaError(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      const target = Array.isArray((e.meta as any)?.target)
        ? String((e.meta as any).target.join(", "))
        : "campo único";
      throw new Error(`Violación de unicidad: ${target}`);
    }
  }
  throw e;
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
    include: { plant: true, operation: true, margins: true },
  });
  if (!row) throw new Error("PlantOperation no encontrado");
  return row;
}

async function loadRowsByPlant(plantId: string) {
  return prisma.plantOperation.findMany({
    where: { plantId },
    include: { plant: true, operation: true, margins: true },
    orderBy: { createdAt: "asc" },
  });
}

async function buildMatrix(plantId: string) {
  const [plant, ops, existing] = await Promise.all([
    prisma.plant.findUnique({ where: { id: plantId } }),
    prisma.operation.findMany({ orderBy: { name: "asc" } }),
    loadRowsByPlant(plantId),
  ]);

  if (!plant) throw new Error("Plant no encontrada");

  const byOpId = new Map<string, any>();
  for (const r of existing) byOpId.set(String(r.operationId), r);

  const rows: any[] = [];
  for (const op of ops) {
    const found = byOpId.get(String(op.id));
    if (found) {
      rows.push(found);
      continue;
    }
    const created = await prisma.plantOperation.create({
      data: { plantId, operationId: op.id },
      include: { plant: true, operation: true, margins: true },
    });
    rows.push(created);
  }

  rows.sort((a, b) => String(a.operation.name).localeCompare(String(b.operation.name)));
  return rows;
}

export const resolvers = {
  Query: {
    plants: () => prisma.plant.findMany({ orderBy: { name: "asc" } }),
    operations: () => prisma.operation.findMany({ orderBy: { name: "asc" } }),

    plantOperations: async (_: any, args: { plantId: string }) => {
      return loadRowsByPlant(args.plantId);
    },

    plantOperationsMatrix: async (_: any, args: { plantId: string }) => {
      return buildMatrix(args.plantId);
    },

    volumeTiers: () => Object.values(VolumeTier),
    linkModes: () => Object.values(LinkMode),
  },

  Mutation: {
    upsertPlant: async (
      _: any,
      args: { input: { id?: string; name: string; code?: string | null } },
    ) => {
      try {
        const id = args.input.id ? normalizeText(args.input.id) : "";
        const name = normalizeText(args.input.name);
        const codeRaw = args.input.code == null ? null : normalizeText(args.input.code);
        const code = codeRaw ? codeRaw.toUpperCase() : null;

        assertNonEmpty("name", name);
        assertMaxLen("name", name, 120);
        if (code) assertMaxLen("code", code, 24);

        if (id) {
          return await prisma.plant.update({
            where: { id },
            data: { name, code },
          });
        }

        return await prisma.plant.create({ data: { name, code } });
      } catch (e) {
        mapPrismaError(e);
      }
    },

    upsertOperation: async (
      _: any,
      args: { input: { id?: string; name: string; basePriceUsd: number; linkMode: LinkMode } },
    ) => {
      try {
        const id = args.input.id ? normalizeText(args.input.id) : "";
        const name = normalizeText(args.input.name);
        const basePriceUsd = toFloat(args.input.basePriceUsd);
        const linkMode = args.input.linkMode;

        assertNonEmpty("name", name);
        assertMaxLen("name", name, 160);
        assertUsd(basePriceUsd);

        const base = new Prisma.Decimal(basePriceUsd);

        if (id) {
          return await prisma.operation.update({
            where: { id },
            data: { name, basePriceUsd: base, linkMode },
          });
        }

        return await prisma.operation.create({
          data: { name, basePriceUsd: base, linkMode },
        });
      } catch (e) {
        mapPrismaError(e);
      }
    },

    ensurePlantOperation: async (_: any, args: { plantId: string; operationId: string }) => {
      const plantId = normalizeText(args.plantId);
      const operationId = normalizeText(args.operationId);
      const po = await getOrCreatePlantOperation(plantId, operationId);
      return loadRow(po.id);
    },

    setMargin: async (
      _: any,
      args: { plantId: string; operationId: string; input: { tier: VolumeTier; marginPercent: number } },
    ) => {
      const plantId = normalizeText(args.plantId);
      const operationId = normalizeText(args.operationId);

      const tier = args.input.tier;
      const marginPercent = toFloat(args.input.marginPercent);
      assertPercent(marginPercent);

      const po = await getOrCreatePlantOperation(plantId, operationId);

      await prisma.volumeMargin.upsert({
        where: { plantOperationId_tier: { plantOperationId: po.id, tier } },
        update: { marginPercent: new Prisma.Decimal(marginPercent) },
        create: { plantOperationId: po.id, tier, marginPercent: new Prisma.Decimal(marginPercent) },
      });

      return loadRow(po.id);
    },

    setMarginsBulk: async (
      _: any,
      args: { plantOperationId: string; inputs: { tier: VolumeTier; marginPercent: number }[] },
    ) => {
      const plantOperationId = normalizeText(args.plantOperationId);
      const inputs = args.inputs ?? [];

      if (!plantOperationId) throw new Error("plantOperationId requerido");

      const exists = await prisma.plantOperation.findUnique({ where: { id: plantOperationId } });
      if (!exists) throw new Error("PlantOperation no encontrado");

      for (const it of inputs) assertPercent(toFloat(it.marginPercent));

      await prisma.$transaction(
        inputs.map((it) =>
          prisma.volumeMargin.upsert({
            where: { plantOperationId_tier: { plantOperationId, tier: it.tier } },
            update: { marginPercent: new Prisma.Decimal(toFloat(it.marginPercent)) },
            create: { plantOperationId, tier: it.tier, marginPercent: new Prisma.Decimal(toFloat(it.marginPercent)) },
          }),
        ),
      );

      return loadRow(plantOperationId);
    },
  },

  Operation: {
    basePriceUsd: (o: any) => toFloat(o.basePriceUsd),
  },

  MarginByTier: {
    marginPercent: (m: any) => toFloat(m.marginPercent),
    isLowMargin: (m: any) => toFloat(m.marginPercent) <= 5,
  },

  PlantOperationRow: {
    margins: (row: any) => {
      const byTier = new Map<string, any>();
      for (const m of row.margins ?? []) byTier.set(String(m.tier), m);

      const tiers = Object.values(VolumeTier);
      return tiers.map((t) => {
        const m = byTier.get(String(t));
        const marginPercent = m ? toFloat(m.marginPercent) : 0;
        return { tier: t, marginPercent };
      });
    },
  },
};
