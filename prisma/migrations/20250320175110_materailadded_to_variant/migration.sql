/*
  Warnings:

  - Added the required column `martrial` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "martrial" TEXT NOT NULL;
