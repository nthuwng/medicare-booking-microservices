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
    `city` ENUM('Hanoi', 'HoChiMinh') NULL,
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
    `specialty_id` INTEGER NOT NULL,
    `clinic_id` INTEGER NOT NULL,
    `consultation_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `booking_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `doctors_user_id_key`(`user_id`),
    PRIMARY KEY (`doctor_profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_specialty_id_fkey` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`specialty_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`clinic_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
