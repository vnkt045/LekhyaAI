/**
 * Simple Tally XML Parser
 * Extracts Ledgers (Masters) and Vouchers (Transactions)
 */

export interface TallyLedger {
    name: string;
    parent: string;
    openingBalance: number;
}

export interface TallyVoucher {
    date: string;
    voucherNumber: string;
    voucherType: string;
    narration: string;
    amount: number;
    ledgerEntries: {
        ledgerName: string;
        amount: number;
        isDeemedPositive: boolean; // Yes = Debit, No = Credit
    }[];
}

export const parseTallyXML = async (xmlContent: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    const ledgers: TallyLedger[] = [];
    const vouchers: TallyVoucher[] = [];

    // Parse Ledgers
    const ledgerNodes = xmlDoc.getElementsByTagName("LEDGER");
    for (let i = 0; i < ledgerNodes.length; i++) {
        const node = ledgerNodes[i];
        const name = node.getAttribute("NAME") || node.getElementsByTagName("NAME")[0]?.textContent || "Unknown";
        const parent = node.getElementsByTagName("PARENT")[0]?.textContent || "Primary";
        const openingBalance = parseFloat(node.getElementsByTagName("OPENINGBALANCE")[0]?.textContent || "0");

        ledgers.push({ name, parent, openingBalance });
    }

    // Parse Vouchers
    const voucherNodes = xmlDoc.getElementsByTagName("VOUCHER");
    for (let i = 0; i < voucherNodes.length; i++) {
        const node = voucherNodes[i];
        const date = node.getElementsByTagName("DATE")[0]?.textContent || "";
        const voucherNumber = node.getElementsByTagName("VOUCHERNUMBER")[0]?.textContent || "";
        const voucherType = node.getElementsByTagName("VOUCHERTYPENAME")[0]?.textContent || "";
        const narration = node.getElementsByTagName("NARRATION")[0]?.textContent || "";

        const ledgerEntries = [];
        const entryNodes = node.getElementsByTagName("ALLLEDGERENTRIES.LIST");

        let totalAmount = 0;

        for (let j = 0; j < entryNodes.length; j++) {
            const entry = entryNodes[j];
            const ledgerName = entry.getElementsByTagName("LEDGERNAME")[0]?.textContent || "";
            const amount = parseFloat(entry.getElementsByTagName("AMOUNT")[0]?.textContent || "0");
            const isDeemedPositive = entry.getElementsByTagName("ISDEEMEDPOSITIVE")[0]?.textContent === "Yes";

            ledgerEntries.push({ ledgerName, amount: Math.abs(amount), isDeemedPositive });
            if (isDeemedPositive) totalAmount += Math.abs(amount);
        }

        vouchers.push({
            date,
            voucherNumber,
            voucherType,
            narration,
            amount: totalAmount, // Total Debit
            ledgerEntries
        });
    }

    return { ledgers, vouchers };
};
