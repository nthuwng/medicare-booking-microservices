-- CreateTable
CREATE TABLE `Rating` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NULL,
    `score` INTEGER NOT NULL,
    `content` TEXT NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rating_appointmentId_key`(`appointmentId`),
    INDEX `Rating_doctorId_createdAt_idx`(`doctorId`, `createdAt`),
    INDEX `Rating_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DoctorRatingStat` (
    `doctorId` VARCHAR(191) NOT NULL,
    `avgScore` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    `totalReviews` INTEGER NOT NULL DEFAULT 0,
    `lastReviewAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DoctorRatingStat_avgScore_idx`(`avgScore`),
    INDEX `DoctorRatingStat_totalReviews_idx`(`totalReviews`),
    PRIMARY KEY (`doctorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RatingReply` (
    `id` VARCHAR(191) NOT NULL,
    `ratingId` VARCHAR(191) NOT NULL,
    `replierType` ENUM('DOCTOR') NOT NULL DEFAULT 'DOCTOR',
    `replierId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RatingReply_ratingId_idx`(`ratingId`),
    INDEX `RatingReply_replierId_idx`(`replierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RatingReply` ADD CONSTRAINT `RatingReply_ratingId_fkey` FOREIGN KEY (`ratingId`) REFERENCES `Rating`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
