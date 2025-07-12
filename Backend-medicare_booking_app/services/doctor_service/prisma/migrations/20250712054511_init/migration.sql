-- CreateTable
CREATE TABLE `specialties` (
    `specialty_id` INTEGER NOT NULL AUTO_INCREMENT,
    `specialty_name` VARCHAR(255) NOT NULL,
    `icon_path` VARCHAR(255) NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`specialty_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinics` (
    `clinic_id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinic_name` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NULL,
    `district` VARCHAR(100) NULL,
    `street` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`clinic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctors` (
    `doctor_profile_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `bio` TEXT NULL,
    `experience_years` INTEGER NULL DEFAULT 0,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `approval_status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `title` ENUM('BS', 'ThS', 'TS', 'PGS', 'GS') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `doctors_user_id_key`(`user_id`),
    PRIMARY KEY (`doctor_profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `schedules` (
    `schedule_id` VARCHAR(191) NOT NULL,
    `doctor_profile_id` VARCHAR(191) NOT NULL,
    `clinic_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `schedules_doctor_profile_id_clinic_id_date_key`(`doctor_profile_id`, `clinic_id`, `date`),
    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_slots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_time_slots` (
    `schedule_id` VARCHAR(191) NOT NULL,
    `time_slot_id` INTEGER NOT NULL,
    `maxBooking` INTEGER NOT NULL DEFAULT 3,
    `currentBooking` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`schedule_id`, `time_slot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fees` (
    `fee_id` INTEGER NOT NULL AUTO_INCREMENT,
    `doctor_profile_id` VARCHAR(191) NOT NULL,
    `clinic_id` INTEGER NOT NULL,
    `consultation_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `booking_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`fee_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `doctor_specialties` ADD CONSTRAINT `doctor_specialties_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_specialties` ADD CONSTRAINT `doctor_specialties_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`specialty_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_clinics` ADD CONSTRAINT `doctor_clinics_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_clinics` ADD CONSTRAINT `doctor_clinics_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`clinic_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_doctor_profile_id_fkey` FOREIGN KEY (`doctor_profile_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`clinic_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_time_slots` ADD CONSTRAINT `schedule_time_slots_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_time_slots` ADD CONSTRAINT `schedule_time_slots_time_slot_id_fkey` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fees` ADD CONSTRAINT `fees_doctor_profile_id_fkey` FOREIGN KEY (`doctor_profile_id`) REFERENCES `doctors`(`doctor_profile_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fees` ADD CONSTRAINT `fees_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`clinic_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
