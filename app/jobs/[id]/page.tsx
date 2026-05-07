"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { redirect } from "next/navigation";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  // Redirect straight to candidates view
  redirect(`/jobs/${id}/candidates`);
}
