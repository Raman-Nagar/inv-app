"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
// Use local API to set cookie server-side
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  Avatar,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";

const signupSchema = z.object({
  FirstName: z.string().trim().min(1, "Please enter your first name.").max(50),
  LastName: z.string().trim().min(1, "Please enter your last name.").max(50),
  Email: z.email("Enter a valid email address.").max(100),
  Password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(20, "Password must be at most 20 characters.")
    .refine(v => /[A-Za-z]/.test(v) && /\d/.test(v), {
      message: "Password must include letters and numbers.",
    }),
  CompanyName: z.string().trim().min(1, "Please enter your company name.").max(100),
  Address: z.string().trim().min(1, "Please enter company address.").max(500),
  City: z.string().trim().min(1, "Please enter city.").max(50),
  ZipCode: z.string().trim().regex(/^\d{6}$/,{ message: "Zip must be exactly 6 digits." }),
  Industry: z.string().trim().max(50).optional(),
  CurrencySymbol: z.string().trim().min(1, "Currency symbol is required.").max(5),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength (simple)
  const password = watch("Password") || "";
  const emailValue = watch("Email") || "";
  let passwordStrength = "Weak";
  if (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  ) {
    passwordStrength = "Strong";
  } else if (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  ) {
    passwordStrength = "Medium";
  }

  async function onSubmit(data: SignupForm) {
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
      if (logoFile) fd.append("logo", logoFile);

      const res = await fetch("/api/auth/signup", { method: "POST", body: fd, cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Signup failed");
      }
      window.location.href = "/invoices";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
    }
  }

  // Debounced email exists check
  const [emailExists, setEmailExists] = useState<null | boolean>(null);
  const emailTimer = useRef<number | null>(null);
  useEffect(() => {
    setEmailExists(null);
    const val = String(emailValue || "").trim();
    if (!val) return;
    if (emailTimer.current) window.clearTimeout(emailTimer.current);
    emailTimer.current = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: val }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEmailExists(!!data.exists);
      } catch {
        setEmailExists(null);
      }
    }, 400);
    return () => { if (emailTimer.current) window.clearTimeout(emailTimer.current); };
  }, [emailValue]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafbfc" }}>
      <AppHeader />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={600} sx={{ mt: 2 }}>
            Create Your Account
          </Typography>
          <Typography color="text.secondary" align="center">
            Set up your company and start invoicing in minutes.
          </Typography>
        </Stack>
        <Card sx={{ maxWidth: 800, mx: "auto" }}>
          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              autoComplete="off"
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 4,
                  mb: 2,
                }}
              >
                {/* User Information */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 0.5 }}
                  >
                    User Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2">First Name*</Typography>
                    <TextField
                      placeholder="Enter first name"
                      {...register("FirstName")}
                      error={!!errors.FirstName}
                      helperText={errors.FirstName?.message || ' '}
                      autoComplete="given-name"
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "First Name" }}
                    />
                    <Typography variant="body2">Last Name*</Typography>
                    <TextField
                      placeholder="Enter last name"
                      {...register("LastName")}
                      error={!!errors.LastName}
                      helperText={errors.LastName?.message || ' '}
                      autoComplete="family-name"
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "Last Name" }}
                    />
                    <Typography variant="body2">Email*</Typography>
                    <TextField
                      placeholder="Enter your email"
                      type="email"
                      {...register("Email")}
                      error={!!errors.Email}
                      helperText={errors.Email?.message || (emailExists ? "Email already exists." : " ")}
                      autoComplete="email"
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "Email" }}
                    />
                    <Typography variant="body2">Password*</Typography>
                    <TextField
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      {...register("Password")}
                      error={!!errors.Password}
                      helperText={errors.Password?.message || ' '}
                      autoComplete="new-password"
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "Password" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((v) => !v)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: -1, mb: 0 }}
                    >
                      Password strength:{" "}
                      {password ? <b>{passwordStrength}</b> : "Weak"}
                    </Typography>
                  </Stack>
                </Box>
                {/* Company Information */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 0.5 }}
                  >
                    Company Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2">Company Name*</Typography>
                    <TextField
                      placeholder="Enter company name"
                      {...register("CompanyName")}
                      error={!!errors.CompanyName}
                      helperText={errors.CompanyName?.message || ' '}
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "Company Name" }}
                    />
                    <Typography variant="body2">Company Logo</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          border: "1px solid #ddd",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#fafbfc",
                        }}
                      >
                        {logoFile ? (
                          <Avatar
                            src={URL.createObjectURL(logoFile)}
                            variant="rounded"
                            sx={{ width: 44, height: 44 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Logo
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          sx={{
                            flex: 1,
                            minWidth: 0,
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
                              color: logoFile
                                ? "text.primary"
                                : "text.secondary",
                            }}
                          >
                            {logoFile ? logoFile.name : "No file chosen"}
                          </Box>
                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setLogoFile(e.target.files?.[0] || null)
                            }
                          />
                        </Button>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>Max 2-5 MB</Typography>
                    </Box>
                    <Typography variant="body2">Address*</Typography>
                    <TextField
                      placeholder="Enter company address"
                      {...register("Address")}
                      error={!!errors.Address}
                      helperText={errors.Address?.message || ' '}
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "Address" }}
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2">City*</Typography>
                        <TextField
                        placeholder="Enter city"
                        {...register("City")}
                        error={!!errors.City}
                        helperText={errors.City?.message || ' '}
                        InputLabelProps={{ shrink: false }}
                        inputProps={{ "aria-label": "City" }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2">Zip Code*</Typography>
                        <TextField
                        placeholder="6 digit zip code"
                        {...register("ZipCode")}
                        error={!!errors.ZipCode}
                        helperText={errors.ZipCode?.message || ' '}
                        InputLabelProps={{ shrink: false }}
                        inputProps={{ "aria-label": "Zip Code" }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2">Industry</Typography>
                    <TextField
                      placeholder="Industry type"
                      {...register("Industry")}
                      error={!!errors.Industry}
                      helperText={errors.Industry?.message || ' '}
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "Industry" }}
                    />
                    <Typography variant="body2">Currency Symbol*</Typography>
                    <TextField
                      placeholder="$, ₹, €, AED"
                      {...register("CurrencySymbol")}
                      error={!!errors.CurrencySymbol}
                      helperText={errors.CurrencySymbol?.message || ' '}
                      InputLabelProps={{ shrink: false }}
                      inputProps={{ "aria-label": "Currency Symbol" }}
                    />
                  </Stack>
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />
              {error && (
                <Typography
                  color="error"
                  variant="body2"
                  align="center"
                  sx={{ mb: 2 }}
                >
                  {error}
                </Typography>
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    minWidth: 140,
                    px: 5,
                    fontWeight: 500,
                    borderRadius: 1,
                    bgcolor: "#444",
                    color: "#fff",
                    boxShadow: "none",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#222" },
                  }}
                >
                  {isSubmitting ? "Signing up..." : "Sign Up"}
                </Button>
              </Box>
            </Box>
            <Typography
              align="center"
              variant="body2"
              sx={{ mt: 3, color: "#888" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                style={{ color: "#222", textDecoration: "underline" }}
              >
                Login
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
      <AppFooter />
    </Box>
  );
}
