import { cookies } from "next/headers";
import InvoicesClient from "@/components/invoices/InvoicesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'List',
};
interface InvoiceRow {
  invoiceID: number;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
}

interface Metrics { invoiceCount: number; totalAmount: number; }
interface TopItem { itemID: number; itemName: string; amountSum: number; }
interface TrendPoint { monthStart: string; invoiceCount: number; amountSum: number; }

async function fetchWithAuth<T>(path: string): Promise<T> {
  const token = (await cookies()).get("invoiceapp_token")?.value;
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json();
}

export default async function InvoicesPage() {
  try {
    const [list, metrics, topItems, trend] = await Promise.all([
      fetchWithAuth<InvoiceRow[]>("/invoice/getlist"),
      fetchWithAuth<Metrics>("/invoice/getmetrics"),
      fetchWithAuth<TopItem[]>("/invoice/topitems"),
      fetchWithAuth<TrendPoint[]>("/invoice/gettrend12m"),
    ]);

    return <InvoicesClient rows={list} metrics={metrics || null} top={topItems} trend={trend} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load invoices";
    return <p style={{ color: "red" }}>{message}</p>;
  }
}
