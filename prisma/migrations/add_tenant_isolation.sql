-- Add tenantId to User model
ALTER TABLE User ADD COLUMN tenantId TEXT;

-- Add tenantId to Company model  
ALTER TABLE Company ADD COLUMN tenantId TEXT;

-- Add tenantId to Ledger model
ALTER TABLE Ledger ADD COLUMN tenantId TEXT;

-- Add tenantId to LedgerGroup model
ALTER TABLE LedgerGroup ADD COLUMN tenantId TEXT;

-- Add tenantId to Voucher model
ALTER TABLE Voucher ADD COLUMN tenantId TEXT;

-- Add tenantId to VoucherEntry model
ALTER TABLE VoucherEntry ADD COLUMN tenantId TEXT;

-- Add tenantId to InventoryItem model
ALTER TABLE InventoryItem ADD COLUMN tenantId TEXT;

-- Add tenantId to StockGroup model
ALTER TABLE StockGroup ADD COLUMN tenantId TEXT;

-- Add tenantId to Godown model
ALTER TABLE Godown ADD COLUMN tenantId TEXT;

-- Add tenantId to Employee model
ALTER TABLE Employee ADD COLUMN tenantId TEXT;

-- Add tenantId to PayrollConfig model
ALTER TABLE PayrollConfig ADD COLUMN tenantId TEXT;

-- Add tenantId to CostCategory model
ALTER TABLE CostCategory ADD COLUMN tenantId TEXT;

-- Add tenantId to CostCenter model
ALTER TABLE CostCenter ADD COLUMN tenantId TEXT;

-- Add tenantId to BankAccount model
ALTER TABLE BankAccount ADD COLUMN tenantId TEXT;

-- Add tenantId to Currency model
ALTER TABLE Currency ADD COLUMN tenantId TEXT;

-- Add tenantId to ExchangeRate model
ALTER TABLE ExchangeRate ADD COLUMN tenantId TEXT;

-- Add tenantId to BillOfMaterials model
ALTER TABLE BillOfMaterials ADD COLUMN tenantId TEXT;

-- Add tenantId to ProductionEntry model
ALTER TABLE ProductionEntry ADD COLUMN tenantId TEXT;

-- Add tenantId to StockTransfer model
ALTER TABLE StockTransfer ADD COLUMN tenantId TEXT;

-- Create indexes for performance
CREATE INDEX idx_user_tenantId ON User(tenantId);
CREATE INDEX idx_company_tenantId ON Company(tenantId);
CREATE INDEX idx_ledger_tenantId ON Ledger(tenantId);
CREATE INDEX idx_voucher_tenantId ON Voucher(tenantId);
CREATE INDEX idx_inventory_tenantId ON InventoryItem(tenantId);
CREATE INDEX idx_employee_tenantId ON Employee(tenantId);
