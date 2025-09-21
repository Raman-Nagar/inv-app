import { Box, Typography, Link } from "@mui/material";

export default function AppFooter() {
  return (
    <Box
      sx={{
        width: "100%",
        py: 2,
        borderTop: "1px solid #ececec",
        bgcolor: "#fff",
        minHeight: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        mt: "auto",
      }}
    >
      <Typography align="center" variant="caption" color="text.secondary">
        © 2025 InvoiceApp. All rights reserved.
      </Typography>

      <Box sx={{ pt: 1, textAlign: "center", color: "#888", fontSize: 14 }}>
        <Link href="#" underline="hover" sx={{ mx: 1, color: "#888" }}>
          Privacy Policy
        </Link>
        <Link href="#" underline="hover" sx={{ mx: 1, color: "#888" }}>
          Terms of Service
        </Link>
        <Link href="#" underline="hover" sx={{ mx: 1, color: "#888" }}>
          Support
        </Link>
      </Box>
    </Box>
  );
}
