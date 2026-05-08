"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Users, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard",  href: "/",        icon: LayoutDashboard },
  { label: "Jobs",        href: "/jobs",    icon: Briefcase },
  { label: "Team",        href: "/team",    icon: Users },
  { label: "Billing",     href: "/billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0">
      {/* Account branding */}
      <div className="px-4 py-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          {/* Account logo — placeholder initials */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold font-heading">AC</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0F172A] font-heading leading-tight truncate">Acme Recruitment</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-none">
              powered by{" "}
              <span className="text-[#FF3366] font-semibold">flexipost.ai</span>
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-[rgba(255,51,102,0.10)] text-[#FF3366]"
                : "text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]"
            )}
          >
            <Icon size={17} strokeWidth={1.8} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4 border-t border-[#E2E8F0] pt-3">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#475569] hover:bg-slate-50 w-full transition-colors">
          <Settings size={17} strokeWidth={1.8} />
          Settings
        </button>
      </div>
    </aside>
  );
}
