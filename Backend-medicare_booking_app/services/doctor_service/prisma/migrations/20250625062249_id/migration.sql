/*
  Warnings:

  - The primary key for the `doctors` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `fees` DROP FOREIGN KEY `fees_doctor_profile_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedules` DROP FOREIGN KEY `schedules_doctor_profile_id_fkey`;

-- DropIndex
DROP INDEX `fees_doctor_profile_id_fkey` ON `fees`;

-- DropIndex
DROP INDEX `schedules_doctor_profile_id_fkey` ON `schedules`;

-- AlterTable
ALTER TABLE `doctors` DROP PRIMARY KEY,
    MODIFY `doctor_profile_id` VARCHAR(191) NOT NULL,
    MODIFY `experience_years` INTEGER NULL DEFAULT 0,
    ADD PRIMARY KEY (`doctor_profile_id`);

-- AlterTable
ALTER TABLE `fees` MODIFY `doctor_profile_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `schedules` MODIFY `doctor_profile_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_doctor_profile_id_fkey` FOREIGN KEY (`doctor_profile_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fees` ADD CONSTRAINT `fees_doctor_profile_id_fkey` FOREIGN KEY (`doctor_profile_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
