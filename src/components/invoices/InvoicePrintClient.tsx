"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Button,
  Alert,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { apiFetch } from "@/lib/api";

interface InvoiceData {
  invoiceID: number;
  invoiceNo: number;
  invoiceDate: string;
  customerName: string;
  address: string;
  city: string;
  notes: string;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
  lines: Array<{
    rowNo: number;
    itemID: number | null;
    description: string;
    quantity: number;
    rate: number;
    discountPct: number;
    amount: number;
  }>;
}

interface CompanyInfo {
  companyID: number;
  companyName: string;
  address: string;
  city: string;
  zip: string;
  currencySymbol: string;
}

export default function InvoicePrintClient({ invoiceID }: { invoiceID: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [invoice, company] = await Promise.all([
          apiFetch<InvoiceData[]>(`/invoice/getlist?invoiceID=${invoiceID}`),
          apiFetch<CompanyInfo>("/company/info")
        ]);
        
        if (invoice && invoice.length > 0) {
          setInvoiceData(invoice[0]);
        } else {
          setError("Invoice not found");
        }
        
        if (company) {
          setCompanyInfo(company);
        }
      } catch {
        setError("Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    }

    if (invoiceID) {
      loadData();
    }
  }, [invoiceID]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading invoice...</Typography>
      </Container>
    );
  }

  if (error || !invoiceData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || "Invoice not found"}</Alert>
      </Container>
    );
  }

  const formatCurrency = (amount: number) => {
    const symbol = companyInfo?.currencySymbol || "$";
    return `${symbol}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'white',
      '@media print': {
        minHeight: 'auto',
        bgcolor: 'white',
      }
    }}>
      {/* Print Button - Hidden in print */}
      <Box sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 1000,
        '@media print': { display: 'none' }
      }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ 
            bgcolor: '#444', 
            '&:hover': { bgcolor: '#222' },
            boxShadow: 2
          }}
        >
          Print Invoice
        </Button>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Company Info */}
            <Box>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                {companyInfo?.companyName || "Company Name"}
              </Typography>
              {companyInfo?.address && (
                <Typography variant="body2" color="text.secondary">
                  {companyInfo.address}
                </Typography>
              )}
              {(companyInfo?.city || companyInfo?.zip) && (
                <Typography variant="body2" color="text.secondary">
                  {[companyInfo?.city, companyInfo?.zip].filter(Boolean).join(', ')}
                </Typography>
              )}
            </Box>

            {/* Invoice Info */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                INVOICE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invoice #: {invoiceData.invoiceNo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {formatDate(invoiceData.invoiceDate)}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Bill To */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Bill To:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {invoiceData.customerName}
            </Typography>
            {invoiceData.address && (
              <Typography variant="body2" color="text.secondary">
                {invoiceData.address}
              </Typography>
            )}
            {invoiceData.city && (
              <Typography variant="body2" color="text.secondary">
                {invoiceData.city}
              </Typography>
            )}
          </Box>

          {/* Line Items Table */}
          <Box sx={{ mt: 3 }}>
            <Table size="small" sx={{ 
              border: '1px solid #e0e0e0',
              '& .MuiTableCell-root': {
                borderBottom: '1px solid #e0e0e0',
                py: 1.5,
              }
            }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Disc %</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.lines.map((line) => (
                  <TableRow key={line.rowNo}>
                    <TableCell>{line.rowNo}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell align="right">{line.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(line.rate)}</TableCell>
                    <TableCell align="right">{line.discountPct.toFixed(2)}%</TableCell>
                    <TableCell align="right">{formatCurrency(line.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Box sx={{ minWidth: 300 }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Sub Total:</Typography>
                  <Typography>{formatCurrency(invoiceData.subTotal)}</Typography>
                </Box>
                
                {invoiceData.taxPercentage > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Tax ({invoiceData.taxPercentage.toFixed(2)}%):</Typography>
                    <Typography>{formatCurrency(invoiceData.taxAmount)}</Typography>
                  </Box>
                )}
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={600}>Total:</Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {formatCurrency(invoiceData.invoiceAmount)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Notes */}
          {invoiceData.notes && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Notes:
              </Typography>
              <Typography variant="body2" sx={{ 
                whiteSpace: 'pre-wrap',
                bgcolor: '#f9f9f9',
                p: 2,
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                {invoiceData.notes}
              </Typography>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Thank you for your business!
            </Typography>
            {companyInfo?.companyName && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {companyInfo.companyName}
              </Typography>
            )}
          </Box>
        </Stack>
      </Container>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .MuiContainer-root {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .MuiButton-root {
            display: none !important;
          }
          
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </Box>
  );
}