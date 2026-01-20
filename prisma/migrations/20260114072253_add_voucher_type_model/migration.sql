/*
  Warnings:

  - You are about to drop the column `basicSalary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `conveyance` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `esi` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `hra` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `medicalAllowance` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `otherAllowances` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `pfEmployee` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `pfEmployer` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `professionalTax` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `basic` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `conveyance` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `esi` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `hra` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `medicalAllowance` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `otherAllowances` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `otherDeductions` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `pfEmployee` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `pfEmployer` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `professionalTax` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `tds` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `godown` on the `StockMovement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN "alternateUnit" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN "conversionFactor" REAL;

-- CreateTable
CREATE TABLE "Godown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PayHead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "ledgerName" TEXT,
    "formula" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeSalaryDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "payHeadId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeSalaryDetail_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeeSalaryDetail_payHeadId_fkey" FOREIGN KEY ("payHeadId") REFERENCES "PayHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "isLeave" BOOLEAN NOT NULL DEFAULT false,
    "isPaidLeave" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AttendanceEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceEntry_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AttendanceType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalarySlipEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slipId" TEXT NOT NULL,
    "payHeadId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "SalarySlipEntry_slipId_fkey" FOREIGN KEY ("slipId") REFERENCES "SalarySlip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalarySlipEntry_payHeadId_fkey" FOREIGN KEY ("payHeadId") REFERENCES "PayHead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoucherType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isSystemDefined" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prefix" TEXT,
    "startingNumber" INTEGER NOT NULL DEFAULT 1,
    "affectsInventory" BOOLEAN NOT NULL DEFAULT false,
    "requiresGST" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CostCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "allocateRevenue" BOOLEAN NOT NULL DEFAULT true,
    "allocateNonRevenue" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "CostCenter_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CostCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoucherItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "hsnSac" TEXT,
    "qty" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL DEFAULT 0,
    "per" TEXT,
    "taxableAmount" REAL NOT NULL DEFAULT 0,
    "cgstRate" REAL NOT NULL DEFAULT 0,
    "cgstAmount" REAL NOT NULL DEFAULT 0,
    "sgstRate" REAL NOT NULL DEFAULT 0,
    "sgstAmount" REAL NOT NULL DEFAULT 0,
    "igstRate" REAL NOT NULL DEFAULT 0,
    "igstAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "inventoryItemId" TEXT,
    "godownId" TEXT,
    CONSTRAINT "VoucherItem_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VoucherItem_godownId_fkey" FOREIGN KEY ("godownId") REFERENCES "Godown" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "paymentGateway" TEXT,
    "transactionId" TEXT,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "allowedFeatures" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "pan" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "financialYearStart" DATETIME NOT NULL,
    "financialYearEnd" DATETIME NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'INR',
    "voucherPrefix" TEXT NOT NULL DEFAULT 'VCH',
    "isAutoNumbering" BOOLEAN NOT NULL DEFAULT true,
    "dateFormat" TEXT NOT NULL DEFAULT 'DD-MM-YYYY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("address", "baseCurrency", "city", "createdAt", "email", "financialYearEnd", "financialYearStart", "gstin", "id", "name", "pan", "phone", "pincode", "state", "updatedAt") SELECT "address", "baseCurrency", "city", "createdAt", "email", "financialYearEnd", "financialYearStart", "gstin", "id", "name", "pan", "phone", "pincode", "state", "updatedAt" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "dateOfJoining" DATETIME NOT NULL,
    "dateOfLeaving" DATETIME,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "panNumber" TEXT,
    "aadharNumber" TEXT,
    "uanNumber" TEXT,
    "esiNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Employee" ("aadharNumber", "accountNumber", "bankName", "code", "createdAt", "dateOfJoining", "dateOfLeaving", "department", "designation", "esiNumber", "id", "ifscCode", "isActive", "name", "panNumber", "uanNumber", "updatedAt") SELECT "aadharNumber", "accountNumber", "bankName", "code", "createdAt", "dateOfJoining", "dateOfLeaving", "department", "designation", "esiNumber", "id", "ifscCode", "isActive", "name", "panNumber", "uanNumber", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_code_key" ON "Employee"("code");
CREATE TABLE "new_SalarySlip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "grossSalary" REAL NOT NULL,
    "totalDeductions" REAL NOT NULL,
    "netSalary" REAL NOT NULL,
    "paidOn" DATETIME,
    "voucherId" TEXT,
    "paymentMode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalarySlip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalarySlip_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalarySlip" ("createdAt", "employeeId", "grossSalary", "id", "month", "netSalary", "paidOn", "paymentMode", "status", "totalDeductions", "updatedAt", "voucherId", "year") SELECT "createdAt", "employeeId", "grossSalary", "id", "month", "netSalary", "paidOn", "paymentMode", "status", "totalDeductions", "updatedAt", "voucherId", "year" FROM "SalarySlip";
DROP TABLE "SalarySlip";
ALTER TABLE "new_SalarySlip" RENAME TO "SalarySlip";
CREATE UNIQUE INDEX "SalarySlip_employeeId_month_year_key" ON "SalarySlip"("employeeId", "month", "year");
CREATE TABLE "new_StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "voucherId" TEXT,
    "referenceNo" TEXT,
    "narration" TEXT,
    "date" DATETIME NOT NULL,
    "godownId" TEXT,
    "batchNumber" TEXT,
    "expiryDate" DATETIME,
    "manufacturingDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_godownId_fkey" FOREIGN KEY ("godownId") REFERENCES "Godown" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StockMovement" ("amount", "createdAt", "date", "id", "itemId", "narration", "quantity", "rate", "referenceNo", "type", "voucherId") SELECT "amount", "createdAt", "date", "id", "itemId", "narration", "quantity", "rate", "referenceNo", "type", "voucherId" FROM "StockMovement";
DROP TABLE "StockMovement";
ALTER TABLE "new_StockMovement" RENAME TO "StockMovement";
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Voucher" ("createdAt", "createdBy", "date", "id", "isImmutable", "isPosted", "narration", "totalCredit", "totalDebit", "updatedAt", "voucherNumber", "voucherType") SELECT "createdAt", "createdBy", "date", "id", "isImmutable", "isPosted", "narration", "totalCredit", "totalDebit", "updatedAt", "voucherNumber", "voucherType" FROM "Voucher";
DROP TABLE "Voucher";
ALTER TABLE "new_Voucher" RENAME TO "Voucher";
CREATE UNIQUE INDEX "Voucher_voucherNumber_key" ON "Voucher"("voucherNumber");
CREATE TABLE "new_VoucherEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "debit" REAL NOT NULL DEFAULT 0.0,
    "credit" REAL NOT NULL DEFAULT 0.0,
    "foreignAmount" REAL,
    "costCenterId" TEXT,
    "narration" TEXT,
    CONSTRAINT "VoucherEntry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VoucherEntry_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VoucherEntry" ("accountId", "accountName", "credit", "debit", "id", "narration", "voucherId") SELECT "accountId", "accountName", "credit", "debit", "id", "narration", "voucherId" FROM "VoucherEntry";
DROP TABLE "VoucherEntry";
ALTER TABLE "new_VoucherEntry" RENAME TO "VoucherEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Godown_name_key" ON "Godown"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PayHead_name_key" ON "PayHead"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSalaryDetail_employeeId_payHeadId_key" ON "EmployeeSalaryDetail"("employeeId", "payHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceType_name_key" ON "AttendanceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherType_name_key" ON "VoucherType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CostCategory_name_key" ON "CostCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_companyId_key" ON "Subscription"("companyId");
