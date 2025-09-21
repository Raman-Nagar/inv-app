"use client";
import React from 'react'
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const MuiThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const theme = createTheme({
        palette: {
          mode: "light",
        },
        shape: { borderRadius: 8 },
      });
  return (
    <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
  )
}

export default MuiThemeProvider