/*
  Warnings:

  - Added the required column `hospitalId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `hospitalId` VARCHAR(191) NOT NULL,
    ADD COLUMN `patientId` VARCHAR(191) NOT NULL;
