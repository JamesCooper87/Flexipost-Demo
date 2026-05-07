"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { tierConfig, statusConfig, formatDate } from "@/lib/utils";
import { ChevronLeft, CheckCircle, XCircle, Briefcase, GraduationCap, Wrench, MapPin, Phone, Mail } from "lucide-react";
import type { CandidateStatus } from "@/lib/types";

export default function CandidateDetailPage() {
  const { id, candidateId } = useParams<{ id: string; candidateId: string }>();
  const { jobs, candidates, updateCandidateStatus } = useApp();
  const job = jobs.find(j => j.id === id);
  const candidate = candidates.find(c => c.id === candidateId);

  if (!job || !candidate) return <div className="p-8 text-[#475569]">Candidate not found.</div>;

  const tier = tierConfig[candidate.tier];
  const sConfig = statusConfig[candidate.status];

  return (
    <div>
      <div className="px-8 py-5 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/jobs/${id}/candidates`} className="p-1.5 rounded-lg text-[#475569] hover:bg-slate-100 transition-colors">
            <ChevronLeft size={18}/>
          </Link>
          <div>
            <h1 className="text-xl font-bold font-heading text-[#0F172A]">{candidate.name}</h1>
            <p className="text-sm text-[#475569] mt-0.5">Applied for {job.title} · {formatDate(candidate.appliedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${tier.bg} ${tier.text} ${tier.border} text-sm px-3 py-1`}>{tier.label}</Badge>
          <select value={candidate.status} onChange={e => updateCandidateStatus(candidate.id, e.target.value as CandidateStatus)}
            className={`text-sm font-medium px-3 py-2 rounded-xl border border-[#E2E8F0] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF3366] ${sConfig.color}`}>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-5 gap-6">
        {/* CV — main panel */}
        <div className="col-span-3 space-y-5">
          {/* Contact */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-heading text-[#0F172A]">{candidate.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#475569]">
                  <span className="flex items-center gap-1"><MapPin size={13}/> {candidate.location}</span>
                  <span className="flex items-center gap-1"><Mail size={13}/> {candidate.email}</span>
                  <span className="flex items-center gap-1"><Phone size={13}/> {candidate.phone}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-[#94A3B8]">
                  <span>Notice: <strong className="text-[#475569]">{candidate.cv.noticePeriod}</strong></span>
                  <span>·</span>
                  <span>Right to work: <strong className={candidate.cv.rightToWork ? "text-emerald-700" : "text-rose-700"}>{candidate.cv.rightToWork ? "Yes" : "Requires sponsorship"}</strong></span>
                </div>
              </div>
              <div className="shrink-0 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-base font-bold font-heading text-[#475569]">{candidate.name.split(" ").map(n=>n[0]).join("")}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-5">
            <p className="text-sm font-medium text-[#0F172A] mb-2">Professional Summary</p>
            <p className="text-sm text-[#475569] leading-relaxed">{candidate.cv.summary}</p>
          </Card>

          {/* Experience */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={15} className="text-[#FF3366]"/>
              <p className="text-sm font-semibold text-[#0F172A]">Experience</p>
            </div>
            <div className="space-y-5">
              {candidate.cv.experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-[#E2E8F0]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-[#0F172A]">{exp.title}</p>
                      <p className="text-sm text-[#475569]">{exp.company} · {exp.location}</p>
                    </div>
                    <p className="text-xs text-[#94A3B8] shrink-0 mt-0.5">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </p>
                  </div>
                  <p className="text-sm text-[#475569] mt-2 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={15} className="text-[#FF3366]"/>
              <p className="text-sm font-semibold text-[#0F172A]">Education</p>
            </div>
            <div className="space-y-3">
              {candidate.cv.education.map((edu, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A]">{edu.qualification} {edu.subject}</p>
                    <p className="text-sm text-[#475569]">{edu.institution}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#94A3B8]">{edu.startYear} – {edu.endYear}</p>
                    {edu.grade && <p className="text-xs font-medium text-[#475569]">{edu.grade}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={15} className="text-[#FF3366]"/>
              <p className="text-sm font-semibold text-[#0F172A]">Skills</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.cv.skills.map(skill => (
                <span key={skill} className="px-2.5 py-1 bg-slate-100 text-[#475569] text-xs font-medium rounded-lg">{skill}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel — score + qualifying */}
        <div className="col-span-2 space-y-5">
          {/* AI Score */}
          <Card className="p-5">
            <p className="text-sm font-semibold text-[#0F172A] mb-3">AI Score</p>
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F6F7F8" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FF3366" strokeWidth="3"
                    strokeDasharray={`${candidate.aiScore} ${100-candidate.aiScore}`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold font-heading text-[#0F172A]">{candidate.aiScore}</span>
                </div>
              </div>
              <div>
                <Badge className={`${tier.bg} ${tier.text} ${tier.border} text-sm mb-1`}>{tier.label}</Badge>
                <p className="text-xs text-[#94A3B8]">out of 100</p>
              </div>
            </div>

            {/* Criterion breakdown */}
            <div className="space-y-3">
              {candidate.criterionScores.map(cs => (
                <div key={cs.criterionId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Badge className={cs.type === "essential" ? "bg-blue-50 text-blue-700 border-blue-200 shrink-0" : "bg-slate-50 text-slate-600 border-slate-200 shrink-0"}>
                        {cs.type === "essential" ? "E" : "D"}
                      </Badge>
                      <span className="text-xs text-[#475569] truncate">{cs.criterionText}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#0F172A] ml-2 shrink-0">{cs.score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF3366] rounded-full transition-all" style={{ width: `${cs.score}%` }}/>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-tight">{cs.rationale}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Qualifying questions */}
          {job.qualifyingQuestions.length > 0 && (
            <Card className="p-5">
              <p className="text-sm font-semibold text-[#0F172A] mb-3">Qualifying Questions</p>
              <div className="flex items-center gap-2 mb-3">
                {candidate.qualified
                  ? <><CheckCircle size={15} className="text-emerald-600"/><span className="text-sm font-medium text-emerald-600">Qualified</span></>
                  : <><XCircle size={15} className="text-rose-600"/><span className="text-sm font-medium text-rose-600">Not Qualified</span></>
                }
              </div>
              <div className="space-y-3">
                {job.qualifyingQuestions.map(q => {
                  const answer = candidate.qualifyingAnswers.find(a => a.questionId === q.id);
                  const isQualifying = answer?.answer === q.qualifyingAnswer;
                  return (
                    <div key={q.id} className="border border-[#E2E8F0] rounded-xl p-3">
                      <p className="text-xs font-medium text-[#0F172A] mb-2">{q.question}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                          answer?.answer === "yes" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>{answer?.answer}</span>
                        {isQualifying
                          ? <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={11}/> Qualifying</span>
                          : <span className="text-xs text-rose-600 flex items-center gap-1"><XCircle size={11}/> Not qualifying</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
