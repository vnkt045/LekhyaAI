/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `AttendanceType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `CostCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Godown` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `PayHead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `SalaryStructure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `StockGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TCSConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TDSSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `UnitOfMeasure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `VoucherType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN "slug" TEXT;

-- CreateTable
CREATE TABLE "UserCompany" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "partyId" TEXT NOT NULL,
    "partyName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "exchangeRate" REAL NOT NULL DEFAULT 1.0,
    "termsAndConditions" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "taxableAmount" REAL NOT NULL,
    "taxAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "hsnSac" TEXT,
    "gstRate" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuoteItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "deliveryDate" DATETIME,
    "partyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "totalAmount" REAL NOT NULL,
    "originalQuoteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesOrder_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesOrder_originalQuoteId_fkey" FOREIGN KEY ("originalQuoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" REAL NOT NULL,
    "invoicedQuantity" REAL NOT NULL DEFAULT 0,
    "cancelledQuantity" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "taxableAmount" REAL NOT NULL,
    "taxAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "hsnSac" TEXT,
    "gstRate" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesOrderInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesOrderId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesOrderInvoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesOrderInvoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Voucher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "expectedDate" DATETIME,
    "partyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "totalAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseOrder_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "itemId" TEXT,
    "description" TEXT,
    "quantity" REAL NOT NULL,
    "receivedQuantity" REAL NOT NULL DEFAULT 0,
    "billedQuantity" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL,
    "taxableAmount" REAL NOT NULL,
    "taxAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "hsnSac" TEXT,
    "gstRate" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrderBill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PurchaseOrderBill_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrderBill_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Voucher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customerId" TEXT NOT NULL,
    "billingType" TEXT NOT NULL DEFAULT 'HOURLY',
    "projectAmount" REAL NOT NULL DEFAULT 0,
    "ratePerHour" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "ratePerHour" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timesheet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimesheetEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timesheetId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "hours" REAL NOT NULL,
    "description" TEXT,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "billingStatus" TEXT NOT NULL DEFAULT 'UNBILLED',
    "invoiceId" TEXT,
    CONSTRAINT "TimesheetEntry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimesheetEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimesheetEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "markup" REAL NOT NULL DEFAULT 0,
    "voucherEntryId" TEXT,
    "billingStatus" TEXT NOT NULL DEFAULT 'UNBILLED',
    "invoiceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voucherTypeId" TEXT,
    CONSTRAINT "ProjectExpense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectExpense_voucherEntryId_fkey" FOREIGN KEY ("voucherEntryId") REFERENCES "VoucherEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectExpense_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectExpense_voucherTypeId_fkey" FOREIGN KEY ("voucherTypeId") REFERENCES "VoucherType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectInvoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectInvoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Voucher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "financialYearStart" DATETIME NOT NULL,
    "financialYearEnd" DATETIME NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'MONTHLY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Budget_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "periodIndex" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "BudgetEntry_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FixedAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetNumber" TEXT,
    "description" TEXT,
    "accountId" TEXT NOT NULL,
    "depreciationMethod" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
    "depreciationRate" REAL NOT NULL DEFAULT 0,
    "usefulLifeInYears" REAL,
    "depreciationExpenseAccountId" TEXT,
    "accumulatedDepreciationAccountId" TEXT,
    "purchaseDate" DATETIME NOT NULL,
    "purchaseCost" REAL NOT NULL,
    "salvageValue" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FixedAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FixedAsset_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FixedAsset_depreciationExpenseAccountId_fkey" FOREIGN KEY ("depreciationExpenseAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FixedAsset_accumulatedDepreciationAccountId_fkey" FOREIGN KEY ("accumulatedDepreciationAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DepreciationEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "postedDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "voucherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DepreciationEntry_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FixedAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DepreciationEntry_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "accountId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "lastLogin" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortalUser_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LicenseKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "companyId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
    "issuedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LicenseKey_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoginActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "loginTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    CONSTRAINT "LoginActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "balance" REAL NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCostCenterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("balance", "code", "createdAt", "id", "isActive", "isCostCenterEnabled", "name", "parentId", "type", "updatedAt") SELECT "balance", "code", "createdAt", "id", "isActive", "isCostCenterEnabled", "name", "parentId", "type", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE INDEX "Account_companyId_idx" ON "Account"("companyId");
CREATE UNIQUE INDEX "Account_companyId_code_key" ON "Account"("companyId", "code");
CREATE UNIQUE INDEX "Account_companyId_name_key" ON "Account"("companyId", "name");
CREATE TABLE "new_AttendanceType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "isLeave" BOOLEAN NOT NULL DEFAULT false,
    "isPaidLeave" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AttendanceType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AttendanceType" ("id", "isLeave", "isPaidLeave", "name", "unitName") SELECT "id", "isLeave", "isPaidLeave", "name", "unitName" FROM "AttendanceType";
DROP TABLE "AttendanceType";
ALTER TABLE "new_AttendanceType" RENAME TO "AttendanceType";
CREATE UNIQUE INDEX "AttendanceType_companyId_name_key" ON "AttendanceType"("companyId", "name");
CREATE TABLE "new_CostCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allocateRevenue" BOOLEAN NOT NULL DEFAULT true,
    "allocateNonRevenue" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CostCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CostCategory" ("allocateNonRevenue", "allocateRevenue", "id", "name") SELECT "allocateNonRevenue", "allocateRevenue", "id", "name" FROM "CostCategory";
DROP TABLE "CostCategory";
ALTER TABLE "new_CostCategory" RENAME TO "CostCategory";
CREATE UNIQUE INDEX "CostCategory_companyId_name_key" ON "CostCategory"("companyId", "name");
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "designation" TEXT,
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
    "salaryStructureId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Employee_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "SalaryStructure" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("aadharNumber", "accountNumber", "bankName", "createdAt", "dateOfJoining", "dateOfLeaving", "department", "designation", "email", "employeeCode", "esiNumber", "id", "ifscCode", "isActive", "name", "panNumber", "phone", "salaryStructureId", "uanNumber", "updatedAt") SELECT "aadharNumber", "accountNumber", "bankName", "createdAt", "dateOfJoining", "dateOfLeaving", "department", "designation", "email", "employeeCode", "esiNumber", "id", "ifscCode", "isActive", "name", "panNumber", "phone", "salaryStructureId", "uanNumber", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_companyId_employeeCode_key" ON "Employee"("companyId", "employeeCode");
CREATE TABLE "new_Godown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Godown_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Godown_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Godown" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Godown" ("createdAt", "id", "location", "name", "parentId", "updatedAt") SELECT "createdAt", "id", "location", "name", "parentId", "updatedAt" FROM "Godown";
DROP TABLE "Godown";
ALTER TABLE "new_Godown" RENAME TO "Godown";
CREATE UNIQUE INDEX "Godown_companyId_name_key" ON "Godown"("companyId", "name");
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "hsnCode" TEXT,
    "gstRate" REAL NOT NULL DEFAULT 0,
    "purchaseRate" REAL NOT NULL,
    "saleRate" REAL NOT NULL,
    "mrp" REAL,
    "openingStock" REAL NOT NULL DEFAULT 0,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "reorderLevel" REAL NOT NULL DEFAULT 0,
    "valuationMethod" TEXT NOT NULL DEFAULT 'FIFO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alternateUnit" TEXT,
    "conversionFactor" REAL,
    "stockGroupId" TEXT,
    "uomId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_stockGroupId_fkey" FOREIGN KEY ("stockGroupId") REFERENCES "StockGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UnitOfMeasure" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("alternateUnit", "category", "code", "conversionFactor", "createdAt", "currentStock", "description", "gstRate", "hsnCode", "id", "isActive", "mrp", "name", "openingStock", "purchaseRate", "reorderLevel", "saleRate", "stockGroupId", "unit", "uomId", "updatedAt", "valuationMethod") SELECT "alternateUnit", "category", "code", "conversionFactor", "createdAt", "currentStock", "description", "gstRate", "hsnCode", "id", "isActive", "mrp", "name", "openingStock", "purchaseRate", "reorderLevel", "saleRate", "stockGroupId", "unit", "uomId", "updatedAt", "valuationMethod" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE INDEX "InventoryItem_companyId_idx" ON "InventoryItem"("companyId");
CREATE UNIQUE INDEX "InventoryItem_companyId_code_key" ON "InventoryItem"("companyId", "code");
CREATE TABLE "new_PayHead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "ledgerName" TEXT,
    "formula" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayHead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PayHead" ("calculationType", "createdAt", "formula", "id", "ledgerName", "name", "type", "updatedAt") SELECT "calculationType", "createdAt", "formula", "id", "ledgerName", "name", "type", "updatedAt" FROM "PayHead";
DROP TABLE "PayHead";
ALTER TABLE "new_PayHead" RENAME TO "PayHead";
CREATE UNIQUE INDEX "PayHead_companyId_name_key" ON "PayHead"("companyId", "name");
CREATE TABLE "new_SalarySlip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
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
    CONSTRAINT "SalarySlip_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalarySlip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalarySlip_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalarySlip" ("createdAt", "employeeId", "grossSalary", "id", "month", "netSalary", "paidOn", "paymentMode", "status", "totalDeductions", "updatedAt", "voucherId", "year") SELECT "createdAt", "employeeId", "grossSalary", "id", "month", "netSalary", "paidOn", "paymentMode", "status", "totalDeductions", "updatedAt", "voucherId", "year" FROM "SalarySlip";
DROP TABLE "SalarySlip";
ALTER TABLE "new_SalarySlip" RENAME TO "SalarySlip";
CREATE INDEX "SalarySlip_companyId_idx" ON "SalarySlip"("companyId");
CREATE UNIQUE INDEX "SalarySlip_employeeId_month_year_key" ON "SalarySlip"("employeeId", "month", "year");
CREATE TABLE "new_SalaryStructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basicSalary" REAL NOT NULL,
    "hra" REAL NOT NULL DEFAULT 0,
    "conveyance" REAL NOT NULL DEFAULT 0,
    "medicalAllowance" REAL NOT NULL DEFAULT 0,
    "otherAllowances" REAL NOT NULL DEFAULT 0,
    "pf" REAL NOT NULL DEFAULT 0,
    "esi" REAL NOT NULL DEFAULT 0,
    "professionalTax" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalaryStructure_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SalaryStructure" ("basicSalary", "conveyance", "createdAt", "esi", "hra", "id", "medicalAllowance", "name", "otherAllowances", "pf", "professionalTax", "updatedAt") SELECT "basicSalary", "conveyance", "createdAt", "esi", "hra", "id", "medicalAllowance", "name", "otherAllowances", "pf", "professionalTax", "updatedAt" FROM "SalaryStructure";
DROP TABLE "SalaryStructure";
ALTER TABLE "new_SalaryStructure" RENAME TO "SalaryStructure";
CREATE UNIQUE INDEX "SalaryStructure_companyId_name_key" ON "SalaryStructure"("companyId", "name");
CREATE TABLE "new_StockGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StockGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StockGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StockGroup" ("createdAt", "description", "id", "name", "parentId", "updatedAt") SELECT "createdAt", "description", "id", "name", "parentId", "updatedAt" FROM "StockGroup";
DROP TABLE "StockGroup";
ALTER TABLE "new_StockGroup" RENAME TO "StockGroup";
CREATE UNIQUE INDEX "StockGroup_companyId_name_key" ON "StockGroup"("companyId", "name");
CREATE TABLE "new_TCSConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "goodsType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TCSConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TCSConfig" ("createdAt", "description", "goodsType", "id", "isActive", "rate", "threshold", "updatedAt") SELECT "createdAt", "description", "goodsType", "id", "isActive", "rate", "threshold", "updatedAt" FROM "TCSConfig";
DROP TABLE "TCSConfig";
ALTER TABLE "new_TCSConfig" RENAME TO "TCSConfig";
CREATE UNIQUE INDEX "TCSConfig_companyId_goodsType_key" ON "TCSConfig"("companyId", "goodsType");
CREATE TABLE "new_TDSSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thresholdLimit" REAL NOT NULL,
    "rateWithPAN" REAL NOT NULL,
    "rateWithoutPAN" REAL NOT NULL,
    "applicableOn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TDSSection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TDSSection" ("applicableOn", "createdAt", "description", "id", "isActive", "rateWithPAN", "rateWithoutPAN", "section", "thresholdLimit", "updatedAt") SELECT "applicableOn", "createdAt", "description", "id", "isActive", "rateWithPAN", "rateWithoutPAN", "section", "thresholdLimit", "updatedAt" FROM "TDSSection";
DROP TABLE "TDSSection";
ALTER TABLE "new_TDSSection" RENAME TO "TDSSection";
CREATE UNIQUE INDEX "TDSSection_companyId_section_key" ON "TDSSection"("companyId", "section");
CREATE TABLE "new_UnitOfMeasure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnitOfMeasure_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UnitOfMeasure" ("createdAt", "decimalPlaces", "id", "name", "symbol") SELECT "createdAt", "decimalPlaces", "id", "name", "symbol" FROM "UnitOfMeasure";
DROP TABLE "UnitOfMeasure";
ALTER TABLE "new_UnitOfMeasure" RENAME TO "UnitOfMeasure";
CREATE UNIQUE INDEX "UnitOfMeasure_companyId_name_key" ON "UnitOfMeasure"("companyId", "name");
CREATE TABLE "new_Voucher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
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
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "quoteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Voucher_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Voucher_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Voucher" ("createdAt", "createdBy", "currency", "date", "exchangeRate", "id", "invoiceNumber", "isImmutable", "isOptional", "isPostDated", "isPosted", "isRecurring", "narration", "pdcDate", "regularizedDate", "totalCredit", "totalDebit", "updatedAt", "voucherNumber", "voucherType") SELECT "createdAt", "createdBy", "currency", "date", "exchangeRate", "id", "invoiceNumber", "isImmutable", "isOptional", "isPostDated", "isPosted", "isRecurring", "narration", "pdcDate", "regularizedDate", "totalCredit", "totalDebit", "updatedAt", "voucherNumber", "voucherType" FROM "Voucher";
DROP TABLE "Voucher";
ALTER TABLE "new_Voucher" RENAME TO "Voucher";
CREATE UNIQUE INDEX "Voucher_quoteId_key" ON "Voucher"("quoteId");
CREATE INDEX "Voucher_companyId_idx" ON "Voucher"("companyId");
CREATE UNIQUE INDEX "Voucher_companyId_voucherNumber_key" ON "Voucher"("companyId", "voucherNumber");
CREATE TABLE "new_VoucherType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isSystemDefined" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prefix" TEXT,
    "startingNumber" INTEGER NOT NULL DEFAULT 1,
    "affectsInventory" BOOLEAN NOT NULL DEFAULT false,
    "requiresGST" BOOLEAN NOT NULL DEFAULT false,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VoucherType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VoucherType" ("abbreviation", "affectsInventory", "category", "createdAt", "id", "isActive", "isSystemDefined", "name", "prefix", "requiresGST", "startingNumber", "updatedAt") SELECT "abbreviation", "affectsInventory", "category", "createdAt", "id", "isActive", "isSystemDefined", "name", "prefix", "requiresGST", "startingNumber", "updatedAt" FROM "VoucherType";
DROP TABLE "VoucherType";
ALTER TABLE "new_VoucherType" RENAME TO "VoucherType";
CREATE UNIQUE INDEX "VoucherType_companyId_name_key" ON "VoucherType"("companyId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "UserCompany"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_originalQuoteId_key" ON "SalesOrder"("originalQuoteId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrderInvoice_salesOrderId_invoiceId_key" ON "SalesOrderInvoice"("salesOrderId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_orderNumber_key" ON "PurchaseOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrderBill_purchaseOrderId_billId_key" ON "PurchaseOrderBill"("purchaseOrderId", "billId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvoice_projectId_invoiceId_key" ON "ProjectInvoice"("projectId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetEntry_budgetId_accountId_periodIndex_key" ON "BudgetEntry"("budgetId", "accountId", "periodIndex");

-- CreateIndex
CREATE UNIQUE INDEX "FixedAsset_companyId_assetNumber_key" ON "FixedAsset"("companyId", "assetNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_email_key" ON "PortalUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseKey_key_key" ON "LicenseKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseKey_companyId_key" ON "LicenseKey"("companyId");

-- CreateIndex
CREATE INDEX "LicenseKey_status_idx" ON "LicenseKey"("status");

-- CreateIndex
CREATE INDEX "LicenseKey_paymentStatus_idx" ON "LicenseKey"("paymentStatus");

-- CreateIndex
CREATE INDEX "LoginActivity_userId_idx" ON "LoginActivity"("userId");

-- CreateIndex
CREATE INDEX "LoginActivity_loginTime_idx" ON "LoginActivity"("loginTime");

-- CreateIndex
CREATE INDEX "LoginActivity_companyId_idx" ON "LoginActivity"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
