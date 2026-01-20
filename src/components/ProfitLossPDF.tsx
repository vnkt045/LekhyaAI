import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';
import { formatCurrency } from '@/lib/pdf-utils';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    column: {
        width: '50%',
        flexDirection: 'column',
    },
    colHeader: {
        backgroundColor: '#F1F5F9',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        alignItems: 'center',
    },
    colTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1A3E5C',
        textTransform: 'uppercase',
    },
    section: {
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 2,
        paddingBottom: 2,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 1,
    },
    itemName: {
        fontSize: 8,
        color: '#334155',
    },
    itemValue: {
        fontSize: 8,
        color: '#334155',
        fontFamily: 'Helvetica-Bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 5,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        marginTop: 'auto',
    },
    totalLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#1A3E5C',
    },
    totalValue: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#1A3E5C',
    }
});

interface TrialBalanceNode {
    id: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    net: number;
    children?: TrialBalanceNode[];
}

interface ProfitLossPDFProps {
    date: string;
    fromDate?: string;
    toDate?: string;
    revenueNodes: TrialBalanceNode[];
    expenseNodes: TrialBalanceNode[];
    netProfit: number;
    totalRevenue: number;
    totalExpense: number;
    companyName?: string;
    companyAddress?: string;
    companyGstin?: string;
}

const NodeRow = ({ node, type, level = 0 }: { node: TrialBalanceNode, type: 'income' | 'expense', level?: number }) => {
    // Value: 
    // If Income: Credit - Debit
    // If Expense: Debit - Credit
    const val = type === 'income' ? (node.credit - node.debit) : (node.debit - node.credit);
    const hasChildren = node.children && node.children.length > 0;

    if (val === 0 && !hasChildren) return null;

    return (
        <View style={{ marginBottom: 2 }}>
            <View style={[styles.row, { paddingLeft: level * 8 }]}>
                <Text style={[styles.itemName, level === 0 ? { fontWeight: 'bold' } : {}]}>{node.name}</Text>
                <Text style={styles.itemValue}>{formatCurrency(val)}</Text>
            </View>
            {hasChildren && node.children?.map(child => (
                <NodeRow key={child.id} node={child} type={type} level={level + 1} />
            ))}
        </View>
    );
};

export const ProfitLossPDF = ({
    date, fromDate, toDate, revenueNodes, expenseNodes, netProfit,
    totalRevenue, totalExpense,
    companyName, companyAddress, companyGstin
}: ProfitLossPDFProps) => {

    const isProfit = netProfit >= 0;

    return (
        <ReportPDF
            title="Profit & Loss A/c"
            subTitle={fromDate && toDate ? `Statement for period ${fromDate} to ${toDate}` : `Statement of Financial Performance as of ${new Date(date).toLocaleDateString()}`}
            companyName={companyName}
            companyAddress={companyAddress}
            companyGstin={companyGstin}
        >
            <View style={styles.container}>
                {/* Expenses Side (Left) - Dr */}
                <View style={[styles.column, { borderRightWidth: 1, borderRightColor: '#E2E8F0' }]}>
                    <View style={styles.colHeader}>
                        <Text style={styles.colTitle}>Expenses (Dr)</Text>
                    </View>

                    <View style={{ flex: 1, padding: 4 }}>
                        {expenseNodes.map(node => <NodeRow key={node.id} node={node} type="expense" />)}

                        {/* If Net Profit, show on Expense Side to balance */}
                        {isProfit && (
                            <View style={[styles.row, { marginTop: 10, paddingVertical: 4, borderTopWidth: 0.5, borderTopColor: '#000000', borderStyle: 'dotted' }]}>
                                <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Net Profit</Text>
                                <Text style={styles.itemValue}>{formatCurrency(netProfit)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(isProfit ? totalExpense + netProfit : totalExpense)}</Text>
                    </View>
                </View>

                {/* Revenue Side (Right) - Cr */}
                <View style={styles.column}>
                    <View style={styles.colHeader}>
                        <Text style={styles.colTitle}>Income (Cr)</Text>
                    </View>

                    <View style={{ flex: 1, padding: 4 }}>
                        {revenueNodes.map(node => <NodeRow key={node.id} node={node} type="income" />)}

                        {/* If Net Loss, show on Income Side to balance */}
                        {!isProfit && (
                            <View style={[styles.row, { marginTop: 10, paddingVertical: 4, borderTopWidth: 0.5, borderTopColor: '#000000', borderStyle: 'dotted' }]}>
                                <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Net Loss</Text>
                                <Text style={styles.itemValue}>{formatCurrency(Math.abs(netProfit))}</Text>
                            </View>
                        )}
                    </View>

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(isProfit ? totalRevenue : totalRevenue + Math.abs(netProfit))}</Text>
                    </View>
                </View>
            </View>
        </ReportPDF>
    );
};
