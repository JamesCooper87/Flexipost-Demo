"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold font-heading text-[#0F172A]">{title}</h1>
        {subtitle && <p className="text-sm text-[#475569] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-[#475569] hover:bg-slate-50 transition-colors">
          <Bell size={18} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3366] rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
            <span className="text-white text-xs font-semibold font-heading">JH</span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-[#0F172A]">James Hartley</p>
          </div>
          <span className="ml-1 text-[10px] font-semibold text-[#FF3366] border border-[#FF3366] rounded px-1.5 py-0.5">CLIENT</span>
        </div>
      </div>
    </header>
  );
}

export function PostJobButton() {
  return (
    <Link
      href="/jobs/new"
      className="inline-flex items-center gap-2 bg-[#FF3366] hover:bg-[#E62958] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
    >
      <Plus size={16} strokeWidth={2.5} />
      Post a Job
    </Link>
  );
}
