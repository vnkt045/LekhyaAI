import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';
import { formatCurrency } from '@/lib/pdf-utils';

const styles = StyleSheet.create({
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
        borderTopWidth: 1,
        borderTopColor: '#CBD5E1',
        alignItems: 'center',
        paddingVertical: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 4,
        alignItems: 'center',
    },
    colAccount: {
        width: '50%',
        paddingLeft: 8,
    },
    colAmount: {
        width: '25%',
        textAlign: 'right',
        paddingRight: 8,
    },
    textHeader: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1A3E5C',
        textTransform: 'uppercase',
    },
    textNormal: {
        fontSize: 9,
        color: '#334155',
    },
    textBold: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#94A3B8',
        borderBottomWidth: 1,
        borderBottomColor: '#94A3B8',
        paddingVertical: 6,
        marginTop: 4,
        alignItems: 'center',
    }
});

interface TrialBalanceNode {
    id: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    net: number;
    isGroup: boolean;
    children?: TrialBalanceNode[];
}

interface TrialBalancePDFProps {
    date: string;
    fromDate?: string;
    toDate?: string;
    nodes: TrialBalanceNode[];
    totalDebit: number;
    totalCredit: number;
    companyName?: string;
    companyAddress?: string;
    companyGstin?: string;
}

// Flat list renderer for simple Trial Balance table
// Or recursive if we want hierarchy. Let's do recursive but with indentation.

const NodeRow = ({ node, level = 0 }: { node: TrialBalanceNode, level?: number }) => {

    // Logic to hide zero balance nodes if they are not groups or have no children?
    // Usually TB shows all non-zero.
    if (Math.abs(node.debit) < 0.01 && Math.abs(node.credit) < 0.01 && (!node.children || node.children.length === 0)) {
        return null;
    }

    return (
        <View>
            <View style={styles.tableRow}>
                <View style={[styles.colAccount, { paddingLeft: 8 + (level * 10) }]}>
                    <Text style={node.isGroup ? styles.textBold : styles.textNormal}>{node.name}</Text>
                </View>
                <View style={styles.colAmount}>
                    <Text style={node.isGroup ? styles.textBold : styles.textNormal}>
                        {node.debit > 0 ? formatCurrency(node.debit) : ''}
                    </Text>
                </View>
                <View style={styles.colAmount}>
                    <Text style={node.isGroup ? styles.textBold : styles.textNormal}>
                        {node.credit > 0 ? formatCurrency(node.credit) : ''}
                    </Text>
                </View>
            </View>
            {node.children && node.children.map(child => (
                <NodeRow key={child.id} node={child} level={level + 1} />
            ))}
        </View>
    );
};

export const TrialBalancePDF = ({
    date, fromDate, toDate, nodes, totalDebit, totalCredit,
    companyName, companyAddress, companyGstin
}: TrialBalancePDFProps) => {

    return (
        <ReportPDF
            title="Trial Balance"
            subTitle={fromDate && toDate ? `Period ${fromDate} to ${toDate}` : `As of ${new Date(date).toLocaleDateString()}`}
            companyName={companyName}
            companyAddress={companyAddress}
            companyGstin={companyGstin}
        >
            <View>
                {/* Header */}
                <View style={styles.tableHeader}>
                    <View style={styles.colAccount}>
                        <Text style={styles.textHeader}>Account Name</Text>
                    </View>
                    <View style={styles.colAmount}>
                        <Text style={styles.textHeader}>Debit</Text>
                    </View>
                    <View style={styles.colAmount}>
                        <Text style={styles.textHeader}>Credit</Text>
                    </View>
                </View>

                {/* Rows */}
                {nodes.map(node => (
                    <NodeRow key={node.id} node={node} level={0} />
                ))}

                {/* Total */}
                <View style={styles.totalRow}>
                    <View style={styles.colAccount}>
                        <Text style={[styles.textHeader, { textAlign: 'right', paddingRight: 20 }]}>Grand Total</Text>
                    </View>
                    <View style={styles.colAmount}>
                        <Text style={styles.textHeader}>{formatCurrency(totalDebit)}</Text>
                    </View>
                    <View style={styles.colAmount}>
                        <Text style={styles.textHeader}>{formatCurrency(totalCredit)}</Text>
                    </View>
                </View>

                {Math.abs(totalDebit - totalCredit) > 1 && (
                    <View style={{ marginTop: 10, padding: 5, backgroundColor: '#FEF2F2', borderRadius: 2 }}>
                        <Text style={{ fontSize: 9, color: '#DC2626', textAlign: 'center' }}>
                            Difference in Books: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                        </Text>
                    </View>
                )}
            </View>
        </ReportPDF>
    );
};
