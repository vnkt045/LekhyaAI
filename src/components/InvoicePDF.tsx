import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { formatCurrency, formatDate, numberToWords } from '@/lib/pdf-utils';

// Register fonts (optional, using default Helvetica for now)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1A3E5C',
        paddingBottom: 10,
    },
    companyInfo: {
        flexDirection: 'column',
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A3E5C',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    companyDetails: {
        fontSize: 9,
        color: '#555',
        lineHeight: 1.4,
    },
    invoiceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F59E0B',
        textTransform: 'uppercase',
        textAlign: 'right',
    },
    invoiceDetails: {
        marginTop: 8,
        textAlign: 'right',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 2,
    },
    label: {
        fontWeight: 'bold',
        marginRight: 8,
        color: '#1A3E5C',
    },
    value: {
        color: '#333',
    },
    partyBox: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8F9FA',
        padding: 10,
        marginBottom: 20,
        borderRadius: 2,
    },
    partyTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1A3E5C',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
    },
    tableHeader: {
        backgroundColor: '#1A3E5C',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 6,
    },
    tableColHeader: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 4,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 6,
        backgroundColor: '#fff',
    },
    tableRowAlternate: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 6,
        backgroundColor: '#F8FAFC',
    },
    tableCol: {
        fontSize: 9,
        paddingHorizontal: 4,
        textAlign: 'right',
        color: '#333',
    },
    tableColText: {
        fontSize: 9,
        paddingHorizontal: 4,
        textAlign: 'left',
        color: '#333',
    },
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    summaryBox: {
        width: '40%',
        padding: 10,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderStyle: 'dashed',
    },
    summaryLastRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 2,
        borderTopColor: '#1A3E5C',
    },
    grandTotal: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1A3E5C',
    },
    amountWords: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 8,
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 20,
    },
    bankDetails: {
        width: '50%',
    },
    signature: {
        width: '40%',
        textAlign: 'center',
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 5,
    },
    watermark: {
        position: 'absolute',
        top: 300,
        left: 150,
        opacity: 0.1,
        transform: 'rotate(-45deg)',
        fontSize: 60,
        color: '#1A3E5C',
        width: 500,
        textAlign: 'center',
    }
});

