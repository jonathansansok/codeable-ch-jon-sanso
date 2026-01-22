import { PrismaClient, VolumeTier, LinkMode, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plant = await prisma.plant.upsert({
    where: { code: "PE" },
    update: { name: "Perú" },
    create: { name: "Perú", code: "PE" },
  });

  const ops = await Promise.all([
    prisma.operation.upsert({
      where: { name: "Operación A" },
      update: { basePriceUsd: new Prisma.Decimal(250), linkMode: LinkMode.BY_STRUCTURE },
      create: { name: "Operación A", basePriceUsd: new Prisma.Decimal(250), linkMode: LinkMode.BY_STRUCTURE },
    }),
    prisma.operation.upsert({
      where: { name: "Operación B" },
      update: { basePriceUsd: new Prisma.Decimal(300), linkMode: LinkMode.BY_STRUCTURE },
      create: { name: "Operación B", basePriceUsd: new Prisma.Decimal(300), linkMode: LinkMode.BY_STRUCTURE },
    }),
    prisma.operation.upsert({
      where: { name: "Operación C" },
      update: { basePriceUsd: new Prisma.Decimal(350), linkMode: LinkMode.NONE },
      create: { name: "Operación C", basePriceUsd: new Prisma.Decimal(350), linkMode: LinkMode.NONE },
    }),
  ]);

  const tiers = Object.values(VolumeTier);
  const defaultMargin = new Prisma.Decimal(15);

  for (const op of ops) {
    const po = await prisma.plantOperation.upsert({
      where: { plantId_operationId: { plantId: plant.id, operationId: op.id } },
      update: {},
      create: { plantId: plant.id, operationId: op.id },
    });

    await prisma.$transaction(
      tiers.map((tier) =>
        prisma.volumeMargin.upsert({
          where: { plantOperationId_tier: { plantOperationId: po.id, tier } },
          update: { marginPercent: defaultMargin },
          create: { plantOperationId: po.id, tier, marginPercent: defaultMargin },
        })
      )
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    process.stderr.write(String(e) + "\n");
    await prisma.$disconnect();
    process.exit(1);
  });
