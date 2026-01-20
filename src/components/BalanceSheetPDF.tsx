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

interface BalanceSheetPDFProps {
    date: string;
    assets: TrialBalanceNode[];
    liabilities: TrialBalanceNode[];
    equity: TrialBalanceNode[];
    netProfit: number;
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
    companyName?: string;
    companyAddress?: string;
    companyGstin?: string;
}

const NodeRow = ({ node, side, level = 0 }: { node: TrialBalanceNode, side: 'asset' | 'liability', level?: number }) => {
    const val = side === 'asset' ? (node.debit - node.credit) : (node.credit - node.debit);
    const hasChildren = node.children && node.children.length > 0;

    if (val === 0 && !hasChildren) return null;

    return (
        <View style={{ marginBottom: 2 }}>
            <View style={[styles.row, { paddingLeft: level * 8 }]}>
                <Text style={[styles.itemName, level === 0 ? { fontWeight: 'bold' } : {}]}>{node.name}</Text>
                <Text style={styles.itemValue}>{formatCurrency(val)}</Text>
            </View>
            {hasChildren && node.children?.map(child => (
                <NodeRow key={child.id} node={child} side={side} level={level + 1} />
            ))}
        </View>
    );
};

export const BalanceSheetPDF = ({
    date, assets, liabilities, equity, netProfit,
    totalAssets, totalLiabilitiesAndEquity,
    companyName, companyAddress, companyGstin
}: BalanceSheetPDFProps) => {

    return (
        <ReportPDF
            title="Balance Sheet"
            subTitle={`Statement of Financial Position as of ${new Date(date).toLocaleDateString()}`}
            companyName={companyName}
            companyAddress={companyAddress}
            companyGstin={companyGstin}
        >
            <View style={styles.container}>
                {/* Liabilities Side (Left) */}
                <View style={[styles.column, { borderRightWidth: 1, borderRightColor: '#E2E8F0' }]}>
                    <View style={styles.colHeader}>
                        <Text style={styles.colTitle}>Liabilities</Text>
                    </View>

                    <View style={{ flex: 1, padding: 4 }}>
                        {/* Capital Account */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Capital Account</Text>
                            {equity.map(node => <NodeRow key={node.id} node={node} side="liability" />)}

                            {/* Net Profit */}
                            <View style={[styles.row, { marginTop: 4, paddingVertical: 2, borderTopWidth: 0.5, borderTopColor: '#000000', borderStyle: 'dotted' }]}>
                                <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Profit & Loss A/c</Text>
                                <Text style={styles.itemValue}>{formatCurrency(netProfit)}</Text>
                            </View>
                        </View>

                        {/* Loans & Liabilities */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Loans & Liabilities</Text>
                            {liabilities.map(node => <NodeRow key={node.id} node={node} side="liability" />)}
                        </View>
                    </View>

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalLiabilitiesAndEquity)}</Text>
                    </View>
                </View>

                {/* Assets Side (Right) */}
                <View style={styles.column}>
                    <View style={styles.colHeader}>
                        <Text style={styles.colTitle}>Assets</Text>
                    </View>

                    <View style={{ flex: 1, padding: 4 }}>
                        {assets.map(node => <NodeRow key={node.id} node={node} side="asset" />)}
                    </View>

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalAssets)}</Text>
                    </View>
                </View>
            </View>

            {/* Difference Check */}
            {Math.abs(totalAssets - totalLiabilitiesAndEquity) > 1 && (
                <View style={{ marginTop: 10, padding: 5, backgroundColor: '#FEF2F2', borderRadius: 2 }}>
                    <Text style={{ fontSize: 9, color: '#DC2626', textAlign: 'center' }}>
                        Difference in Books: {formatCurrency(Math.abs(totalAssets - totalLiabilitiesAndEquity))}
                    </Text>
                </View>
            )}
        </ReportPDF>
    );
};
