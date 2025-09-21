import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, Box, IconButton, Divider } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";

const MAX_FILE_MB = 5;

const itemSchema = z.object({
  itemName: z.string().trim().min(1, "Please enter item name.").max(50, "Max 50 characters."),
  description: z.string().trim().max(500, "Max 500 characters.").nullable().optional(),
  salesRate: z.coerce.number().min(0, "Enter a valid rate."),
  discountPct: z.coerce.number().min(0, "0–100 only.").max(100, "0–100 only."),
  file: z
    .custom<File | undefined>((f) => !f || f instanceof File, { message: "Invalid file." })
    .refine((f) => !f || ["image/png", "image/jpeg"].includes((f as File).type), "Invalid file type.")
    .refine((f) => !f || (f as File).size <= MAX_FILE_MB * 1024 * 1024, "Invalid file size.")
    .optional(),
});

type ItemForm = z.infer<typeof itemSchema>;

export default function ItemEditorDialog({ open, onClose, onSave, initialData, isSubmitting }: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ItemForm) => void;
  initialData?: Partial<ItemForm>;
  isSubmitting?: boolean;
}) {
  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<ItemForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(itemSchema) as any,
    mode: "onChange",
    defaultValues: initialData || { itemName: "", description: "", salesRate: 0, discountPct: 0, file: undefined },
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const file = watch("file");
  // Preview logic
  useEffect(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file instanceof File) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
    // eslint-disable-next-line
  }, [file]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" fontWeight={600}>{initialData ? "Edit Item" : "New Item"}</Typography>
          <IconButton
            onClick={() => history.back()} // or use router.push("/items")
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ mb: .5 }}>Item Picture</Typography>
            <Stack spacing={1} direction="row">
              <Box sx={{ width: 96, height: 96, bgcolor: "action.hover", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {previewUrl ? <Image src={previewUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} width={96} height={96} /> : <Typography color="text.secondary">Preview</Typography>}
              </Box>
              <Stack spacing={1}>
                <Controller name="file" control={control} render={({ field }) => (
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      justifyContent: "flex-start",
                      bgcolor: "#fff",
                      borderColor: "#ddd",
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        fontWeight: 400,
                        fontSize: 14,
                        color: previewUrl
                          ? "text.primary"
                          : "text.secondary",
                      }}
                    >
                      Choose Picture
                    </Box>
                    <input hidden type="file" accept="image/png,image/jpeg" onChange={(e) => field.onChange(e.target.files?.[0])} />
                  </Button>
                )} />
                <Typography variant="caption" color="text.secondary">PNG or JPG, max 5MB</Typography>
                {errors.file && <Typography variant="caption" color="error">{errors.file.message as string}</Typography>}
              </Stack>
            </Stack>
          </Box>
          <Box>
            <Stack spacing={1}>
              <Stack spacing={.5}>
                <Typography variant="body2">Item Name*</Typography>
                <Controller name="itemName" control={control} render={({ field }) => (
                  <TextField placeholder="Item Name" required inputProps={{ maxLength: 50 }} {...field} error={!!errors.itemName} helperText={typeof errors.itemName?.message === "string" ? errors.itemName.message : " "} />
                )} />
              </Stack>
              <Stack spacing={.5}>
                <Typography variant="body2">Description</Typography>
                <Controller name="description" control={control} render={({ field }) => (
                  <TextField placeholder="Description" multiline minRows={3} inputProps={{ maxLength: 500 }} {...field} helperText={typeof errors.description?.message === "string" ? errors.description.message : `${(field.value?.length ?? 0)}/500`} error={!!errors.description} />
                )} />
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <Stack spacing={.5}>
                  <Typography variant="body2">Sale Rate*</Typography>
                  <Controller name="salesRate" control={control} render={({ field }) => (
                    <TextField placeholder="Sale Rate" required type="number" inputProps={{ step: "0.01", min: 0 }} fullWidth {...field} error={!!errors.salesRate} helperText={typeof errors.salesRate?.message === "string" ? errors.salesRate.message : " "} />
                  )} />
                </Stack>
                <Stack spacing={.5}>
                  <Typography variant="body2">Discount %</Typography>
                  <Controller name="discountPct" control={control} render={({ field }) => (
                    <TextField placeholder="Discount %" type="number" inputProps={{ step: "0.01", min: 0, max: 100 }} fullWidth {...field} error={!!errors.discountPct} helperText={typeof errors.discountPct?.message === "string" ? errors.discountPct.message : " "} />
                  )} />
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "text.secondary" }} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit(onSave)} variant="contained" disabled={isSubmitting || !isValid}>{isSubmitting ? "Saving..." : "Save"}</Button>
      </DialogActions>
    </Dialog>
  );
}
