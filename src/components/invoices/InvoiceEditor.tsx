"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    Divider,
    Alert,
    Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiFetch } from "@/lib/api";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface Item {
    itemID: number;
    itemName: string;
    saleRate: number;
    discountPct: number;
}

interface InvoiceLine {
    rowNo: number;
    itemID: number | null;
    description: string;
    quantity: number;
    rate: number;
    discountPct: number;
    amount: number;
}

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
    lines: InvoiceLine[];
}

export default function InvoiceEditorForm({ invoiceID }: { invoiceID?: number }) {
    const router = useRouter();
    //   const searchParams = useSearchParams();
    //   const invoiceID = searchParams.get("id");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);

    const [formData, setFormData] = useState<InvoiceData>({
        invoiceID: 0,
        invoiceNo: 0,
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: "",
        address: "",
        city: "",
        notes: "",
        subTotal: 0,
        taxPercentage: 0,
        taxAmount: 0,
        invoiceAmount: 0,
        lines: [{ rowNo: 1, itemID: null, description: "", quantity: 0, rate: 0, discountPct: 0, amount: 0 }],
    });

    // Load items for dropdown
    useEffect(() => {
        async function loadItems() {
            try {
                const data = await apiFetch<Item[]>("/item/getlookuplist");
                setItems(data);
            } catch (err: unknown) {
                console.error("Failed to load items:", err);
            }
        }
        loadItems();
    }, []);

    // Load invoice data if editing
    useEffect(() => {
        if (invoiceID) {
            async function loadInvoice() {
                setLoading(true);
                try {
                    const data = await apiFetch<InvoiceData[]>(`/invoice/getlist?invoiceID=${invoiceID}`);
                    if (data && data.length > 0) {
                        setFormData(data[0]);
                    }
                } catch {
                    setError("Failed to load invoice data");
                } finally {
                    setLoading(false);
                }
            }
            loadInvoice();
        }
    }, [invoiceID]);

    // Calculate line amount
    const calculateLineAmount = (line: InvoiceLine): number => {
        const baseAmount = line.quantity * line.rate;
        const discountAmount = (baseAmount * line.discountPct) / 100;
        return Math.round((baseAmount - discountAmount) * 100) / 100;
    };

    // Calculate totals
    const calculateTotals = (lines: InvoiceLine[], taxPercentage: number) => {
        const subTotal = lines.reduce((sum, line) => sum + line.amount, 0);
        const taxAmount = Math.round((subTotal * taxPercentage / 100) * 100) / 100;
        const invoiceAmount = subTotal + taxAmount;

        return { subTotal, taxAmount, invoiceAmount };
    };

    // Update line when item is selected
    const handleItemSelect = (rowNo: number, itemID: number) => {
        const selectedItem = items.find(item => item.itemID === itemID);
        if (selectedItem) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.map(line =>
                    line.rowNo === rowNo
                        ? {
                            ...line,
                            itemID,
                            description: selectedItem.itemName,
                            rate: selectedItem.saleRate,
                            discountPct: selectedItem.discountPct,
                            amount: calculateLineAmount({ ...line, itemID, rate: selectedItem.saleRate, discountPct: selectedItem.discountPct })
                        }
                        : line
                )
            }));
        }
    };

    // Update line field
    const updateLine = (rowNo: number, field: keyof InvoiceLine, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            lines: prev.lines.map(line => {
                if (line.rowNo === rowNo) {
                    const updatedLine = { ...line, [field]: value };
                    if (field === 'quantity' || field === 'rate' || field === 'discountPct') {
                        updatedLine.amount = calculateLineAmount(updatedLine);
                    }
                    return updatedLine;
                }
                return line;
            })
        }));
    };

    // Add new line
    const addLine = () => {
        const newRowNo = Math.max(...formData.lines.map(l => l.rowNo)) + 1;
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, {
                rowNo: newRowNo,
                itemID: null,
                description: "",
                quantity: 0,
                rate: 0,
                discountPct: 0,
                amount: 0
            }]
        }));
    };

    // Delete line
    const deleteLine = (rowNo: number) => {
        if (formData.lines.length > 1) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter(line => line.rowNo !== rowNo)
            }));
        }
    };

    // Update totals when lines or tax change
    useEffect(() => {
        const { subTotal, taxAmount, invoiceAmount } = calculateTotals(formData.lines, formData.taxPercentage);
        setFormData(prev => ({ ...prev, subTotal, taxAmount, invoiceAmount }));
    }, [formData.lines, formData.taxPercentage]);

    // Handle tax percentage change
    const handleTaxPercentageChange = (value: number) => {
        const { taxAmount, invoiceAmount } = calculateTotals(formData.lines, value);
        setFormData(prev => ({ ...prev, taxPercentage: value, taxAmount, invoiceAmount }));
    };

    // Handle tax amount change
    const handleTaxAmountChange = (value: number) => {
        const taxPercentage = formData.subTotal > 0 ? Math.round((value * 100 / formData.subTotal) * 100) / 100 : 0;
        setFormData(prev => ({ ...prev, taxAmount: value, taxPercentage, invoiceAmount: prev.subTotal + value }));
    };

    // Save invoice
    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.customerName.trim()) {
                throw new Error("Customer name is required");
            }
            if (!formData.invoiceDate) {
                throw new Error("Invoice date is required");
            }
            if (formData.lines.every(line => line.quantity <= 0)) {
                throw new Error("At least one line item with quantity > 0 is required");
            }

            const payload = {
                invoiceID: formData.invoiceID,
                invoiceNo: formData.invoiceNo || null,
                invoiceDate: formData.invoiceDate,
                customerName: formData.customerName.trim(),
                address: formData.address.trim() || null,
                city: formData.city.trim() || null,
                notes: formData.notes.trim() || null,
                taxPercentage: formData.taxPercentage,
                lines: formData.lines.map(line => ({
                    rowNo: line.rowNo,
                    itemID: line.itemID,
                    description: line.description,
                    quantity: line.quantity,
                    rate: line.rate,
                    discountPct: line.discountPct,
                })),
                updatedOnPrev: null, // For new invoices
            };

            await apiFetch("/invoice/insertupdate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            router.push("/invoices");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err instanceof Error ? err.message : "Failed to save invoice";
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight={600}>
                            {invoiceID ? "Edit Invoice" : "New Invoice"}
                        </Typography>
                        <Stack direction="row" gap={2}>
                            <Button variant="outlined" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                                sx={{ bgcolor: '#444', '&:hover': { bgcolor: '#222' } }}
                            >
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </Stack>
                    </Stack>

                    {error && <Alert severity="error">{error}</Alert>}

                    {/* Header Fields */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Invoice Details</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Invoice No</Typography>
                                    <TextField
                                        placeholder="Invoice No"
                                        value={formData.invoiceNo || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceNo: parseInt(e.target.value) || 0 }))}
                                        type="number"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Invoice Date*</Typography>
                                    <DatePicker
                                        // label="Invoice Date"
                                        value={new Date(formData.invoiceDate)}
                                        onChange={(date) => setFormData(prev => ({ ...prev, invoiceDate: date?.toISOString().split('T')[0] || "" }))}
                                        slotProps={{ textField: { sx: { width: '100%' } } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Customer Name*</Typography>
                                    <TextField
                                        placeholder="Customer Name"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                        required
                                        fullWidth
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>City</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Address</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>Note</Typography>
                                    <TextField
                                        placeholder="Notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        multiline
                                        rows={2}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6">Line Items</Typography>
                                <Button startIcon={<AddIcon />} onClick={addLine} variant="outlined">
                                    Add Line
                                </Button>
                            </Stack>

                            <Box sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Item</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="right">Qty</TableCell>
                                            <TableCell align="right">Rate</TableCell>
                                            <TableCell align="right">Disc %</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.lines.map((line) => (
                                            <TableRow key={line.rowNo}>
                                                <TableCell>{line.rowNo}</TableCell>
                                                <TableCell sx={{ minWidth: 200 }}>
                                                    <FormControl fullWidth size="small">
                                                        <Select
                                                            value={line.itemID || ""}
                                                            onChange={(e) => handleItemSelect(line.rowNo, Number(e.target.value))}
                                                            displayEmpty
                                                        >
                                                            <MenuItem value="">Select Item</MenuItem>
                                                            {items.map((item) => (
                                                                <MenuItem key={item.itemID} value={item.itemID}>
                                                                    {item.itemName}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={line.description}
                                                        onChange={(e) => updateLine(line.rowNo, 'description', e.target.value)}
                                                        size="small"
                                                        fullWidth
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={line.quantity}
                                                        onChange={(e) => updateLine(line.rowNo, 'quantity', parseFloat(e.target.value) || 0)}
                                                        size="small"
                                                        inputProps={{ min: 0, step: 0.01 }}
                                                        sx={{ width: 80 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={line.rate}
                                                        onChange={(e) => updateLine(line.rowNo, 'rate', parseFloat(e.target.value) || 0)}
                                                        size="small"
                                                        inputProps={{ min: 0, step: 0.01 }}
                                                        sx={{ width: 100 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={line.discountPct}
                                                        onChange={(e) => updateLine(line.rowNo, 'discountPct', parseFloat(e.target.value) || 0)}
                                                        size="small"
                                                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                                                        sx={{ width: 80 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {line.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => deleteLine(line.rowNo)}
                                                        disabled={formData.lines.length === 1}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Totals */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>InvoiceTotals</Typography>
                            <Stack spacing={2} sx={{ maxWidth: 400, ml: 'auto' }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography>Sub Total</Typography>
                                    <Typography>{formData.subTotal.toFixed(2)}</Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography>Tax </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            label="Tax %"
                                            type="number"
                                            value={formData.taxPercentage}
                                            onChange={(e) => handleTaxPercentageChange(parseFloat(e.target.value) || 0)}
                                            size="small"
                                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                                            sx={{ width: 100 }}
                                        />
                                        <TextField
                                            label="Tax Amount"
                                            type="number"
                                            value={formData.taxAmount}
                                            onChange={(e) => handleTaxAmountChange(parseFloat(e.target.value) || 0)}
                                            size="small"
                                            inputProps={{ min: 0, step: 0.01 }}
                                            sx={{ width: 120 }}
                                        />
                                    </Box>
                                </Stack>

                                <Divider />

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="h6">Invoice Amount:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        {formData.invoiceAmount.toFixed(2)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </LocalizationProvider>
    );
}
