-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Voucher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherNumber" TEXT NOT NULL,
    "voucherType" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalDebit" REAL NOT NULL,
    "totalCredit" REAL NOT NULL,
    "narration" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "exchangeRate" REAL NOT NULL DEFAULT 1.0,
    "createdBy" TEXT NOT NULL,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "isImmutable" BOOLEAN NOT NULL DEFAULT false,
    "isPostDated" BOOLEAN NOT NULL DEFAULT false,
    "pdcDate" DATETIME,
    "regularizedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Voucher" ("createdAt", "createdBy", "currency", "date", "exchangeRate", "id", "invoiceNumber", "isImmutable", "isPosted", "narration", "totalCredit", "totalDebit", "updatedAt", "voucherNumber", "voucherType") SELECT "createdAt", "createdBy", "currency", "date", "exchangeRate", "id", "invoiceNumber", "isImmutable", "isPosted", "narration", "totalCredit", "totalDebit", "updatedAt", "voucherNumber", "voucherType" FROM "Voucher";
DROP TABLE "Voucher";
ALTER TABLE "new_Voucher" RENAME TO "Voucher";
CREATE UNIQUE INDEX "Voucher_voucherNumber_key" ON "Voucher"("voucherNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
