import React from "react";
import InvoiceEditorForm from "@/components/invoices/InvoiceEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Editor',
};

export default async function InvoiceEditorPage({ searchParams }: { searchParams: Promise<{ id: number }> }) {
  const { id } = await searchParams;
  return (
    <InvoiceEditorForm invoiceID={id} />
  );
}
