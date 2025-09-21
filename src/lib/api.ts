"use server";
import { cookies } from "next/headers";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: BodyInit | null;
}

/**
 * Server-side: fetch token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const token = (await cookies()).get("invoiceapp_token")?.value;
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Shared API fetch wrapper
 * Automatically attaches cookie session if available
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${process.env.API_BASE_URL}${path}`;
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body || null,
    cache: "no-store",
    credentials: "include", // ✅ send cookies in cross-origin calls
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

/**
 * Optional: company info type
 */
export interface CompanyInfo {
  companyID: number;
  companyName?: string;
  currencySymbol?: string;
}
