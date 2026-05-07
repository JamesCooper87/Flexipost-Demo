"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { tierConfig, statusConfig, formatDate } from "@/lib/utils";
import {
  ChevronLeft, Filter, CheckCircle, XCircle, ChevronRight, Edit3,
  ChevronUp, ChevronDown, MapPin, Mail, Phone, X, FileText,
  Briefcase, GraduationCap, Wrench, Plus, Trash2,
} from "lucide-react";
import type { Candidate, Criterion, CandidateSource } from "@/lib/types";

type SlideType = "qualified" | "score" | "cv";
type SlideOut = { type: SlideType; candidate: Candidate } | null;

export default function CandidatesPage() {
  const { id } = useParams<{ id: string }>();
  const { jobs, candidates, updateCandidateStatus, updateJobCriteria } = useApp();
  const job = jobs.find(j => j.id === id);
  const jobCandidates = candidates.filter(c => c.jobId === id);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [qualFilter, setQualFilter] = useState<string>("all");
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [sortCol, setSortCol] = useState<"name" | "appliedAt" | "aiScore" | "status" | "qualified">("aiScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [slideOut, setSlideOut] = useState<SlideOut>(null);

  function handleSort(col: "name" | "appliedAt" | "aiScore" | "status" | "qualified") {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir(col === "name" ? "asc" : "desc");
    }
  }

  function openSlide(type: SlideType, candidate: Candidate) {
    setSlideOut(prev => (prev?.type === type && prev.candidate.id === candidate.id) ? null : { type, candidate });
  }

  if (!job) return <div className="p-8 text-[#475569]">Job not found.</div>;

  const filtered = jobCandidates
    .filter(c => statusFilter === "all" || c.status === statusFilter)
    .filter(c => qualFilter === "all" || (qualFilter === "qualified" ? c.qualified : !c.qualified))
    .sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case "name":      cmp = a.name.localeCompare(b.name); break;
        case "appliedAt": cmp = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime(); break;
        case "aiScore":   cmp = a.aiScore - b.aiScore; break;
        case "status":    cmp = a.status.localeCompare(b.status); break;
        case "qualified": cmp = Number(a.qualified) - Number(b.qualified); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const statusCounts = { new: 0, reviewing: 0, shortlisted: 0, rejected: 0 };
  jobCandidates.forEach(c => statusCounts[c.status]++);

  return (
    <div className="flex h-full">
      {/* Main content — stays full width; drawer overlays on top */}
      <div className="flex-1 min-w-0">
        <div className="px-8 py-5 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/jobs" className="p-1.5 rounded-lg text-[#475569] hover:bg-slate-100 transition-colors">
              <ChevronLeft size={18}/>
            </Link>
            <div>
              <h1 className="text-xl font-bold font-heading text-[#0F172A]">{job.title}</h1>
              <p className="text-sm text-[#475569] mt-0.5">{job.location} · {jobCandidates.length} candidates</p>
            </div>
          </div>
          <button onClick={() => setCriteriaOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8B5CF6] border border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.06)] px-3 py-2 rounded-xl transition-colors">
            <Edit3 size={14}/> Edit Criteria
          </button>
        </div>

        {/* Stage summary */}
        <div className="px-8 pt-6 grid grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([s, count]) => {
            const cfg = statusConfig[s];
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={`p-4 rounded-xl border text-left transition-colors ${statusFilter === s ? "border-[#FF3366] bg-[rgba(255,51,102,0.04)]" : "bg-white border-[#E2E8F0] hover:shadow-sm"}`}>
                <p className="text-2xl font-bold font-heading text-[#0F172A]">{count}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${cfg.color}`}>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-8 py-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-[#475569]">
              <Filter size={14}/>
              <span className="font-medium">Filter:</span>
            </div>
            {(["all","qualified","not_qualified"] as const).map(f => (
              <button key={f} onClick={() => setQualFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  qualFilter === f ? "bg-[#FF3366] text-white" : "bg-white border border-[#E2E8F0] text-[#475569] hover:bg-slate-50"
                }`}>
                {f === "all" ? "All" : f === "qualified" ? "Qualified" : "Not Qualified"}
              </button>
            ))}
            {statusFilter !== "all" && (
              <button onClick={() => setStatusFilter("all")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-[#475569] hover:bg-slate-200 transition-colors">
                Clear status filter ×
              </button>
            )}
          </div>

          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F6F7F8]">
                    <SortTh label="Candidate" col="name"      active={sortCol} dir={sortDir} onSort={handleSort} className="px-5 py-3"/>
                    <SortTh label="Applied"   col="appliedAt" active={sortCol} dir={sortDir} onSort={handleSort} className="px-4 py-3"/>
                    <SortTh label="Qualified" col="qualified" active={sortCol} dir={sortDir} onSort={handleSort} className="px-4 py-3"/>
                    <SortTh label="AI Score"  col="aiScore"   active={sortCol} dir={sortDir} onSort={handleSort} className="px-4 py-3"/>
                    <th className="px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide text-left">CV</th>
                    <SortTh label="Status"    col="status"    active={sortCol} dir={sortDir} onSort={handleSort} className="px-4 py-3"/>
                    <th className="px-4 py-3 text-xs font-semibold text-[#475569] uppercase tracking-wide text-left">Source</th>
                    <th className="px-4 py-3"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.map(c => {
                    const sConfig = statusConfig[c.status];
                    const isActive = slideOut?.candidate.id === c.id;
                    return (
                      <tr key={c.id} className={`transition-colors group ${isActive ? "bg-[rgba(255,51,102,0.03)]" : "hover:bg-slate-50"}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-[#475569]">{c.name.split(" ").map(n=>n[0]).join("")}</span>
                            </div>
                            <div>
                              <Link href={`/jobs/${id}/candidates/${c.id}`} className="font-medium text-[#0F172A] hover:text-[#FF3366] transition-colors">
                                {c.name}
                              </Link>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                <span className="flex items-center gap-1 text-xs text-[#94A3B8]"><MapPin size={10}/>{c.location}</span>
                                <span className="flex items-center gap-1 text-xs text-[#94A3B8]"><Mail size={10}/>{c.email}</span>
                                <span className="flex items-center gap-1 text-xs text-[#94A3B8]"><Phone size={10}/>{c.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#475569]">{formatDate(c.appliedAt)}</td>

                        {/* Qualified — clickable */}
                        <td className="px-4 py-4">
                          <button onClick={() => openSlide("qualified", c)}
                            className={`flex items-center gap-1 font-medium transition-colors rounded-lg px-2 py-1 -ml-2 ${
                              isActive && slideOut?.type === "qualified"
                                ? "bg-[rgba(255,51,102,0.08)] text-[#FF3366]"
                                : c.qualified
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-rose-600 hover:bg-rose-50"
                            }`}>
                            {c.qualified ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                            <span className="text-xs">{c.qualified ? "Qualified" : "Not Qualified"}</span>
                          </button>
                        </td>

                        {/* AI Score — clickable */}
                        <td className="px-4 py-4">
                          <button onClick={() => openSlide("score", c)}
                            className={`flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 transition-colors ${
                              isActive && slideOut?.type === "score"
                                ? "bg-[rgba(255,51,102,0.08)]"
                                : "hover:bg-slate-100"
                            }`}>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF3366] rounded-full" style={{ width: `${c.aiScore}%` }}/>
                            </div>
                            <span className="font-semibold text-[#0F172A] text-xs">{c.aiScore}</span>
                          </button>
                        </td>

                        {/* CV icon — clickable (moved here, was Tier) */}
                        <td className="px-4 py-4">
                          <button onClick={() => openSlide("cv", c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive && slideOut?.type === "cv"
                                ? "bg-[rgba(255,51,102,0.10)] text-[#FF3366]"
                                : "text-[#94A3B8] hover:text-[#FF3366] hover:bg-[rgba(255,51,102,0.06)]"
                            }`}>
                            <FileText size={15}/>
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <select value={c.status}
                            onChange={e => updateCandidateStatus(c.id, e.target.value as any)}
                            className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#FF3366] ${sConfig.color}`}>
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="px-4 py-4 text-[#475569]">
                          {SOURCE_LABELS[c.source]}
                        </td>

                        <td className="px-4 py-4">
                          <Link href={`/jobs/${id}/candidates/${c.id}`}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#94A3B8] hover:text-[#FF3366] hover:bg-[rgba(255,51,102,0.06)] transition-all inline-flex">
                            <ChevronRight size={16}/>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#94A3B8]">No candidates match the current filters.</div>
            )}
          </Card>
        </div>

        {/* Edit Criteria modal */}
        {criteriaOpen && (
          <CriteriaModal
            job={job}
            onSave={(essential, desirable) => {
              updateJobCriteria(job.id, essential, desirable);
              setCriteriaOpen(false);
            }}
            onClose={() => setCriteriaOpen(false)}
          />
        )}
      </div>

      {/* Slide-out drawer — overlays on top of the page without moving the background */}
      {slideOut && (
        <>
          {/* Backdrop — click to close */}
          <div
            className="fixed inset-0 bg-black/20 z-30 transition-opacity"
            onClick={() => setSlideOut(null)}
          />
          {/* Drawer panel */}
          <div className="fixed top-0 right-0 h-full w-[60vw] bg-white border-l border-[#E2E8F0] shadow-2xl z-40 flex flex-col">
            <Drawer slideOut={slideOut} job={job} onClose={() => setSlideOut(null)} />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Drawer ────────────────────────────────────────────────────────────────────

function Drawer({ slideOut, job, onClose }: {
  slideOut: NonNullable<SlideOut>;
  job: ReturnType<typeof Array.prototype.find>;
  onClose: () => void;
}) {
  const { candidate, type } = slideOut;
  const tier = tierConfig[candidate.tier];

  const titles: Record<SlideType, string> = {
    qualified: "Qualifying Questions",
    score:     "AI Score Breakdown",
    cv:        "CV Preview",
  };

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">{candidate.name}</p>
          <h3 className="text-sm font-semibold font-heading text-[#0F172A] mt-0.5">{titles[type]}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#475569] hover:bg-slate-100 transition-colors">
          <X size={16}/>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* ── Qualified ─────────────────────────────── */}
        {type === "qualified" && (
          <>
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm ${
              candidate.qualified
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {candidate.qualified ? <CheckCircle size={16}/> : <XCircle size={16}/>}
              {candidate.qualified ? "This candidate is Qualified" : "This candidate is Not Qualified"}
            </div>

            {job.qualifyingQuestions.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No qualifying questions were set for this job. All candidates are automatically marked as Qualified.</p>
            ) : (
              <div className="space-y-3">
                {job.qualifyingQuestions.map((q: any) => {
                  const answer = candidate.qualifyingAnswers.find((a: any) => a.questionId === q.id);
                  const isQualifying = answer?.answer === q.qualifyingAnswer;
                  return (
                    <div key={q.id} className={`border rounded-xl p-4 ${isQualifying ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}>
                      <p className="text-sm font-medium text-[#0F172A] mb-3">{q.question}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#475569]">Answer:</span>
                          <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-md ${
                            answer?.answer === "yes" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          }`}>{answer?.answer ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          {isQualifying
                            ? <><CheckCircle size={12} className="text-emerald-600"/><span className="text-emerald-700 font-medium">Qualifying answer</span></>
                            : <><XCircle size={12} className="text-rose-600"/><span className="text-rose-700 font-medium">Not qualifying (expected: {q.qualifyingAnswer})</span></>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── AI Score ──────────────────────────────── */}
        {type === "score" && (
          <>
            {/* Score + tier */}
            <div className="flex items-center gap-5 p-4 bg-[#F6F7F8] rounded-xl border border-[#E2E8F0]">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FF3366" strokeWidth="3"
                    strokeDasharray={`${candidate.aiScore} ${100 - candidate.aiScore}`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold font-heading text-[#0F172A]">{candidate.aiScore}</span>
                </div>
              </div>
              <div>
                <Badge className={`${tier.bg} ${tier.text} ${tier.border} text-sm mb-1`}>{tier.label}</Badge>
                <p className="text-xs text-[#94A3B8]">Scored against {candidate.criterionScores.length} criteria</p>
              </div>
            </div>

            {/* Per-criterion breakdown */}
            <div className="space-y-4">
              {candidate.criterionScores.map(cs => (
                <div key={cs.criterionId}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Badge className={`shrink-0 mt-0.5 ${cs.type === "essential" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {cs.type === "essential" ? "E" : "D"}
                      </Badge>
                      <span className="text-xs font-medium text-[#0F172A] leading-tight">{cs.criterionText}</span>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ml-1 ${cs.score >= 80 ? "text-emerald-600" : cs.score >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                      {cs.score}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div className={`h-full rounded-full transition-all ${cs.score >= 80 ? "bg-emerald-500" : cs.score >= 60 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${cs.score}%` }}/>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-snug">{cs.rationale}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CV ────────────────────────────────────── */}
        {type === "cv" && (
          <>
            {/* Summary */}
            <div>
              <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide mb-2">Summary</p>
              <p className="text-sm text-[#475569] leading-relaxed">{candidate.cv.summary}</p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-2.5 py-1 bg-slate-100 text-[#475569] rounded-lg">
                Notice: <strong className="text-[#0F172A]">{candidate.cv.noticePeriod}</strong>
              </span>
              <span className={`px-2.5 py-1 rounded-lg ${candidate.cv.rightToWork ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {candidate.cv.rightToWork ? "✓ Right to work" : "Requires sponsorship"}
              </span>
            </div>

            {/* Experience */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Briefcase size={13} className="text-[#FF3366]"/>
                <p className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">Experience</p>
              </div>
              <div className="space-y-4">
                {candidate.cv.experience.map((exp, i) => (
                  <div key={i} className="pl-3 border-l-2 border-[#E2E8F0]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{exp.title}</p>
                        <p className="text-xs text-[#475569]">{exp.company} · {exp.location}</p>
                      </div>
                      <p className="text-xs text-[#94A3B8] shrink-0 mt-0.5 text-right">
                        {exp.startDate}<br/>– {exp.current ? "Present" : exp.endDate}
                      </p>
                    </div>
                    <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <GraduationCap size={13} className="text-[#FF3366]"/>
                <p className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">Education</p>
              </div>
              <div className="space-y-2.5">
                {candidate.cv.education.map((edu, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{edu.qualification} {edu.subject}</p>
                      <p className="text-xs text-[#475569]">{edu.institution}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[#94A3B8]">{edu.startYear}–{edu.endYear}</p>
                      {edu.grade && <p className="text-xs font-medium text-[#475569]">{edu.grade}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Wrench size={13} className="text-[#FF3366]"/>
                <p className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">Skills</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.cv.skills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-100 text-[#475569] text-xs rounded-md">{skill}</span>
                ))}
              </div>
            </div>

            <Link href={`/jobs/${candidate.jobId}/candidates/${candidate.id}`}
              className="flex items-center justify-center gap-2 w-full border border-[#E2E8F0] text-[#475569] hover:border-[#FF3366] hover:text-[#FF3366] text-sm font-medium py-2.5 rounded-xl transition-colors">
              Full profile <ChevronRight size={14}/>
            </Link>
          </>
        )}
      </div>
    </>
  );
}

// ─── Source helpers ────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<CandidateSource, string> = {
  totaljobs: "Totaljobs",
  reed:      "Reed",
  cvlibrary: "CV-Library",
};

// ─── CriteriaModal ─────────────────────────────────────────────────────────────

function CriteriaModal({
  job,
  onSave,
  onClose,
}: {
  job: NonNullable<ReturnType<typeof Array.prototype.find>>;
  onSave: (essential: Criterion[], desirable: Criterion[]) => void;
  onClose: () => void;
}) {
  const [essential, setEssential] = useState<Criterion[]>(
    job.essentialCriteria.map((c: Criterion) => ({ ...c }))
  );
  const [desirable, setDesirable] = useState<Criterion[]>(
    job.desirableCriteria.map((c: Criterion) => ({ ...c }))
  );

  function updateText(list: Criterion[], setList: (v: Criterion[]) => void, id: string, text: string) {
    setList(list.map(c => c.id === id ? { ...c, text } : c));
  }

  function remove(list: Criterion[], setList: (v: Criterion[]) => void, id: string) {
    setList(list.filter(c => c.id !== id));
  }

  function addRow(type: "essential" | "desirable", list: Criterion[], setList: (v: Criterion[]) => void) {
    setList([...list, { id: `${type}-${Date.now()}`, text: "", type }]);
  }

  const hasChanges =
    JSON.stringify(essential) !== JSON.stringify(job.essentialCriteria) ||
    JSON.stringify(desirable)  !== JSON.stringify(job.desirableCriteria);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold font-heading text-[#0F172A]">Edit Scoring Criteria</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Changes will trigger a re-score of all candidates.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#475569] hover:bg-slate-100 transition-colors">
            <X size={16}/>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {/* Essential */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Essential criteria</span>
              <button
                onClick={() => addRow("essential", essential, setEssential)}
                className="text-xs font-medium text-[#FF3366] flex items-center gap-1 hover:underline"
              >
                <Plus size={12}/> Add
              </button>
            </div>
            <div className="space-y-2">
              {essential.map(c => (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="shrink-0 w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center border border-blue-200">E</span>
                  <input
                    value={c.text}
                    onChange={e => updateText(essential, setEssential, c.id, e.target.value)}
                    placeholder="Enter criterion…"
                    className="flex-1 border border-[#C7CAD1] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                  />
                  <button onClick={() => remove(essential, setEssential, c.id)} className="p-1.5 text-[#94A3B8] hover:text-rose-500 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
              {essential.length === 0 && (
                <p className="text-sm text-[#94A3B8] italic">No essential criteria — candidates won&apos;t be scored.</p>
              )}
            </div>
          </div>

          {/* Desirable */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Desirable criteria</span>
              <button
                onClick={() => addRow("desirable", desirable, setDesirable)}
                className="text-xs font-medium text-[#FF3366] flex items-center gap-1 hover:underline"
              >
                <Plus size={12}/> Add
              </button>
            </div>
            <div className="space-y-2">
              {desirable.map(c => (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="shrink-0 w-6 h-6 rounded-md bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center border border-slate-200">D</span>
                  <input
                    value={c.text}
                    onChange={e => updateText(desirable, setDesirable, c.id, e.target.value)}
                    placeholder="Enter criterion…"
                    className="flex-1 border border-[#C7CAD1] rounded-xl px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                  />
                  <button onClick={() => remove(desirable, setDesirable, c.id)} className="p-1.5 text-[#94A3B8] hover:text-rose-500 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
              {desirable.length === 0 && (
                <p className="text-sm text-[#94A3B8] italic">No desirable criteria added.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(essential.filter(c => c.text.trim()), desirable.filter(c => c.text.trim()))}
            disabled={!hasChanges}
            className="px-5 py-2 text-sm font-semibold bg-[#FF3366] text-white rounded-xl hover:bg-[#E62958] disabled:opacity-40 transition-colors"
          >
            Save & Re-score All
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SortTh ────────────────────────────────────────────────────────────────────

type SortCol = "name" | "appliedAt" | "aiScore" | "status" | "qualified";

function SortTh({ label, col, active, dir, onSort, className }: {
  label: string; col: SortCol; active: SortCol; dir: "asc"|"desc";
  onSort: (col: SortCol) => void; className?: string;
}) {
  const isActive = active === col;
  return (
    <th className={className}>
      <button onClick={() => onSort(col)}
        className="flex items-center gap-1 text-xs font-semibold text-[#475569] uppercase tracking-wide hover:text-[#0F172A] transition-colors group">
        {label}
        <span className={`flex flex-col transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
          <ChevronUp size={10} className={isActive && dir === "asc" ? "text-[#FF3366]" : ""}/>
          <ChevronDown size={10} className={isActive && dir === "desc" ? "text-[#FF3366]" : ""} style={{ marginTop: -3 }}/>
        </span>
      </button>
    </th>
  );
}
