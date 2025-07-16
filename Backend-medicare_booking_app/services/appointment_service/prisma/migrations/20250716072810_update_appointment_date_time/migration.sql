/*
  Warnings:

  - You are about to drop the column `appointment_date` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `appointment_time` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `appointment_date_time` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Appointment` DROP COLUMN `appointment_date`,
    DROP COLUMN `appointment_time`,
    ADD COLUMN `appointment_date_time` DATETIME(3) NOT NULL;
