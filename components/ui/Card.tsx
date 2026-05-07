import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-white border border-[#E2E8F0] rounded-2xl", className)}>
      {children}
    </div>
  );
}
