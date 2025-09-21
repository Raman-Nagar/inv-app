import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").trim();
    const password = (body.password ?? "").trim();
    const rememberMe: boolean = !!body.rememberMe;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "API base is not configured." }, { status: 500 });
    }

    const upstream = await fetch(`${apiBase}/account/login/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
      cache: "no-store",
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      let errObj: unknown;
      try { errObj = JSON.parse(text); } catch { errObj = { error: text || upstream.statusText }; }
      return NextResponse.json(errObj, { status: upstream.status });
    }

    const data = JSON.parse(text) as { token: string } & Record<string, unknown>;
    const token = data.token;
    if (!token) {
      return NextResponse.json({ error: "Invalid auth response." }, { status: 500 });
    }

    const res = NextResponse.json(data, { status: 200 });
    const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 8; // 7d vs 8h
    res.cookies.set("invoiceapp_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