interface InvoicePDFProps {
    voucher: any;
    company?: any;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ voucher, company }) => {
    // Mock company data if not provided (replace with real data later)
    const defaultCompany = {
        name: 'LEKHYA AI ENTERPRISES',
        address: 'Tech Park, Hitech City, Hyderabad - 500081',
        gstin: '36AAAAA0000A1Z5',
        email: 'accounts@lekhya.ai',
        phone: '+91 98765 43210'
    };

    const comp = company || defaultCompany;
    const items = voucher.items || [];

    // Calculate totals
    const totalTaxable = items.reduce((sum: number, item: any) => sum + (item.taxableAmount || 0), 0);
    const totalCGST = items.reduce((sum: number, item: any) => sum + (item.cgstAmount || 0), 0);
    const totalSGST = items.reduce((sum: number, item: any) => sum + (item.sgstAmount || 0), 0);
    const totalIGST = items.reduce((sum: number, item: any) => sum + (item.igstAmount || 0), 0);
    const totalAmount = voucher.totalAmount || 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.watermark}>
                    <Text>LEKHYA AI</Text>
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{comp.name}</Text>
                        <Text style={styles.companyDetails}>{comp.address}</Text>
                        <Text style={styles.companyDetails}>GSTIN: {comp.gstin}</Text>
                        <Text style={styles.companyDetails}>Ph: {comp.phone}</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>{voucher.voucherType === 'SALES' ? 'TAX INVOICE' : voucher.voucherType}</Text>
                        <View style={styles.invoiceDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Invoice No:</Text>
                                <Text style={styles.value}>{voucher.voucherNumber}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Date:</Text>
                                <Text style={styles.value}>{formatDate(voucher.date)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Party Details */}
                <View style={styles.partyBox}>
                    <Text style={styles.partyTitle}>Billed To:</Text>
                    <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{voucher.account?.name || voucher.partyName}</Text>
                    {voucher.account?.address && <Text style={{ fontSize: 9, marginTop: 2 }}>{voucher.account.address}</Text>}
                    {voucher.account?.gstin && <Text style={{ fontSize: 9, marginTop: 2 }}>GSTIN: {voucher.account.gstin}</Text>}
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableColHeader, { width: '5%' }]}>#</Text>
                        <Text style={[styles.tableColHeader, { width: '35%', textAlign: 'left' }]}>Description</Text>
                        <Text style={[styles.tableColHeader, { width: '10%' }]}>HSN</Text>
                        <Text style={[styles.tableColHeader, { width: '10%' }]}>Qty</Text>
                        <Text style={[styles.tableColHeader, { width: '12%' }]}>Rate</Text>
                        <Text style={[styles.tableColHeader, { width: '8%' }]}>Tax</Text>
                        <Text style={[styles.tableColHeader, { width: '20%' }]}>Amount</Text>
                    </View>

                    {items.map((item: any, index: number) => (
                        <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
                            <Text style={[styles.tableCol, { width: '5%', textAlign: 'center' }]}>{index + 1}</Text>
                            <Text style={[styles.tableColText, { width: '35%' }]}>{item.productName || item.item?.name}</Text>
                            <Text style={[styles.tableCol, { width: '10%', textAlign: 'center' }]}>{item.hsnSac || '-'}</Text>
                            <Text style={[styles.tableCol, { width: '10%' }]}>{item.qty} {item.per}</Text>
                            <Text style={[styles.tableCol, { width: '12%' }]}>{formatCurrency(item.rate).replace('₹', '')}</Text>
                            <Text style={[styles.tableCol, { width: '8%' }]}>{(item.cgstRate + item.sgstRate + item.igstRate)}%</Text>
                            <Text style={[styles.tableCol, { width: '20%' }]}>{formatCurrency(item.totalAmount).replace('₹', '')}</Text>
                        </View>
                    ))}
                </View>

                {/* Summary & Totals */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={{ fontSize: 9 }}>Taxable Amount:</Text>
                            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{formatCurrency(totalTaxable)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={{ fontSize: 9 }}>CGST:</Text>
                            <Text style={{ fontSize: 9 }}>{formatCurrency(totalCGST)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={{ fontSize: 9 }}>SGST:</Text>
                            <Text style={{ fontSize: 9 }}>{formatCurrency(totalSGST)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={{ fontSize: 9 }}>IGST:</Text>
                            <Text style={{ fontSize: 9 }}>{formatCurrency(totalIGST)}</Text>
                        </View>
                        <View style={styles.summaryLastRow}>
                            <Text style={styles.grandTotal}>Grand Total:</Text>
                            <Text style={styles.grandTotal}>{formatCurrency(totalAmount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Amount in Words */}
                <View style={styles.amountWords}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#555' }}>Amount in Words:</Text>
                    <Text style={{ fontSize: 10, fontStyle: 'italic', marginTop: 2 }}>{numberToWords(totalAmount)}</Text>
                </View>

                {/* Narration */}
                {voucher.narration && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#555' }}>Remarks:</Text>
                        <Text style={{ fontSize: 9, fontStyle: 'italic' }}>{voucher.narration}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.bankDetails}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>Bank Details:</Text>
                        <Text style={{ fontSize: 8 }}>Bank Name: HDFC Bank</Text>
                        <Text style={{ fontSize: 8 }}>A/c No: 50200012345678</Text>
                        <Text style={{ fontSize: 8 }}>IFSC: HDFC0001234</Text>
                        <Text style={{ fontSize: 8 }}>Branch: Hitech City</Text>
                    </View>
                    <View>
                        <View style={styles.signature}>
                            <Text style={{ fontSize: 8 }}>Authorized Signatory</Text>
                        </View>
                    </View>
                </View>

                <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 }}>
                    <Text style={{ fontSize: 8, textAlign: 'center', color: '#999' }}>This is a computer generated invoice.</Text>
                </View>

            </Page>
        </Document>
    );
};

export default InvoicePDF;
