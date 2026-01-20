/*
  Warnings:

  - Added the required column `totalGST` to the `GSTDetails` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GSTDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "gstType" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "taxableAmount" REAL NOT NULL,
    "cgstAmount" REAL NOT NULL DEFAULT 0,
    "sgstAmount" REAL NOT NULL DEFAULT 0,
    "igstAmount" REAL NOT NULL DEFAULT 0,
    "cessAmount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL,
    "totalGST" REAL NOT NULL,
    "hsnSac" TEXT,
    "invoiceNumber" TEXT,
    "placeOfSupply" TEXT NOT NULL,
    "reverseCharge" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GSTDetails_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GSTDetails" ("gstType", "gstin", "hsnSac", "id", "placeOfSupply", "rate", "reverseCharge", "taxAmount", "taxableAmount", "voucherId") SELECT "gstType", "gstin", "hsnSac", "id", "placeOfSupply", "rate", "reverseCharge", "taxAmount", "taxableAmount", "voucherId" FROM "GSTDetails";
DROP TABLE "GSTDetails";
ALTER TABLE "new_GSTDetails" RENAME TO "GSTDetails";
CREATE UNIQUE INDEX "GSTDetails_voucherId_key" ON "GSTDetails"("voucherId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
