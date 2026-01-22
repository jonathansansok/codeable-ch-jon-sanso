-- CreateTable
CREATE TABLE `Plant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Plant_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Operation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `basePriceUsd` DECIMAL(12, 2) NOT NULL,
    `linkMode` ENUM('NONE', 'BY_STRUCTURE') NOT NULL DEFAULT 'NONE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlantOperation` (
    `id` VARCHAR(191) NOT NULL,
    `plantId` VARCHAR(191) NOT NULL,
    `operationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PlantOperation_plantId_idx`(`plantId`),
    INDEX `PlantOperation_operationId_idx`(`operationId`),
    UNIQUE INDEX `PlantOperation_plantId_operationId_key`(`plantId`, `operationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VolumeMargin` (
    `id` VARCHAR(191) NOT NULL,
    `plantOperationId` VARCHAR(191) NOT NULL,
    `tier` ENUM('KG_300', 'KG_500', 'T_1', 'T_3', 'T_5', 'T_10', 'T_20', 'T_30') NOT NULL,
    `marginPercent` DECIMAL(5, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VolumeMargin_plantOperationId_idx`(`plantOperationId`),
    UNIQUE INDEX `VolumeMargin_plantOperationId_tier_key`(`plantOperationId`, `tier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlantOperation` ADD CONSTRAINT `PlantOperation_plantId_fkey` FOREIGN KEY (`plantId`) REFERENCES `Plant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlantOperation` ADD CONSTRAINT `PlantOperation_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `Operation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolumeMargin` ADD CONSTRAINT `VolumeMargin_plantOperationId_fkey` FOREIGN KEY (`plantOperationId`) REFERENCES `PlantOperation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
