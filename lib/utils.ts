import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CandidateTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));
}

export function daysUntil(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const end = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export const tierConfig: Record<CandidateTier, { label: string; bg: string; text: string; border: string }> = {
  6: { label: "Excellent",  bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
  5: { label: "Strong",     bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  4: { label: "Good",       bg: "bg-sky-50",      text: "text-sky-700",     border: "border-sky-200"     },
  3: { label: "Possible",   bg: "bg-amber-50",    text: "text-amber-800",   border: "border-amber-200"   },
  2: { label: "Unlikely",   bg: "bg-orange-50",   text: "text-orange-800",  border: "border-orange-200"  },
  1: { label: "Decline",    bg: "bg-rose-50",     text: "text-rose-700",    border: "border-rose-200"    },
};

export const statusConfig: Record<string, { label: string; color: string }> = {
  new:         { label: "New",         color: "bg-blue-100 text-blue-800" },
  reviewing:   { label: "Reviewing",   color: "bg-purple-100 text-purple-800" },
  shortlisted: { label: "Shortlisted", color: "bg-emerald-100 text-emerald-800" },
  rejected:    { label: "Rejected",    color: "bg-red-100 text-red-700" },
};

export const jobStatusConfig: Record<string, { label: string; color: string }> = {
  live:   { label: "Live",   color: "bg-emerald-100 text-emerald-800" },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-600" },
  draft:  { label: "Draft",  color: "bg-amber-100 text-amber-800" },
};
