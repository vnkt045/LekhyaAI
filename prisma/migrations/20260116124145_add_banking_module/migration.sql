-- CreateTable
CREATE TABLE "BankReconciliation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherEntryId" TEXT NOT NULL,
    "bankDate" DATETIME NOT NULL,
    "reconciledDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'RECONCILED',
    CONSTRAINT "BankReconciliation_voucherEntryId_fkey" FOREIGN KEY ("voucherEntryId") REFERENCES "VoucherEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChequeBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fromNumber" INTEGER NOT NULL,
    "toNumber" INTEGER NOT NULL,
    "numberOfLeaves" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChequeBook_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChequeLeaf" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "chequeNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "voucherId" TEXT,
    "issuedDate" DATETIME,
    "issuedTo" TEXT,
    "amount" REAL,
    CONSTRAINT "ChequeLeaf_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "ChequeBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChequeLeaf_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BankReconciliation_voucherEntryId_key" ON "BankReconciliation"("voucherEntryId");

-- CreateIndex
CREATE INDEX "BankReconciliation_bankDate_idx" ON "BankReconciliation"("bankDate");

-- CreateIndex
CREATE UNIQUE INDEX "ChequeLeaf_voucherId_key" ON "ChequeLeaf"("voucherId");
