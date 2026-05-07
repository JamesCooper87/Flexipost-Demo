"use client";

import { useApp } from "@/lib/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function BillingPage() {
  const { invoices, jobs } = useApp();

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total ?? 0), 0);
  const totalPending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.upfrontAmount, 0);
  const liveJobCost = jobs.filter(j => j.status === "live").reduce((s, j) => s + j.runningCost, 0);

  function getStatusBadge(status: string) {
    switch(status) {
      case "paid": return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Paid</Badge>;
      case "partial": return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Pending</Badge>;
    }
  }

  return (
    <div>
      <div className="px-8 py-5 border-b border-[#E2E8F0] bg-white">
        <h1 className="text-xl font-bold font-heading text-[#0F172A]">Billing</h1>
        <p className="text-sm text-[#475569] mt-0.5">Pay-per-day · £19/day per job</p>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-5">
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.08)] text-[#10B981] flex items-center justify-center mb-4">
              <CheckCircle size={20}/>
            </div>
            <p className="text-2xl font-bold font-heading text-[#0F172A]">{formatCurrency(totalPaid)}</p>
            <p className="text-sm text-[#475569] mt-0.5">Total paid</p>
          </Card>
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,51,102,0.08)] text-[#FF3366] flex items-center justify-center mb-4">
              <TrendingUp size={20}/>
            </div>
            <p className="text-2xl font-bold font-heading text-[#0F172A]">{formatCurrency(liveJobCost)}</p>
            <p className="text-sm text-[#475569] mt-0.5">Running cost (live jobs)</p>
            <p className="text-xs text-[#94A3B8] mt-1">Updated daily</p>
          </Card>
          <Card className="p-5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.08)] text-[#F59E0B] flex items-center justify-center mb-4">
              <Clock size={20}/>
            </div>
            <p className="text-2xl font-bold font-heading text-[#0F172A]">{formatCurrency(totalPending)}</p>
            <p className="text-sm text-[#475569] mt-0.5">Upfront paid (balance on close)</p>
          </Card>
        </div>

        {/* Payment method */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <CreditCard size={18} className="text-[#475569]"/>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Visa ending 4242</p>
                <p className="text-xs text-[#94A3B8]">Expires 09/28 · Default card</p>
              </div>
            </div>
            <button className="text-sm font-medium text-[#FF3366] hover:underline">Update card</button>
          </div>
        </Card>

        {/* Invoices */}
        <div>
          <h2 className="text-base font-semibold font-heading text-[#0F172A] mb-4">Invoices</h2>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F6F7F8]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide">Posted</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide">Days</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide">Upfront</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide">On close</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-[#0F172A]">{inv.jobTitle}</td>
                    <td className="px-4 py-4 text-[#475569]">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-4 text-right text-[#475569]">{inv.daysLive}</td>
                    <td className="px-4 py-4 text-right font-medium text-[#0F172A]">{formatCurrency(inv.upfrontAmount)}</td>
                    <td className="px-4 py-4 text-right text-[#475569]">
                      {inv.finalAmount != null ? formatCurrency(inv.finalAmount) : <span className="text-[#94A3B8]">—</span>}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-[#0F172A]">
                      {inv.total != null ? formatCurrency(inv.total) : <span className="text-[#94A3B8] font-normal">Pending</span>}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(inv.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="text-xs text-[#94A3B8] mt-3 px-1">
            Upfront payment covers the first 3 days. The balance is charged automatically when the job closes or reaches its end date.
          </p>
        </div>
      </div>
    </div>
  );
}
