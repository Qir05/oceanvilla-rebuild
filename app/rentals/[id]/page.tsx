// app/rentals/[id]/page.tsx
import { redirect } from "next/navigation";

export default async function RentalIdAlias({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const p = await Promise.resolve(params);
  redirect(`/listing/${encodeURIComponent(p.id)}`);
}
