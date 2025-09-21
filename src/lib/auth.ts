"use server";

import { cookies } from "next/headers";

export async function setAuthToken(token: string | null) {
  const cookieStore = await cookies();
  if (!token) {
    cookieStore.delete("invoiceapp_token");
    return;
  }
  cookieStore.set("invoiceapp_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
