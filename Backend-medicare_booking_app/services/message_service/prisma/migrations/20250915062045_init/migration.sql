-- CreateTable
CREATE TABLE `conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` VARCHAR(255) NOT NULL,
    `doctor_id` VARCHAR(255) NULL,
    `support_id` VARCHAR(255) NULL,
    `type` ENUM('DOCTOR_PATIENT', 'SUPPORT') NOT NULL,
    `last_message_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `conversations_patient_id_idx`(`patient_id`),
    INDEX `conversations_doctor_id_idx`(`doctor_id`),
    INDEX `conversations_last_message_at_idx`(`last_message_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `sender_id` VARCHAR(255) NOT NULL,
    `sender_type` ENUM('PATIENT', 'DOCTOR', 'SUPPORT') NOT NULL,
    `content` TEXT NOT NULL,
    `message_type` ENUM('TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO') NOT NULL DEFAULT 'TEXT',
    `file_url` VARCHAR(500) NULL,
    `file_name` VARCHAR(255) NULL,
    `file_size` INTEGER NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `is_delivered` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `messages_conversation_id_idx`(`conversation_id`),
    INDEX `messages_sender_id_idx`(`sender_id`),
    INDEX `messages_created_at_idx`(`created_at`),
    INDEX `messages_is_read_idx`(`is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
