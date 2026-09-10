"use client";

import * as React from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { Invoice } from "@/types/database";
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 20,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 26,
    height: 26,
    backgroundColor: "#4338ca",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoLetter: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4338ca",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  metaLabel: {
    color: "#64748b",
  },
  metaValue: {
    fontWeight: "bold",
  },
  billToSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  billCol: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  textMuted: {
    color: "#475569",
    marginBottom: 2,
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: "bold",
    color: "#475569",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colDesc: { width: "55%" },
  colQty: { width: "15%", textAlign: "right" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 28,
  },
  summaryBox: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    marginTop: 4,
    paddingTop: 6,
  },
  totalAmount: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  footerNotes: {
    fontSize: 8,
    color: "#64748b",
    lineHeight: 1.4,
  },
});

export function InvoicePDFDocument({ invoice }: { invoice: Invoice }) {
  return (
    <Document title={`Invoice-${invoice.invoice_number}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>K</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Klyro Business Platform</Text>
              <Text style={styles.textMuted}>Financial & Operations Suite</Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No:</Text>
              <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Issue Date:</Text>
              <Text style={styles.metaValue}>{invoice.issue_date}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date:</Text>
              <Text style={styles.metaValue}>{invoice.due_date}</Text>
            </View>
          </View>
        </View>

        {/* Bill To & From */}
        <View style={styles.billToSection}>
          <View style={styles.billCol}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={styles.customerName}>{invoice.customer?.name || "Valued Client"}</Text>
            {invoice.customer?.email && (
              <Text style={styles.textMuted}>{invoice.customer.email}</Text>
            )}
            {invoice.customer?.phone && (
              <Text style={styles.textMuted}>{invoice.customer.phone}</Text>
            )}
            {invoice.customer?.address && (
              <Text style={styles.textMuted}>{invoice.customer.address}</Text>
            )}
          </View>
          <View style={styles.billCol}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <Text style={styles.textMuted}>Status: {invoice.status.toUpperCase()}</Text>
            <Text style={styles.textMuted}>Currency: USD ($)</Text>
            <Text style={styles.textMuted}>Terms: {invoice.terms || "Net 30 Days"}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {invoice.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>${item.unit_price.toFixed(2)}</Text>
              <Text style={styles.colTotal}>${item.total_price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.textMuted}>Subtotal:</Text>
              <Text style={styles.metaValue}>${invoice.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.textMuted}>Tax ({invoice.tax_rate}%):</Text>
              <Text style={styles.metaValue}>${invoice.tax_amount.toFixed(2)}</Text>
            </View>
            {invoice.discount_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.textMuted}>Discount:</Text>
                <Text style={styles.metaValue}>-${invoice.discount_amount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Total Due:</Text>
              <Text style={styles.totalAmount}>${invoice.total_amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer Notes & Terms */}
        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>Notes & Terms</Text>
          <Text style={styles.footerNotes}>{invoice.notes}</Text>
          <Text style={[styles.footerNotes, { marginTop: 4 }]}>
            Thank you for partnering with Klyro. Please include invoice number {invoice.invoice_number} with your remittance.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export function DownloadInvoicePDFButton({ invoice }: { invoice: Invoice }) {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5">
        <Download className="w-3.5 h-3.5" />
        Generating PDF...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument invoice={invoice} />}
      fileName={`Invoice-${invoice.invoice_number}.pdf`}
      className="inline-flex"
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" isLoading={loading} className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          {loading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
