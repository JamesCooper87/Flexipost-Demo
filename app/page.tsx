"use client";

import Link from "next/link";
import { PostJobButton } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useApp } from "@/lib/context";
import { formatDate, tierConfig } from "@/lib/utils";
import { Briefcase, Users, Clock, ArrowRight, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const { jobs, candidates } = useApp();

  const liveJobs = jobs.filter(j => j.status === "live");
  const totalApplications = jobs.reduce((s, j) => s + j.applicationCount, 0);
  const newCandidates = candidates.filter(c => c.status === "new").length;

  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 6);

  return (
    <div>
      {/* Page header */}
      <div className="px-8 py-5 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold font-heading text-[#0F172A] leading-tight">
            Good morning, <em className="not-italic text-[#FF3366]">James.</em>
          </h1>
          <p className="text-sm text-[#475569] mt-1">Here&apos;s what&apos;s happening across your jobs today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-3">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
              <span className="text-white text-xs font-semibold font-heading">JH</span>
            </div>
            <p className="text-sm font-medium text-[#0F172A]">James Hartley</p>
            <span className="text-[10px] font-semibold text-[#FF3366] border border-[#FF3366] rounded px-1.5 py-0.5">CLIENT</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard icon={<Briefcase size={20}/>} iconBg="bg-[rgba(255,51,102,0.08)]" iconColor="text-[#FF3366]"
            label="Live Jobs" value={liveJobs.length} sub="of 3 total"
            linkHref="/jobs" linkLabel="Manage jobs" linkColor="text-[#8B5CF6]" />
          <StatCard icon={<Users size={20}/>} iconBg="bg-[rgba(139,92,246,0.08)]" iconColor="text-[#8B5CF6]"
            label="Total Applications" value={totalApplications} sub={`${newCandidates} new`}
            linkHref="/jobs" linkLabel="View all" linkColor="text-[#8B5CF6]" />
          <StatCard icon={<Clock size={20}/>} iconBg="bg-[rgba(245,158,11,0.08)]" iconColor="text-[#F59E0B]"
            label="Avg. Days Live" value={Math.round(liveJobs.reduce((s,j)=>s+j.daysLive,0)/Math.max(liveJobs.length,1))}
            sub="per live job" />
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* Live jobs */}
          <div className="col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold font-heading text-[#0F172A]">Live Jobs</h2>
              <div className="flex items-center gap-3">
                <Link href="/jobs" className="text-sm text-[#8B5CF6] font-semibold hover:underline flex items-center gap-1">All jobs <ChevronRight size={14}/></Link>
                <PostJobButton />
              </div>
            </div>
            <div className="space-y-3">
              {liveJobs.map(job => (
                <Card key={job.id} className="p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/jobs/${job.id}/candidates`} className="font-semibold font-heading text-[#0F172A] hover:text-[#FF3366] transition-colors">
                          {job.title}
                        </Link>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0">Live</Badge>
                      </div>
                      <p className="text-sm text-[#475569]">{job.location}</p>
                    </div>
                    <Link href={`/jobs/${job.id}/candidates`} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#FF3366] transition-colors">
                      <ArrowRight size={16}/>
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    {[
                      { label: "Applications", val: job.applicationCount },
                      { label: "Days live",    val: job.daysLive },
                      { label: "Closes",       val: formatDate(job.endDate) },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-[#94A3B8] text-xs mb-0.5">{label}</p>
                        <p className="font-semibold text-[#0F172A]">{val}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent applications */}
          <div className="col-span-2 space-y-4">
            <h2 className="text-base font-semibold font-heading text-[#0F172A]">Recent Applications</h2>
            <Card className="divide-y divide-[#E2E8F0]">
              {recentCandidates.map(c => {
                const job = jobs.find(j => j.id === c.jobId);
                const tier = tierConfig[c.tier];
                return (
                  <Link key={c.id} href={`/jobs/${c.jobId}/candidates/${c.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-[#475569]">
                        {c.name.split(" ").map(n=>n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{c.name}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{job?.title}</p>
                    </div>
                    <Badge className={`${tier.bg} ${tier.text} ${tier.border} shrink-0`}>{tier.label}</Badge>
                  </Link>
                );
              })}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, iconColor, label, value, sub, linkHref, linkLabel, linkColor }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string|number;
  sub?: string; linkHref?: string; linkLabel?: string; linkColor?: string;
}) {
  return (
    <Card className="p-5">
      <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-2xl font-bold font-heading text-[#0F172A]">{value}</p>
      <p className="text-sm text-[#475569] mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[#94A3B8] mt-1">{sub}</p>}
      {linkHref && linkLabel && (
        <Link href={linkHref} className={`text-xs font-semibold mt-3 inline-flex items-center gap-1 ${linkColor} hover:underline`}>
          {linkLabel} <ChevronRight size={12}/>
        </Link>
      )}
    </Card>
  );
}
