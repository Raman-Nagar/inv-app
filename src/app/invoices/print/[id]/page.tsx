import React from "react";
import InvoicePrintClient from "@/components/invoices/InvoicePrintClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Print',
};
export default async function InvoicePrintPage({ params }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return (
    <InvoicePrintClient invoiceID={id} />
  );
};