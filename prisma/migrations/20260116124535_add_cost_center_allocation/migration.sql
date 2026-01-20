/*
  Warnings:

  - You are about to drop the column `costCenterId` on the `VoucherEntry` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CostCenterAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherEntryId" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CostCenterAllocation_voucherEntryId_fkey" FOREIGN KEY ("voucherEntryId") REFERENCES "VoucherEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CostCenterAllocation_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "balance" REAL NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCostCenterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("balance", "code", "createdAt", "id", "isActive", "name", "parentId", "type", "updatedAt") SELECT "balance", "code", "createdAt", "id", "isActive", "name", "parentId", "type", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");
CREATE TABLE "new_VoucherEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "debit" REAL NOT NULL DEFAULT 0.0,
    "credit" REAL NOT NULL DEFAULT 0.0,
    "foreignAmount" REAL,
    "narration" TEXT,
    CONSTRAINT "VoucherEntry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VoucherEntry" ("accountId", "accountName", "credit", "debit", "foreignAmount", "id", "narration", "voucherId") SELECT "accountId", "accountName", "credit", "debit", "foreignAmount", "id", "narration", "voucherId" FROM "VoucherEntry";
DROP TABLE "VoucherEntry";
ALTER TABLE "new_VoucherEntry" RENAME TO "VoucherEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
