import { db } from './db';

/**
 * Calculate TDS based on section and amount
 */
export async function calculateTDS(params: {
    sectionCode: string;
    amount: number;
    panNumber?: string;
    partyId: string;
}): Promise<{
    tdsAmount: number;
    tdsRate: number;
    section: any;
    applicable: boolean;
}> {
    const section = await db.tDSSection.findUnique({
        where: { section: params.sectionCode }
    });

    if (!section || !section.isActive) {
        throw new Error(`TDS Section ${params.sectionCode} not found or inactive`);
    }

    // Check threshold
    if (params.amount < section.thresholdLimit) {
        return {
            tdsAmount: 0,
            tdsRate: 0,
            section,
            applicable: false
        };
    }

    // Determine rate based on PAN availability
    const rate = params.panNumber ?
        section.rateWithPAN :
        section.rateWithoutPAN;

    const tdsAmount = (params.amount * rate) / 100;

    return {
        tdsAmount,
        tdsRate: rate,
        section,
        applicable: true
    };
}

/**
 * Calculate TCS based on goods type and amount
 */
export async function calculateTCS(params: {
    goodsType: string;
    amount: number;
    partyId: string;
}): Promise<{
    tcsAmount: number;
    tcsRate: number;
    config: any;
    applicable: boolean;
}> {
    const config = await db.tCSConfig.findUnique({
        where: { goodsType: params.goodsType }
    });

    if (!config || !config.isActive) {
        throw new Error(`TCS Config for ${params.goodsType} not found or inactive`);
    }

    // Check threshold
    if (params.amount < config.threshold) {
        return {
            tcsAmount: 0,
            tcsRate: 0,
            config,
            applicable: false
        };
    }

    const tcsAmount = (params.amount * config.rate) / 100;

    return {
        tcsAmount,
        tcsRate: config.rate,
        config,
        applicable: true
    };
}

/**
 * Get current financial year in format "2023-24"
 */
export function getCurrentFinancialYear(): string {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    // Financial year in India starts from April (month 3)
    if (month >= 3) {
        // April to March of next year
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        // January to March of current year
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
}

/**
 * Get current quarter in format "Q1-2024"
 */
export function getCurrentQuarter(): string {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    // Financial year quarters in India (April-March)
    // Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
    let quarter: number;
    let fyYear: number;

    if (month >= 3 && month <= 5) {
        // Apr-Jun
        quarter = 1;
        fyYear = year;
    } else if (month >= 6 && month <= 8) {
        // Jul-Sep
        quarter = 2;
        fyYear = year;
    } else if (month >= 9 && month <= 11) {
        // Oct-Dec
        quarter = 3;
        fyYear = year;
    } else {
        // Jan-Mar
        quarter = 4;
        fyYear = year - 1;
    }

    return `Q${quarter}-${fyYear}`;
}

/**
 * Create TDS entry for a voucher
 */
export async function createTDSEntry(params: {
    voucherId: string;
    sectionCode: string;
    partyId: string;
    panNumber?: string;
    amount: number;
    tdsAmount: number;
    tdsRate: number;
    challanNo?: string;
    challanDate?: Date;
}) {
    const section = await db.tDSSection.findUnique({
        where: { section: params.sectionCode }
    });

    if (!section) {
        throw new Error(`TDS Section ${params.sectionCode} not found`);
    }

    return await db.tDSEntry.create({
        data: {
            voucherId: params.voucherId,
            sectionId: section.id,
            partyId: params.partyId,
            panNumber: params.panNumber,
            amount: params.amount,
            tdsAmount: params.tdsAmount,
            tdsRate: params.tdsRate,
            quarter: getCurrentQuarter(),
            financialYear: getCurrentFinancialYear(),
            challanNo: params.challanNo,
            challanDate: params.challanDate
        }
    });
}

/**
 * Create TCS entry for a voucher
 */
export async function createTCSEntry(params: {
    voucherId: string;
    goodsType: string;
    partyId: string;
    amount: number;
    tcsAmount: number;
    tcsRate: number;
}) {
    const config = await db.tCSConfig.findUnique({
        where: { goodsType: params.goodsType }
    });

    if (!config) {
        throw new Error(`TCS Config for ${params.goodsType} not found`);
    }

    return await db.tCSEntry.create({
        data: {
            voucherId: params.voucherId,
            configId: config.id,
            partyId: params.partyId,
            amount: params.amount,
            tcsAmount: params.tcsAmount,
            tcsRate: params.tcsRate,
            quarter: getCurrentQuarter(),
            financialYear: getCurrentFinancialYear()
        }
    });
}

/**
 * Get TDS entries for a quarter
 */
export async function getTDSEntriesByQuarter(quarter: string, financialYear: string) {
    return await db.tDSEntry.findMany({
        where: {
            quarter,
            financialYear
        },
        include: {
            section: true,
            party: true,
            voucher: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

/**
 * Get TCS entries for a quarter
 */
export async function getTCSEntriesByQuarter(quarter: string, financialYear: string) {
    return await db.tCSEntry.findMany({
        where: {
            quarter,
            financialYear
        },
        include: {
            config: true,
            party: true,
            voucher: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

/**
 * Generate Form 26Q data (TDS on salary)
 */
export async function generateForm26Q(quarter: string, financialYear: string) {
    const entries = await getTDSEntriesByQuarter(quarter, financialYear);

    // Group by party
    const partyWise = entries.reduce((acc: any, entry: any) => {
        const partyId = entry.partyId;
        if (!acc[partyId]) {
            acc[partyId] = {
                party: entry.party,
                entries: [],
                totalAmount: 0,
                totalTDS: 0
            };
        }
        acc[partyId].entries.push(entry);
        acc[partyId].totalAmount += entry.amount;
        acc[partyId].totalTDS += entry.tdsAmount;
        return acc;
    }, {});

    return {
        quarter,
        financialYear,
        partyWise,
        totalDeductees: Object.keys(partyWise).length,
        totalTDS: Object.values(partyWise).reduce((sum: number, p: any) => sum + p.totalTDS, 0)
    };
}
