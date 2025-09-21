"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
// Local API route handles cookie setting server-side
import {
  Box, Button, Card, CardContent, Checkbox, Container,
  Stack, TextField, Typography
} from "@mui/material";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from "next/link";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(data: LoginForm) {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Login failed");
      }
      window.location.href = "/invoices";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 104px)' }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={600} sx={{ mt: 2 }}>Welcome Back</Typography>
          <Typography color="text.secondary">Log in to your account.</Typography>
        </Stack>
        <Card sx={{ width: 420, border: '1px solid #ececec', boxShadow: 'none', borderRadius: 2 }}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <Stack spacing={2}>
                {/* Email */}
                <Typography variant="body2">Email Address*</Typography>
                <TextField
                  placeholder="Enter your email"
                  type="email"
                  required
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message || ' '}
                  variant="outlined"
                  InputLabelProps={{ shrink: false }}
                  inputProps={{ style: { fontSize: 16, background: '#fff' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      background: '#fff',
                      fontSize: 16,
                      '& fieldset': { borderColor: '#e0e0e0' },
                      '&:hover fieldset': { borderColor: '#bdbdbd' },
                      '&.Mui-focused fieldset': { borderColor: '#bdbdbd' },
                    },
                  }}
                  {...register("email")}
                />
                {/* Password */}
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>Password*</Typography>
                <TextField
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  required
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message || ' '}
                  variant="outlined"
                  InputLabelProps={{ shrink: false }}
                  inputProps={{ style: { fontSize: 16, background: '#fff' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      background: '#fff',
                      fontSize: 16,
                      '& fieldset': { borderColor: '#e0e0e0' },
                      '&:hover fieldset': { borderColor: '#bdbdbd' },
                      '&.Mui-focused fieldset': { borderColor: '#bdbdbd' },
                    },
                  }}
                  {...register("password")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5, mt: 0.5, mb: -1 }}>
                  <Checkbox {...register("rememberMe")} sx={{ p: 0.5, mr: 1 }} />
                  <Typography variant="body2" sx={{ color: '#444', fontSize: 15 }}>Remember me</Typography>
                </Box>
                {error && <Typography color="error" variant="body2">{error}</Typography>}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      minWidth: 120,
                      px: 5,
                      fontWeight: 500,
                      borderRadius: 1,
                      bgcolor: '#444',
                      color: '#fff',
                      boxShadow: 'none',
                      textTransform: 'none',
                      height: 44,
                      fontSize: 17,
                      '&:hover': { bgcolor: '#222' },
                    }}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  
              <Link
                href="/signup"
                style={{ color: "#222", textDecoration: "underline" }}
              >
                  {/* <Link href="/" underline="hover" sx={{ color: '#444', fontSize: 15 }}> */}
                    Create account
                  </Link>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
      <AppFooter />
    </Box>
  );
}
