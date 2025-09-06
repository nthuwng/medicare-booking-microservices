-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `txnRef` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `gateway` ENUM('VNPAY') NOT NULL DEFAULT 'VNPAY',
    `state` ENUM('PENDING', 'PAID', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `orderInfo` VARCHAR(191) NOT NULL,
    `bankCode` VARCHAR(191) NULL,
    `payDate` DATETIME(3) NULL,
    `rawQuery` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_txnRef_key`(`txnRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
