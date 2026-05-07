"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostJobButton } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useApp } from "@/lib/context";
import { formatDate, daysUntil, jobStatusConfig } from "@/lib/utils";
import {
  Square, CalendarPlus, RefreshCw, ChevronDown,
  Infinity as InfinityIcon, Eye, ClipboardList,
} from "lucide-react";

export default function JobsPage() {
  const router = useRouter();
  const { jobs, candidates, updateJobStatus, extendJob, addJob } = useApp();
  const [filter, setFilter] = useState<"all" | "live" | "closed">("all");
  const [confirmClose, setConfirmClose] = useState<string | null>(null);
  const [extendMenu, setExtendMenu] = useState<string | null>(null);
  const [repostMenu, setRepostMenu] = useState<string | null>(null);

  const filtered = jobs.filter(j => filter === "all" || j.status === filter);

  function handleClose(jobId: string) {
    updateJobStatus(jobId, "closed");
    setConfirmClose(null);
  }

  function handleExtend(jobId: string, days: number | null) {
    extendJob(jobId, days);
    setExtendMenu(null);
  }

  function handleRepostAsIs(job: typeof jobs[0]) {
    const newJob = {
      ...job,
      id: `job-${Date.now()}`,
      status: "live" as const,
      postedAt: new Date().toISOString(),
      daysLive: 0,
      applicationCount: 0,
      runningCost: 0,
    };
    addJob(newJob);
    setRepostMenu(null);
    router.push("/jobs");
  }

  function handleEditRepost(jobId: string) {
    setRepostMenu(null);
    router.push(`/jobs/new?repostFrom=${jobId}`);
  }

  return (
    <div>
      <div className="px-8 py-5 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-[#0F172A]">Jobs</h1>
          <p className="text-sm text-[#475569] mt-0.5">{jobs.length} jobs total</p>
        </div>
        <PostJobButton />
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-2">
          {(["all", "live", "closed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-[#FF3366] text-white" : "bg-white border border-[#E2E8F0] text-[#475569] hover:bg-slate-50"
              }`}>
              {f === "all" ? `All (${jobs.length})` : f === "live" ? `Live (${jobs.filter(j => j.status === "live").length})` : `Closed (${jobs.filter(j => j.status === "closed").length})`}
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="space-y-3">
          {filtered.map(job => {
            const statusCfg = jobStatusConfig[job.status];
            const daysLeft = daysUntil(job.endDate);
            const isExpiringSoon = job.status === "live" && job.endDate !== null && daysLeft <= 1;
            const isOpenEnded = job.endDate === null;
            const jobCandidates = candidates.filter(c => c.jobId === job.id);
            const newCount = jobCandidates.filter(c => c.status === "new").length;

            return (
              <Card key={job.id} className={`p-5 hover:shadow-sm transition-shadow ${isExpiringSoon ? "border-amber-300" : ""}`}>
                <div className="flex items-center gap-4">
                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link href={`/jobs/${job.id}/candidates`}
                        className="font-semibold font-heading text-[#0F172A] hover:text-[#FF3366] transition-colors text-[15px]">
                        {job.title}
                      </Link>
                      <Badge className={`${statusCfg.color} border-transparent`}>{statusCfg.label}</Badge>
                      {isExpiringSoon && <Badge className="bg-amber-100 text-amber-800 border-amber-200">Expires tomorrow</Badge>}
                    </div>

                    {/* Location + advert/apply links */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-[#475569]">{job.location}</span>
                      <Link href={`/jobs/${job.id}/advert`}
                        title="View job advert"
                        className="p-1 rounded text-[#94A3B8] hover:text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.08)] transition-colors">
                        <Eye size={13}/>
                      </Link>
                      <Link href={`/jobs/${job.id}/apply`}
                        title="Application form"
                        className="p-1 rounded text-[#94A3B8] hover:text-[#FF3366] hover:bg-[rgba(255,51,102,0.08)] transition-colors">
                        <ClipboardList size={13}/>
                      </Link>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5 shrink-0">

                    {/* Applications — clickable, shows total + new */}
                    <Link href={`/jobs/${job.id}/candidates`} className="text-center group">
                      <p className="text-[#94A3B8] text-xs mb-0.5">Applications</p>
                      <p className="font-semibold text-[#0F172A] group-hover:text-[#FF3366] transition-colors">
                        {job.applicationCount}
                        {newCount > 0 && (
                          <span className="ml-1.5 text-xs font-semibold text-white bg-[#FF3366] rounded-full px-1.5 py-0.5">
                            {newCount} new
                          </span>
                        )}
                      </p>
                    </Link>

                    {/* Days live */}
                    <div className="text-center">
                      <p className="text-[#94A3B8] text-xs mb-0.5">Days live</p>
                      <p className="font-semibold text-[#0F172A]">{job.daysLive}</p>
                    </div>

                    {/* Close date + extend / repost */}
                    <div className="text-center min-w-[110px]">
                      {job.status === "live" && (
                        <>
                          <p className="text-[#94A3B8] text-xs mb-0.5">Closes</p>
                          {isOpenEnded ? (
                            <div className="flex items-center justify-center gap-1 text-sm font-semibold text-[#475569]">
                              <InfinityIcon size={14} className="text-[#8B5CF6]"/>
                              Open-ended
                            </div>
                          ) : (
                            <p className="font-semibold text-[#0F172A] text-sm">{formatDate(job.endDate)}</p>
                          )}
                          {/* Extend button */}
                          <div className="relative mt-1.5">
                            <button
                              onClick={() => setExtendMenu(extendMenu === job.id ? null : job.id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B5CF6] hover:underline"
                            >
                              <CalendarPlus size={11}/> Extend <ChevronDown size={10}/>
                            </button>
                            {extendMenu === job.id && (
                              <div className="absolute left-0 top-6 w-40 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                                <button onClick={() => handleExtend(job.id, 3)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#0F172A] hover:bg-slate-50">
                                  +3 days
                                </button>
                                <button onClick={() => handleExtend(job.id, 7)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#0F172A] hover:bg-slate-50">
                                  +7 days
                                </button>
                                <button onClick={() => handleExtend(job.id, null)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#0F172A] hover:bg-slate-50 border-t border-[#E2E8F0]">
                                  <InfinityIcon size={13} className="text-[#8B5CF6]"/> Open-ended
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {job.status === "closed" && (
                        <>
                          <p className="text-[#94A3B8] text-xs mb-0.5">Closed</p>
                          <p className="font-semibold text-[#0F172A] text-sm">{formatDate(job.endDate)}</p>
                        </>
                      )}
                    </div>

                    {/* Close (live) */}
                    {job.status === "live" && (
                      confirmClose === job.id ? (
                        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-red-700 font-medium">Close job?</span>
                          <button onClick={() => handleClose(job.id)} className="text-xs font-semibold text-red-600 hover:text-red-800">Yes</button>
                          <button onClick={() => setConfirmClose(null)} className="text-xs text-[#94A3B8] hover:text-[#475569]">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmClose(job.id)}
                          className="inline-flex items-center gap-1.5 bg-[rgba(239,68,68,0.06)] text-red-600 hover:bg-[rgba(239,68,68,0.12)] text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          <Square size={13}/> Close
                        </button>
                      )
                    )}

                    {/* Repost (closed) — with dropdown */}
                    {job.status === "closed" && (
                      <div className="relative">
                        <button
                          onClick={() => setRepostMenu(repostMenu === job.id ? null : job.id)}
                          className="inline-flex items-center gap-1.5 bg-[rgba(99,102,241,0.06)] text-[#6366F1] hover:bg-[rgba(99,102,241,0.12)] text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <RefreshCw size={13}/> Repost <ChevronDown size={12}/>
                        </button>
                        {repostMenu === job.id && (
                          <div className="absolute right-0 top-9 w-52 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                            <button
                              onClick={() => handleRepostAsIs(job)}
                              className="flex flex-col items-start w-full px-4 py-3 hover:bg-slate-50 transition-colors border-b border-[#E2E8F0]"
                            >
                              <span className="text-sm font-semibold text-[#0F172A]">Repost as is</span>
                              <span className="text-xs text-[#94A3B8] mt-0.5">Go live immediately with the same advert</span>
                            </button>
                            <button
                              onClick={() => handleEditRepost(job.id)}
                              className="flex flex-col items-start w-full px-4 py-3 hover:bg-slate-50 transition-colors"
                            >
                              <span className="text-sm font-semibold text-[#0F172A]">Edit &amp; repost</span>
                              <span className="text-xs text-[#94A3B8] mt-0.5">Update salary, title or advert first</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Click outside to close menus */}
      {extendMenu  && <div className="fixed inset-0 z-10" onClick={() => setExtendMenu(null)}/>}
      {repostMenu  && <div className="fixed inset-0 z-10" onClick={() => setRepostMenu(null)}/>}
      {confirmClose && <div className="fixed inset-0 z-10" onClick={() => setConfirmClose(null)}/>}
    </div>
  );
}
