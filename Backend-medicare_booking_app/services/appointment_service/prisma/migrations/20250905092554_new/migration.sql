-- AlterTable
ALTER TABLE `AppointmentPatient` ADD COLUMN `booker_email` VARCHAR(191) NULL,
    ADD COLUMN `booking_type` ENUM('Self', 'Relative') NOT NULL DEFAULT 'Self';
