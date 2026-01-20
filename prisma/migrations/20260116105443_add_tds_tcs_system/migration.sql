-- CreateTable
CREATE TABLE "TDSSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thresholdLimit" REAL NOT NULL,
    "rateWithPAN" REAL NOT NULL,
    "rateWithoutPAN" REAL NOT NULL,
    "applicableOn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TDSEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "panNumber" TEXT,
    "amount" REAL NOT NULL,
    "tdsAmount" REAL NOT NULL,
    "tdsRate" REAL NOT NULL,
    "quarter" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "challanNo" TEXT,
    "challanDate" DATETIME,
    "filedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TDSEntry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TDSEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TDSSection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TDSEntry_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TCSConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goodsType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TCSEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "tcsAmount" REAL NOT NULL,
    "tcsRate" REAL NOT NULL,
    "quarter" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TCSEntry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TCSEntry_configId_fkey" FOREIGN KEY ("configId") REFERENCES "TCSConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TCSEntry_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TDSSection_section_key" ON "TDSSection"("section");

-- CreateIndex
CREATE INDEX "TDSEntry_quarter_financialYear_idx" ON "TDSEntry"("quarter", "financialYear");

-- CreateIndex
CREATE INDEX "TDSEntry_partyId_idx" ON "TDSEntry"("partyId");

-- CreateIndex
CREATE INDEX "TDSEntry_voucherId_idx" ON "TDSEntry"("voucherId");

-- CreateIndex
CREATE UNIQUE INDEX "TCSConfig_goodsType_key" ON "TCSConfig"("goodsType");

-- CreateIndex
CREATE INDEX "TCSEntry_quarter_financialYear_idx" ON "TCSEntry"("quarter", "financialYear");

-- CreateIndex
CREATE INDEX "TCSEntry_partyId_idx" ON "TCSEntry"("partyId");

-- CreateIndex
CREATE INDEX "TCSEntry_voucherId_idx" ON "TCSEntry"("voucherId");
