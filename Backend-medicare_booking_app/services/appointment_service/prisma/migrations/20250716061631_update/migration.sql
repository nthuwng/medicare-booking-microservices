-- CreateTable
CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `doctor_id` VARCHAR(191) NOT NULL,
    `clinic_id` INTEGER NOT NULL,
    `specialty_id` INTEGER NOT NULL,
    `schedule_id` VARCHAR(191) NOT NULL,
    `time_slot_id` INTEGER NOT NULL,
    `appointment_date` DATE NOT NULL,
    `appointment_time` VARCHAR(5) NOT NULL,
    `status` ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `fee_id` INTEGER NOT NULL,
    `total_fee` DECIMAL(65, 30) NOT NULL,
    `payment_status` ENUM('Unpaid', 'Paid') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Appointment_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppointmentPatient` (
    `id` VARCHAR(191) NOT NULL,
    `patient_name` VARCHAR(191) NOT NULL,
    `patient_phone` VARCHAR(191) NOT NULL,
    `patient_email` VARCHAR(191) NULL,
    `patient_gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `patient_date_of_birth` DATETIME(3) NOT NULL,
    `patient_city` VARCHAR(191) NOT NULL,
    `patient_district` VARCHAR(191) NOT NULL,
    `patient_address` VARCHAR(191) NOT NULL,
    `booker_name` VARCHAR(191) NULL,
    `booker_phone` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `AppointmentPatient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
