import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();
    // Map field names to spec (lower camel)
    const payload = new FormData();
    const map: Record<string, string> = {
      FirstName: "firstName",
      LastName: "lastName",
      Email: "email",
      Password: "password",
      CompanyName: "companyName",
      Address: "address",
      City: "city",
      ZipCode: "zip",
      Industry: "industry",
      CurrencySymbol: "currencySymbol",
    };

    for (const [key, value] of form.entries()) {
      if (key === "logo" && value instanceof File) {
        // Pass file through with same key expected upstream
        payload.append("logo", value);
        continue;
      }
      const to = map[key] ?? key;
      payload.append(to, typeof value === "string" ? value.trim() : value);
    }

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "API base is not configured." }, { status: 500 });
    }

    const upstream = await fetch(`${apiBase}/api/auth/signup`, {
      method: "POST",
      body: payload,
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
      return NextResponse.json({ error: "Invalid signup response." }, { status: 500 });
    }

    const res = NextResponse.json(data, { status: 200 });
    // Default to logged-in after signup per spec
    res.cookies.set("invoiceapp_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


