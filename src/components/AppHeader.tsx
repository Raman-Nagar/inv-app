import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function AppHeader() {
  return (
    <Box sx={{ width: '100%', borderBottom: '1px solid #ececec', bgcolor: '#fff', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Image src="/file.svg" alt="InvoiceApp" width={24} height={24} priority />
        <Typography variant="subtitle1" fontWeight={600} sx={{ letterSpacing: 0.2 }}>InvoiceApp</Typography>
      </Box>
    </Box>
  );
}
