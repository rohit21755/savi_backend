/*
  Warnings:

  - You are about to drop the column `martrial` on the `Variant` table. All the data in the column will be lost.
  - Added the required column `material` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "martrial",
ADD COLUMN     "material" TEXT NOT NULL;
