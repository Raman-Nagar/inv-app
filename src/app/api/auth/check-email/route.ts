import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) return NextResponse.json({ error: "API base is not configured." }, { status: 500 });

    // Proxy to backend helper; adapt to your backend path
    const upstream = await fetch(`${apiBase}/account/signup/checkEmailExists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      let errObj: unknown;
      try { errObj = JSON.parse(text); } catch { errObj = { error: text || upstream.statusText }; }
      return NextResponse.json(errObj, { status: upstream.status });
    }
    const data = JSON.parse(text) as { exists: boolean };
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


