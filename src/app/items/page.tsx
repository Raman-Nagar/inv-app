"use client";

import React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Box, Button, Card, CardContent, Checkbox, Container, FormControlLabel,
  IconButton, Menu, MenuItem, Stack, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography, Avatar, InputAdornment, Select,
  FormControl, Pagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewListIcon from "@mui/icons-material/ViewList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ImageIcon from "@mui/icons-material/Image";
import { apiFetch } from "@/lib/api";
import ItemEditorDialog from "@/components/items/ItemEditorDialog";

interface ItemListRow {
  itemID: number;
  itemName: string;
  description: string | null;
  saleRate: number;
  discountPct: number;
}
interface VisibleCols { description: boolean; saleRate: boolean; discountPct: boolean; }

export default function ItemsPage() {
  const [rows, setRows] = useState<ItemListRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ItemListRow | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleCols, setVisibleCols] = useState<VisibleCols>({ description: true, saleRate: true, discountPct: true });
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ItemListRow[]>("/item/getlist");
      setRows(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load items";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const filteredRows = rows.filter((r: ItemListRow) =>
      r.itemName.toLowerCase().includes(query.toLowerCase()) ||
      (r.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
    );

    // Apply sorting
    if (sortField) {
      filteredRows.sort((a: ItemListRow, b: ItemListRow) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aVal: any = a[sortField as keyof ItemListRow];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bVal: any = b[sortField as keyof ItemListRow];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredRows;
  }, [rows, query, sortField, sortDirection]);

  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  function openNew() { setEditingRow(null); setEditorOpen(true); }
  function openEdit(row: ItemListRow) { setEditingRow(row); setEditorOpen(true); }

  type ItemEditorForm = { itemName: string; description?: string | null; salesRate?: number; saleRate?: number; discountPct?: number };
  async function handleSave(form: ItemEditorForm) {
    const body = {
      itemID: editingRow?.itemID ?? 0,
      itemName: form.itemName,
      description: form.description ?? "",
      saleRate: Number(form.salesRate ?? form.saleRate ?? 0),
      discountPct: Number(form.discountPct ?? 0),
      updatedOnPrev: null,
    };
    await apiFetch("/item/insertupdate", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    setEditorOpen(false);
    await load();
  }

  async function handleDelete(itemID: number) {
    if (!confirm("Delete this item?")) return;
    await apiFetch("/item/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemID }),
    });
    await load();
  }

  function exportCsv() {
    const cols = ["Item Name", ...(visibleCols.description ? ["Description"] : []), ...(visibleCols.saleRate ? ["Sale Rate"] : []), ...(visibleCols.discountPct ? ["Discount %"] : [])];
    const lines = [cols.join(",")].concat(
      filtered.map((r: ItemListRow) => [
        escapeCsv(r.itemName),
        ...(visibleCols.description ? [escapeCsv(r.description ?? "")] : []),
        ...(visibleCols.saleRate ? [r.saleRate.toFixed(2)] : []),
        ...(visibleCols.discountPct ? [r.discountPct.toFixed(2)] : []),
      ].join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeCsv(v: string) {
    if (v.includes(",") || v.includes("\n") || v.includes("\"")) {
      return '"' + v.replace(/"/g, '""') + '"';
    }
    return v;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Items
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your product and service catalog.
        </Typography>
      </Box>

      {/* Action Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search items..."
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
            onClick={openNew}
            sx={{
              bgcolor: '#444',
              color: '#fff',
              textTransform: 'none',
              borderRadius: 1,
              px: 2,
              '&:hover': { bgcolor: '#222' }
            }}
          >
            Add New Item
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportCsv}
            sx={{
              borderColor: '#ddd',
              color: '#444',
              textTransform: 'none',
              borderRadius: 1,
              px: 2,
              '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
            }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
            sx={{
              borderColor: '#ddd',
              color: '#444',
              textTransform: 'none',
              borderRadius: 1,
              '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
            }}
          />
        </Stack>
      </Stack>

      {/* Column Chooser Menu */}
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem disableRipple>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleCols.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisibleCols((v: VisibleCols) => ({ ...v, description: e.target.checked }))}
              />
            }
            label="Description"
          />
        </MenuItem>
        <MenuItem disableRipple>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleCols.saleRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisibleCols((v: VisibleCols) => ({ ...v, saleRate: e.target.checked }))}
              />
            }
            label="Sale Rate"
          />
        </MenuItem>
        <MenuItem disableRipple>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibleCols.discountPct}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisibleCols((v: VisibleCols) => ({ ...v, discountPct: e.target.checked }))}
              />
            }
            label="Discount %"
          />
        </MenuItem>
      </Menu>

      {/* Table Card */}
      <Card sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <CardContent sx={{ p: 0 }}>
          {error && (
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
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
                  <TableCell sx={{ width: 60 }}>Picture</TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      onClick={() => handleSort('itemName')}
                    >
                      Item Name
                      {sortField === 'itemName' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  {visibleCols.description && (
                    <TableCell
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        onClick={() => handleSort('description')}
                      >
                        Description
                        {sortField === 'description' && (
                          sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                  )}
                  {visibleCols.saleRate && (
                    <TableCell
                      align="right"
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}
                        onClick={() => handleSort('saleRate')}
                      >
                        Sale Rate
                        {sortField === 'saleRate' && (
                          sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                  )}
                  {visibleCols.discountPct && (
                    <TableCell
                      align="right"
                      sx={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}
                        onClick={() => handleSort('discountPct')}
                      >
                        Discount %
                        {sortField === 'discountPct' && (
                          sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell align="center" sx={{ width: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((r: ItemListRow) => (
                  <TableRow key={r.itemID} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#f0f0f0',
                          color: '#666'
                        }}
                      >
                        <ImageIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{r.itemName}</TableCell>
                    {visibleCols.description && (
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={r.description || ''}
                        >
                          {r.description || "-"}
                        </Typography>
                      </TableCell>
                    )}
                    {visibleCols.saleRate && (
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        ${r.saleRate.toFixed(2)}
                      </TableCell>
                    )}
                    {visibleCols.discountPct && (
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {r.discountPct.toFixed(2)}%
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(r)}
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(r.itemID)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && paginatedRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No items found</Typography>
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

      <ItemEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        initialData={editingRow ? { itemName: editingRow.itemName, description: editingRow.description ?? "", salesRate: editingRow.saleRate, discountPct: editingRow.discountPct } : undefined}
        isSubmitting={false}
      />
    </Container>
  );
}


