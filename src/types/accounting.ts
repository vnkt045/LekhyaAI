// Core Accounting Types for LekhyaAI

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export type VoucherType = 'Payment' | 'Receipt' | 'Contra' | 'Journal' | 'Sales' | 'Purchase' | 'Debit Note' | 'Credit Note';

export type GSTType = 'CGST' | 'SGST' | 'IGST' | 'CESS';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoucherEntry {
  id: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface GSTDetails {
  gstin: string;
  gstType: GSTType;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  hsnSac?: string;
  placeOfSupply: string;
  reverseCharge: boolean;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  voucherType: VoucherType;
  date: Date;
  entries: VoucherEntry[];
  totalDebit: number;
  totalCredit: number;
  narration: string;
  gstDetails?: GSTDetails;
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
  isPosted: boolean;
  isImmutable: boolean;
}

export interface Company {
  id: string;
  name: string;
  gstin?: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  phone: string;
  financialYearStart: Date;
  financialYearEnd: Date;
  baseCurrency: string;
}

export interface FinancialReport {
  type: 'Balance Sheet' | 'Profit & Loss' | 'Trial Balance' | 'Cash Flow';
  period: {
    from: Date;
    to: Date;
  };
  data: any;
  generatedAt: Date;
}

export interface GSTReturn {
  id: string;
  returnType: 'GSTR-1' | 'GSTR-3B' | 'GSTR-9';
  period: string;
  status: 'Draft' | 'Filed' | 'Submitted';
  data: any;
  filedDate?: Date;
}

export interface AIInsight {
  id: string;
  type: 'Anomaly' | 'Suggestion' | 'Prediction' | 'Compliance';
  severity: 'Low' | 'Medium' | 'High';
  title: string;
  description: string;
  relatedVouchers?: string[];
  actionable: boolean;
  createdAt: Date;
}

export interface VoucherTypeConfig {
  id: string;
  name: string;
  abbreviation: string;
  category: string;
  isSystemDefined: boolean;
  isActive: boolean;
  prefix?: string;
  startingNumber: number;
  affectsInventory: boolean;
  requiresGST: boolean;
  createdAt: Date;
  updatedAt: Date;
}
