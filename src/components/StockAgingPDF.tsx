import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';
import { formatCurrency } from '@/lib/pdf-utils';

const styles = StyleSheet.create({
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#E2E8F0',
        borderBottomWidth: 1,
        minHeight: 24,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#F1F5F9',
        fontWeight: 'bold',
        color: '#1A3E5C',
    },
    tableCell: {
        padding: 4,
        fontSize: 9,
        borderRightColor: '#E2E8F0',
        borderRightWidth: 1,
    },
    summaryBox: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    card: {
        flex: 1,
        padding: 10,
        backgroundColor: '#F8FAFC',
        borderRadius: 4,
        border: '1px solid #E2E8F0',
    },
    cardTitle: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A3E5C',
    },
    cardSub: {
        fontSize: 8,
        color: '#94A3B8',
    }
});

interface AgingItem {
    itemId: string;
    itemCode: string;
    itemName: string;
    currentStock: number;
    unit: string;
    purchaseRate: number;
    value: number;
    lastMovementDate: string;
    ageInDays: number;
    ageBracket: string;
}

interface AgingSummary {
    '0-30': { count: number; value: number };
    '31-60': { count: number; value: number };
    '61-90': { count: number; value: number };
    '90+': { count: number; value: number };
}

interface StockAgingData {
    asOfDate: string;
    summary: AgingSummary;
    items: AgingItem[];
}

export const StockAgingPDF = ({ data }: { data: StockAgingData }) => {
    return (
        <ReportPDF title="Stock Aging Report" subTitle={`As of ${new Date(data.asOfDate).toLocaleDateString()}`} orientation="landscape">
            {/* Summary Cards */}
            <View style={styles.summaryBox}>
                {Object.entries(data.summary).map(([bracket, stats]) => (
                    <View key={bracket} style={styles.card}>
                        <Text style={styles.cardTitle}>{bracket} Days</Text>
                        <Text style={styles.cardValue}>{stats.count} Items</Text>
                        <Text style={styles.cardSub}>Val: {formatCurrency(stats.value)}</Text>
                    </View>
                ))}
            </View>

            {/* Table */}
            <View style={styles.table}>
                {/* Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, { width: '10%' }]}>Code</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>Item Name</Text>
                    <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>Stock</Text>
                    <Text style={[styles.tableCell, { width: '8%', textAlign: 'center' }]}>Unit</Text>
                    <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>Rate</Text>
                    <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>Value</Text>
                    <Text style={[styles.tableCell, { width: '10%' }]}>Last Mov.</Text>
                    <Text style={[styles.tableCell, { width: '10%', textAlign: 'center' }]}>Bracket</Text>
                </View>

                {/* Rows */}
                {data.items.map((item, idx) => (
                    <View key={idx} style={[styles.tableRow, { backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }]}>
                        <Text style={[styles.tableCell, { width: '10%' }]}>{item.itemCode}</Text>
                        <Text style={[styles.tableCell, { width: '25%' }]}>{item.itemName}</Text>
                        <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>{item.currentStock}</Text>
                        <Text style={[styles.tableCell, { width: '8%', textAlign: 'center' }]}>{item.unit}</Text>
                        <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>{formatCurrency(item.purchaseRate)}</Text>
                        <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatCurrency(item.value)}</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>{new Date(item.lastMovementDate).toLocaleDateString()}</Text>
                        <Text style={[styles.tableCell, { width: '10%', textAlign: 'center', color: item.ageBracket === '90+' ? '#EF4444' : '#000' }]}>{item.ageBracket}</Text>
                    </View>
                ))}
            </View>

            {/* Total Footer */}
            <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1A3E5C' }}>
                    Total Inventory Value: {formatCurrency(data.items.reduce((sum, item) => sum + item.value, 0))}
                </Text>
            </View>
        </ReportPDF>
    );
};
