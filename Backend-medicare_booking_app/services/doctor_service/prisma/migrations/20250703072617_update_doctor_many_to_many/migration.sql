/*
  Warnings:

  - You are about to drop the column `clinic_id` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `specialty_id` on the `doctors` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `doctors` DROP FOREIGN KEY `doctors_clinic_id_fkey`;

-- DropForeignKey
ALTER TABLE `doctors` DROP FOREIGN KEY `doctors_specialty_id_fkey`;

-- DropIndex
DROP INDEX `doctors_clinic_id_fkey` ON `doctors`;

-- DropIndex
DROP INDEX `doctors_specialty_id_fkey` ON `doctors`;

-- AlterTable
ALTER TABLE `doctors` DROP COLUMN `clinic_id`,
    DROP COLUMN `specialty_id`;

-- CreateTable
CREATE TABLE `doctor_specialties` (
    `doctor_id` VARCHAR(191) NOT NULL,
    `specialty_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`doctor_id`, `specialty_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_clinics` (
    `doctor_id` VARCHAR(191) NOT NULL,
    `clinic_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`doctor_id`, `clinic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `doctor_specialties` ADD CONSTRAINT `doctor_specialties_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_specialties` ADD CONSTRAINT `doctor_specialties_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`specialty_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_clinics` ADD CONSTRAINT `doctor_clinics_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_clinics` ADD CONSTRAINT `doctor_clinics_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`clinic_id`) ON DELETE CASCADE ON UPDATE CASCADE;
