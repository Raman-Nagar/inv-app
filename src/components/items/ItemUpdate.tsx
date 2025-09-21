"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import { apiFetch } from "@/lib/api";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const MAX_FILE_MB = 5;
const schema = z.object({
    itemID: z.number(),
    updatedOn: z.string().nullable().optional(),
    itemName: z.string().trim().min(1, "Please enter item name.").max(50, "Max 50 characters."),
    description: z.string().trim().max(500, "Max 500 characters.").nullable().optional(),
    salesRate: z.coerce.number().min(0, "Enter a valid rate."),
    discountPct: z.coerce.number().min(0, "0–100 only.").max(100, "0–100 only."),
    file: z
        .any()
        .refine((f) => !f || f instanceof File, "Invalid file.")
        .refine((f) => !f || ["image/png", "image/jpeg"].includes((f as File).type), "Invalid file type.")
        .refine((f) => !f || (f as File).size <= MAX_FILE_MB * 1024 * 1024, "Invalid file size.")
        .optional(),
});

type FormT = z.infer<typeof schema>;

export default function ItemUpdatePage({ itemId }: { itemId: number }) {
    const [apiError, setApiError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { control, handleSubmit, reset, watch, formState: { isSubmitting, errors, isValid } } = useForm<FormT>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(schema) as any,
        mode: "onChange",
        defaultValues: { itemID: itemId, updatedOn: null, itemName: "", description: "", salesRate: 0, discountPct: 0, file: undefined },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file: any = watch("file");
    useMemo(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (file instanceof File) setPreviewUrl(URL.createObjectURL(file));
        else setPreviewUrl(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    useEffect(() => {
        async function load() {
            try {
                const m = await apiFetch<{ itemID: number; updatedOn?: string | null | undefined; itemName: string; description: string | null; salesRate: number; discountPct: number }>(`/Item/${itemId}`);
                reset({ itemID: m.itemID, updatedOn: m.updatedOn ?? null, itemName: m.itemName, description: m.description ?? "", salesRate: m.salesRate, discountPct: m.discountPct, file: undefined });
            } catch (err: unknown) {
                setApiError(err instanceof Error ? err.message : "Failed to load");
            }
        }
        if (itemId) load();
    }, [itemId, reset]);

    async function onSubmit(values: unknown) {
        setApiError(null);
        try {
            const parsed = schema.parse(values);
            const body = JSON.stringify({
                updatedOn: parsed.updatedOn ?? null,
                itemID: parsed.itemID,
                itemName: parsed.itemName,
                description: parsed.description ? parsed.description : null,
                salesRate: parsed.salesRate,
                discountPct: parsed.discountPct,
            });
            await apiFetch("/item/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body });
            if (parsed.file instanceof File) {
                const fd = new FormData();
                fd.append("ItemID", String(parsed.itemID));
                fd.append("File", parsed.file);
                await apiFetch<void>("/Item/UpdateItemPicture", { method: "POST", body: fd });
            }
            history.back();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save";
            if (message.includes("412")) setApiError("Item updated by another user, please reload.");
            else setApiError(message);
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={600}>Edit Item</Typography>
                <Stack direction="row" gap={1}>
                    <Button variant="text" onClick={() => history.back()}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting || !isValid}>{isSubmitting ? "Saving..." : "Save"}</Button>
                </Stack>
            </Stack>
            <Card>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Controller name="itemName" control={control} render={({ field }) => (
                                <TextField label="Item Name" required inputProps={{ maxLength: 50 }} fullWidth {...field} error={!!errors.itemName} helperText={errors.itemName?.message || " "} />
                            )} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller name="description" control={control} render={({ field }) => (
                                <TextField label="Description" multiline minRows={3} fullWidth inputProps={{ maxLength: 500 }} {...field} helperText={(errors.description?.message as string) || `${(field.value?.length ?? 0)}/500`} error={!!errors.description} />
                            )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <Controller name="salesRate" control={control} render={({ field }) => (
                                <TextField label="Sale Rate" type="number" inputProps={{ step: "0.01", min: 0 }} fullWidth {...field} error={!!errors.salesRate} helperText={errors.salesRate?.message || " "} />
                            )} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <Controller name="discountPct" control={control} render={({ field }) => (
                                <TextField label="Discount %" type="number" inputProps={{ step: "0.01", min: 0, max: 100 }} fullWidth {...field} error={!!errors.discountPct} helperText={errors.discountPct?.message || " "} />
                            )} />
                        </Grid>
                        {apiError && (
                            <Grid size={{ xs: 12 }}>
                                <Typography color="error" variant="body2">{apiError}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
}


