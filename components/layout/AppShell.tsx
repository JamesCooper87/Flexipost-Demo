"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = /\/jobs\/[^/]+\/(advert|apply)/.test(pathname);

  if (isPublic) {
    return <div className="min-h-screen bg-[#F6F7F8]">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#F6F7F8]">
        {children}
      </main>
    </div>
  );
}
