"use client";

import React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Button, Card, CardContent, Container, IconButton, Menu, MenuItem, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
  InputAdornment, Select, FormControl, Pagination
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewListIcon from "@mui/icons-material/ViewList";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

interface InvoiceRow {
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
}

interface Metrics { invoiceCount: number; totalAmount: number; }
interface TopItem { itemID: number; itemName: string; amountSum: number; }
interface TrendPoint { monthStart: string; invoiceCount: number; amountSum: number; }
interface VisibleCols { subTotal: boolean; taxPct: boolean; taxAmt: boolean; }

export default function InvoicesClient({
  rows,
  metrics,
  top,
  trend,
}: {
  rows: InvoiceRow[];
  metrics: Metrics | null;
  top: TopItem[];
  trend: TrendPoint[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<"today" | "week" | "month" | "year">("today");
  const [colMenuEl, setColMenuEl] = useState<null | HTMLElement>(null);
  const [visibleCols, setVisibleCols] = useState<VisibleCols>({ subTotal: true, taxPct: true, taxAmt: true });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.invoiceNo.includes(query) ||
          r.customerName.toLowerCase().includes(query.toLowerCase())
      ),
    [rows, query]
  );

  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with title and date filters */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Invoices
        </Typography>
        <Stack direction="row" gap={1}>
          {(["today", "week", "month", "year"] as const).map((k) => (
            <Button
              key={k}
              size="small"
              variant={range === k ? "contained" : "outlined"}
              onClick={() => setRange(k)}
              sx={{
                textTransform: 'none',
                borderRadius: 1,
                minWidth: 60,
                ...(range === k ? {
                  bgcolor: '#000',
                  color: '#fff',
                  '&:hover': { bgcolor: '#333' }
                } : {
                  borderColor: '#ddd',
                  color: '#444',
                  '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
                })
              }}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </Button>
          ))}
          <Button
            size="small"
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              minWidth: 60,
              borderColor: '#ddd',
              color: '#444',
              '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
            }}
          >
            Custom
          </Button>
        </Stack>
      </Stack>

      {/* KPI Cards */}
      {metrics && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
          <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ py: 2.5 }}>
              <Typography color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
                Number of Invoices
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 600 }}>
                {metrics.invoiceCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ py: 2.5 }}>
              <Typography color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
                Total Invoice Amount
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 600 }}>
                ${metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ py: 2.5 }}>
              <Typography color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
                Last 12 Months
              </Typography>
              <Box sx={{
                height: 80,
                border: '1px dashed #e0e0e0',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 1
              }}>
                <Typography variant="caption" color="text.secondary">
                  Line Chart: Monthly Revenue
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardContent sx={{ py: 2.5 }}>
              <Typography color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
                Top 5 Items
              </Typography>
              <Box sx={{
                height: 80,
                border: '1px dashed #e0e0e0',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 1
              }}>
                <Typography variant="caption" color="text.secondary">
                  Pie Chart: Item Distribution
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Action Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search Invoice No, Customer..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          sx={{
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              '& fieldset': { borderColor: '#e0e0e0' },
              '&:hover fieldset': { borderColor: '#bdbdbd' },
              '&.Mui-focused fieldset': { borderColor: '#1976d2' },
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" gap={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/invoice/editor')}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              bgcolor: '#000',
              color: '#fff',
              px: 2,
              '&:hover': { bgcolor: '#333' }
            }}
          >
            New Invoice
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              borderColor: '#ddd',
              color: '#444',
              px: 2,
              '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
            }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => setColMenuEl(e.currentTarget)}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              borderColor: '#ddd',
              color: '#444',
              '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
            }}
          />
        </Stack>
      </Stack>
      {/* Table Card */}
      <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table sx={{
              '& .MuiTableCell-root': {
                borderBottom: '1px solid #e0e0e0',
                py: 1.5,
                px: 2
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: '#fafafa',
                fontWeight: 600,
                color: '#333',
                borderBottom: '1px solid #e0e0e0'
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Items</TableCell>
                  {visibleCols.subTotal && <TableCell align="right">Sub Total</TableCell>}
                  {visibleCols.taxPct && <TableCell align="right">Tax %</TableCell>}
                  {visibleCols.taxAmt && <TableCell align="right">Tax Amt</TableCell>}
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((r: InvoiceRow, idx: number) => (
                  <TableRow key={r.invoiceID} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{r.invoiceNo}</TableCell>
                    <TableCell>{new Date(r.invoiceDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell align="right">3</TableCell>
                    {visibleCols.subTotal && <TableCell align="right" sx={{ fontWeight: 500 }}>${r.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>}
                    {visibleCols.taxPct && <TableCell align="right" sx={{ fontWeight: 500 }}>{r.taxPercentage.toFixed(2)}</TableCell>}
                    {visibleCols.taxAmt && <TableCell align="right" sx={{ fontWeight: 500 }}>${r.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>}
                    <TableCell align="right" sx={{ fontWeight: 500 }}>${r.invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/invoice/editor?id=${r.invoiceID}`)}
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => window.open(`/invoices/print/${r.invoiceID}`, '_blank')}
                        sx={{ mr: 0.5 }}
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedRows.length === 0 && (
                  <TableRow>
                    <TableCell align="center" colSpan={9}>
                      <Typography color="text.secondary">No invoices found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>

        {/* Pagination Footer */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 60 }}>
              <Select
                value={rowsPerPage}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setRowsPerPage(Number(e.target.value))}
                sx={{
                  '& .MuiSelect-select': { py: 0.5 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
            </Typography>
            <Pagination
              count={Math.ceil(filtered.length / rowsPerPage)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  minWidth: 32,
                  height: 32,
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        </Stack>
      </Card>

      <Menu anchorEl={colMenuEl} open={!!colMenuEl} onClose={() => setColMenuEl(null)}>
        <MenuItem onClick={() => setVisibleCols((v: VisibleCols) => ({ ...v, subTotal: !v.subTotal }))}>Sub Total {visibleCols.subTotal ? "✓" : ""}</MenuItem>
        <MenuItem onClick={() => setVisibleCols((v: VisibleCols) => ({ ...v, taxPct: !v.taxPct }))}>Tax % {visibleCols.taxPct ? "✓" : ""}</MenuItem>
        <MenuItem onClick={() => setVisibleCols((v: VisibleCols) => ({ ...v, taxAmt: !v.taxAmt }))}>Tax Amt {visibleCols.taxAmt ? "✓" : ""}</MenuItem>
      </Menu>
    </Container>
  );
}
