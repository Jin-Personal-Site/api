/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Series" DROP COLUMN "updatedAt";
