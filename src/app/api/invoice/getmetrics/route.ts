import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "API base is not configured." }, { status: 500 });
    }

    const url = `${apiBase}/invoice/getmetrics${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
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
    const message = err instanceof Error ? err.message : "Failed to fetch metrics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
