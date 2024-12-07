/*
  Warnings:

  - You are about to alter the column `slug` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(31)`.

*/
-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "slug" SET DATA TYPE VARCHAR(31);
