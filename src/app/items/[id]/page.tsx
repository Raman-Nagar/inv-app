import React from "react";
import ItemUpdatePage from "@/components/items/ItemUpdate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Item | Update',
};

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = await params;
  const itemId = Number(id);
  return (
    <ItemUpdatePage itemId={itemId} />
  );
}


