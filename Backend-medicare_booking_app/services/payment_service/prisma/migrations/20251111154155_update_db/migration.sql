-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `transaction_date` VARCHAR(191) NULL,
    ADD COLUMN `transaction_no` VARCHAR(191) NULL,
    MODIFY `rawQuery` TEXT NULL;
