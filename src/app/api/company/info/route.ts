import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "API base is not configured." }, { status: 500 });
    }

    const response = await fetch(`${apiBase}/company/info`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text || response.statusText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch company info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
