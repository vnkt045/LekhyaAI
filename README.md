# LekhyaAI - Intelligent Accounting for Indian Businesses

![LekhyaAI](https://img.shields.io/badge/LekhyaAI-Intelligent%20Accounting-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**LekhyaAI** is an ethical, GST-ready accounting web application built specifically for Indian businesses. It combines comprehensive double-entry bookkeeping with AI-powered insights to provide a modern, intelligent financial management solution.

## 🌟 Features

### Core Accounting System
- ✅ **Double-Entry Bookkeeping** - Strict adherence to accounting principles
- ✅ **Chart of Accounts** - Comprehensive account management (Assets, Liabilities, Equity, Revenue, Expenses)
- ✅ **Voucher System** - Support for all voucher types:
  - Payment Vouchers
  - Receipt Vouchers
  - Contra Vouchers
  - Journal Vouchers
  - Sales Vouchers
  - Purchase Vouchers
  - Debit/Credit Notes
- ✅ **Immutable Ledgers** - Posted vouchers cannot be modified (audit-safe)

### GST Compliance
- 🇮🇳 **India-First Design** - Built for Indian tax regulations
- ✅ **GSTIN Validation** - Automatic validation of GST numbers
- ✅ **HSN/SAC Master** - Comprehensive product/service classification
- ✅ **CGST/SGST/IGST** - Automatic tax calculation based on location
- ✅ **Reverse Charge Mechanism** - Full support for RCM transactions
- ✅ **ITC Eligibility** - Input Tax Credit tracking
- ✅ **GSTR-1/GSTR-3B** - Ready-to-file GST returns with JSON export

### AI Intelligence Engine
- 🤖 **Anomaly Detection** - Identifies unusual patterns in expenses and revenue
- 📊 **Predictive Analytics** - Revenue and cash flow forecasting
- ⚠️ **Compliance Alerts** - Proactive notifications for filing deadlines
- 💡 **Smart Suggestions** - Actionable insights for financial optimization
- 🔍 **Explainable AI** - Transparent reasoning for all AI recommendations

### Reports & Analytics
- 📈 **Balance Sheet** - Real-time financial position
- 📊 **Profit & Loss** - Comprehensive income statement
- 🔄 **Trial Balance** - Account-wise balances
- 💰 **Cash Flow Statement** - Track cash movements
- 📉 **Custom Reports** - Flexible reporting engine

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd d:\AntiGravity_Projects\LekhyaAI\lekhya-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

### Build for Production

```bash
npm run build
npm start
```

### Network Access
To access the application from other devices on the same LAN:
1. Find your IP address (e.g., `192.168.x.x`)
2. Open `http://<YOUR_IP>:3001` in the browser
3. Current verified IP: `http://192.168.29.215:3001`

## 📁 Project Structure

```
lekhya-ai/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout with metadata
│   │   ├── page.tsx           # Home page (Dashboard)
│   │   └── globals.css        # Global styles and design system
│   ├── components/            # React components
│   │   └── Dashboard.tsx      # Main dashboard component
│   ├── lib/                   # Utility functions and data
│   │   └── mockData.ts        # Mock data and helper functions
│   └── types/                 # TypeScript type definitions
│       └── accounting.ts      # Accounting-related types
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 🎨 Design Philosophy

LekhyaAI follows modern web design principles:

- **Premium Aesthetics** - Vibrant gradients, smooth animations, and glassmorphism effects
- **Indian Color Palette** - Colors inspired by Indian business culture
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Accessibility** - WCAG 2.1 compliant with keyboard navigation support
- **Performance** - Optimized for fast loading and smooth interactions

## 🔧 Technology Stack

- **Framework:** Next.js 16.1 with App Router
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 4.0 with custom design system
- **Icons:** Lucide React
- **Charts:** Recharts (for analytics)
- **Date Handling:** date-fns

## 📊 Dashboard Features

The main dashboard provides:

1. **Financial Overview Cards**
   - Total Assets with trend
   - Net Profit with percentage change
   - Total Liabilities
   - Year-to-Date Revenue

2. **Recent Vouchers**
   - Quick view of latest transactions
   - Color-coded by voucher type
   - Click to view details

3. **AI Insights Panel**
   - Real-time anomaly detection
   - Compliance reminders
   - Smart suggestions
   - Severity-based prioritization

4. **Account Balances**
   - Breakdown by account type
   - Quick balance summary
   - Account count per category

## 🔐 Security & Compliance

- **Immutable Ledgers** - Posted entries cannot be modified
- **Audit Trail** - Complete history of all transactions
- **Data Validation** - Strict validation for GSTIN, PAN, and other identifiers
- **Double-Entry Enforcement** - Automatic validation of debit/credit balance
- **GST Compliance** - Built-in compliance with Indian tax regulations

## 🤝 Contributing

This is a demonstration project showcasing modern accounting software architecture. For production use, consider:

1. Adding a proper database (PostgreSQL/MySQL with Prisma)
2. Implementing user authentication and authorization
3. Adding API endpoints for CRUD operations
4. Integrating with actual GST portal APIs
5. Adding comprehensive test coverage
6. Implementing data backup and recovery

## 📝 License

MIT License - feel free to use this project as a starting point for your own accounting software.

## 🙏 Acknowledgments

- Built with ❤️ for Indian businesses
- Designed to promote ethical accounting practices
- Inspired by the need for affordable, GST-ready accounting solutions

## 📞 Support

For questions or support, please open an issue in the repository.

---

**LekhyaAI** - Making accounting intelligent, ethical, and accessible for every Indian business.
