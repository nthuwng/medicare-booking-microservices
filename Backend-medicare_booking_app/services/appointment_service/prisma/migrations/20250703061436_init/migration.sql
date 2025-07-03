-- CreateTable
CREATE TABLE `appointments` (
    `appointment_id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(255) NOT NULL,
    `doctor_id` VARCHAR(255) NOT NULL,
    `schedule_id` INTEGER NOT NULL,
    `clinic_id` INTEGER NOT NULL,
    `appointment_date` DATETIME(3) NOT NULL,
    `appointment_time` DATETIME(3) NOT NULL,
    `status` ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`appointment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
