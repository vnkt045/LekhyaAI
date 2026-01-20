# LekhyaAI - Quick Start Guide

## 🚀 Running the Application

### Development Mode
```bash
cd d:\AntiGravity_Projects\LekhyaAI\lekhya-ai
npm run dev
```
Then open: **http://localhost:3000** (or the port shown in terminal)

### Production Build
```bash
npm run build
npm start
```

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx       → Root layout with metadata & fonts
│   ├── page.tsx         → Home page (renders Dashboard)
│   └── globals.css      → Design system & global styles
├── components/
│   └── Dashboard.tsx    → Main dashboard component
├── lib/
│   └── mockData.ts      → Sample data & utility functions
└── types/
    └── accounting.ts    → TypeScript type definitions
```

## 🎨 Key Features Implemented

### 1. Dashboard
- **Location**: `src/components/Dashboard.tsx`
- **Features**:
  - Collapsible sidebar navigation
  - Financial stats cards (Assets, Profit, Liabilities, Revenue)
  - Recent vouchers list
  - AI insights panel
  - Account balances summary

### 2. Design System
- **Location**: `src/app/globals.css`
- **Includes**:
  - CSS custom properties for theming
  - Reusable component classes (`.card`, `.btn`, `.input`, `.badge`)
  - Smooth animations
  - Responsive utilities

### 3. Data Layer
- **Location**: `src/lib/mockData.ts`
- **Contains**:
  - Mock company data
  - 15 sample accounts (Assets, Liabilities, Equity, Revenue, Expenses)
  - 3 sample vouchers (Payment, Receipt, Sales)
  - 4 AI insights
  - Utility functions for formatting and calculations

### 4. Type System
- **Location**: `src/types/accounting.ts`
- **Defines**:
  - Account, Voucher, VoucherEntry
  - GSTDetails, Company
  - FinancialReport, GSTReturn
  - AIInsight

## 🛠️ Customization Guide

### Changing Colors
Edit `src/app/globals.css`:
```css
:root {
  --primary-hue: 210;        /* Blue - change to your brand color */
  --accent-hue: 35;          /* Orange - change for accent */
  --primary-sat: 85%;        /* Saturation */
  --primary-light: 45%;      /* Lightness */
}
```

### Adding New Accounts
Edit `src/lib/mockData.ts`:
```typescript
export const mockAccounts: Account[] = [
  // Add your account here
  {
    id: 'acc-16',
    code: '5400',
    name: 'Marketing Expense',
    type: 'Expense',
    balance: 50000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ... existing accounts
];
```

### Adding New Vouchers
Edit `src/lib/mockData.ts`:
```typescript
export const mockVouchers: Voucher[] = [
  // Add your voucher here
  {
    id: 'v-4',
    voucherNumber: 'JNL/2024/001',
    voucherType: 'Journal',
    date: new Date(),
    entries: [
      { id: 'e-8', accountId: 'acc-1', accountName: 'Cash', debit: 10000, credit: 0 },
      { id: 'e-9', accountId: 'acc-2', accountName: 'Bank', debit: 0, credit: 10000 },
    ],
    totalDebit: 10000,
    totalCredit: 10000,
    narration: 'Cash deposited to bank',
    createdBy: 'admin',
    createdAt: new Date(),
    isPosted: true,
    isImmutable: true,
  },
  // ... existing vouchers
];
```

### Modifying Company Details
Edit `src/lib/mockData.ts`:
```typescript
export const mockCompany: Company = {
  id: '1',
  name: 'Your Company Name',
  gstin: 'YOUR_GSTIN_HERE',
  pan: 'YOUR_PAN_HERE',
  address: 'Your Address',
  city: 'Your City',
  state: 'Your State',
  pincode: '000000',
  email: 'your@email.com',
  phone: '+91 00000 00000',
  financialYearStart: new Date('2024-04-01'),
  financialYearEnd: new Date('2025-03-31'),
  baseCurrency: 'INR',
};
```

## 📊 Understanding the Data Flow

1. **Mock Data** (`mockData.ts`) → Contains all sample data
2. **Dashboard Component** (`Dashboard.tsx`) → Imports and displays data
3. **Utility Functions** → Format and calculate values
4. **Type System** → Ensures type safety throughout

## 🎯 Common Tasks

### View Financial Summary
```typescript
import { getFinancialSummary } from '@/lib/mockData';

const summary = getFinancialSummary();
console.log(summary);
// {
//   totalAssets: 4700000,
//   totalLiabilities: 820000,
//   totalEquity: 6250000,
//   totalRevenue: 9700000,
//   totalExpenses: 6780000,
//   netProfit: 2920000
// }
```

### Format Currency
```typescript
import { formatCurrency } from '@/lib/mockData';

const formatted = formatCurrency(1000000);
console.log(formatted); // "₹10,00,000"
```

### Validate GSTIN
```typescript
import { validateGSTIN } from '@/lib/mockData';

const isValid = validateGSTIN('29AABCT1332L1Z5');
console.log(isValid); // true
```

### Calculate GST
```typescript
import { calculateGST } from '@/lib/mockData';

const gst = calculateGST(100000, 18, true); // ₹1,00,000 @ 18% intra-state
console.log(gst);
// {
//   cgst: 9000,
//   sgst: 9000,
//   igst: 0,
//   total: 18000
// }
```

## 🔧 Development Tips

### Hot Reload
The dev server supports hot reload. Just save your files and see changes instantly!

### TypeScript Errors
If you see TypeScript errors:
```bash
npm run build
```
This will show all type errors at once.

### Styling Tips
- Use existing CSS classes from `globals.css`
- Follow the color variable system
- Use Tailwind utilities for spacing and layout
- Add custom classes for reusable components

### Component Structure
```typescript
'use client'; // For client-side interactivity

import { useState } from 'react';
import { YourIcon } from 'lucide-react';

export default function YourComponent() {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="card">
      {/* Your component JSX */}
    </div>
  );
}
```

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (2 column layout)
- **Desktop**: > 1024px (full layout with sidebar)

## 🎨 Design Tokens

### Colors
- **Primary**: Blue gradient (for main actions)
- **Accent**: Orange gradient (for highlights)
- **Success**: Green (for positive actions)
- **Error**: Red (for errors/warnings)
- **Warning**: Amber (for cautions)

### Spacing
- **xs**: 0.5rem (8px)
- **sm**: 0.75rem (12px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

### Border Radius
- **sm**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)

## 🚀 Next Steps

1. **Add Database**: Integrate Prisma with PostgreSQL
2. **Build API**: Create API routes for CRUD operations
3. **Add Auth**: Implement user authentication
4. **Create Forms**: Build voucher entry forms
5. **Add Charts**: Implement financial charts with Recharts
6. **GST Module**: Build GST compliance features
7. **Reports**: Create report generation system
8. **AI Integration**: Connect to AI service for insights

## 📚 Resources

- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **Recharts**: https://recharts.org

## 💡 Tips

- Use the browser DevTools to inspect components
- Check the console for any errors
- Use React DevTools extension for component debugging
- Refer to `IMPLEMENTATION.md` for detailed architecture
- Check `README.md` for project overview

---

**Happy Coding!** 🎉
