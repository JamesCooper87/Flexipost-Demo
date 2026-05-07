"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { Card } from "@/components/ui/Card";
import type { Job, ContractType, JobType, LocationType, SalaryType } from "@/lib/types";
import {
  Sparkles, Plus, Trash2, CheckCircle2, ChevronLeft, ChevronRight,
  Loader2, Infinity as InfinityIcon, AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const STEPS = ["Input", "Job Details", "Qualifying Questions", "Collection", "Duration & Payment"];

const ADVERT_MAX = 5500;

const DUMMY_AI_RESPONSE = {
  title: "Senior Product Designer",
  contractType: "permanent" as ContractType,
  jobType: "full_time" as JobType,
  locationType: "hybrid" as LocationType,
  postcode: "",
  minSalary: 65000,
  maxSalary: 80000,
  salaryType: "per_year" as SalaryType,
  advertCopy: `We're looking for a Senior Product Designer to join our design team and help shape the future of our product. You'll be working closely with product managers, engineers, and stakeholders to deliver exceptional user experiences.

This is a hands-on role — you'll own design end-to-end from discovery through to detailed UI and design systems work.

**What you'll do:**
- Lead design on key product features from concept to delivery
- Conduct user research and usability testing
- Maintain and evolve our design system
- Work closely with engineers to ensure high-quality implementation

**What we offer:**
- £65,000–£80,000 depending on experience
- Hybrid working — 2 days in our central London office
- 28 days holiday + bank holidays
- Private healthcare, pension`,
  location: "London, UK",
  essential: [
    "5+ years of product design experience in a digital product environment",
    "Strong Figma skills including component libraries and design systems",
    "Proven experience conducting user research and usability testing",
    "Portfolio demonstrating end-to-end product design work",
  ],
  desirable: [
    "Experience in a B2B SaaS environment",
    "Familiarity with front-end development (HTML/CSS)",
    "Experience with motion design and interaction prototyping",
  ],
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function RadioGroup<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              value === o.value
                ? "bg-[#FF3366] text-white border-[#FF3366]"
                : "bg-white text-[#475569] border-[#C7CAD1] hover:border-[#FF3366] hover:text-[#FF3366]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  label, value, onChange, placeholder, type = "text", hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
      {hint && <p className="text-xs text-[#94A3B8] mb-1.5">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#C7CAD1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366] focus:border-transparent"
      />
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PostJobPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#475569]">Loading…</div>}>
      <PostJobPageInner />
    </Suspense>
  );
}

function PostJobPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { jobs, addJob } = useApp();

  // Pre-fill from a repost if ?repostFrom=job-xxx is set
  const repostFromId = searchParams.get("repostFrom");
  const repostJob = repostFromId ? jobs.find(j => j.id === repostFromId) ?? null : null;

  const [step, setStep] = useState(() => repostJob ? 1 : 0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(() => !!repostJob);

  // Step 0 — Input
  const [jdInput, setJdInput] = useState("");

  // Step 1 — Job Details (all AI-populatable)
  const [title, setTitle] = useState(() => repostJob?.title ?? "");
  const [contractType, setContractType] = useState<ContractType>(() => repostJob?.contractType ?? "permanent");
  const [jobType, setJobType] = useState<JobType>(() => repostJob?.jobType ?? "full_time");
  const [locationType, setLocationType] = useState<LocationType>(() => repostJob?.locationType ?? "fixed");
  const [postcode, setPostcode] = useState(() => repostJob?.postcode ?? "");
  const [location, setLocation] = useState(() => repostJob?.location ?? "");
  const [minSalary, setMinSalary] = useState(() => repostJob?.minSalary ? String(repostJob.minSalary) : "");
  const [maxSalary, setMaxSalary] = useState(() => repostJob?.maxSalary ? String(repostJob.maxSalary) : "");
  const [salaryType, setSalaryType] = useState<SalaryType>(() => repostJob?.salaryType ?? "per_year");
  const [hasSalary, setHasSalary] = useState(() => !!(repostJob?.minSalary || repostJob?.maxSalary));
  const [advertCopy, setAdvertCopy] = useState(() => repostJob?.advertCopy ?? "");
  const [essential, setEssential] = useState<string[]>(() =>
    repostJob?.essentialCriteria.map(c => c.text) ?? [""]
  );
  const [desirable, setDesirable] = useState<string[]>(() =>
    repostJob?.desirableCriteria.map(c => c.text) ?? [""]
  );

  // Step 2 — Qualifying Questions (yes is always the qualifying answer)
  const [questions, setQuestions] = useState<{ question: string }[]>(() =>
    repostJob?.qualifyingQuestions.map(q => ({ question: q.question })) ?? []
  );

  // Step 3 — Collection
  const [collectionMethod, setCollectionMethod] = useState<"collect_cvs" | "redirect_url">("collect_cvs");
  const [redirectUrl, setRedirectUrl] = useState("");

  // Step 4 — Duration & Payment
  const [openEnded, setOpenEnded] = useState(false);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  const DAY_RATE = 19;
  const today = new Date();
  const end = new Date(endDate);
  const days = Math.max(3, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const upfront = DAY_RATE * 3;

  const advertChars = advertCopy.length;
  const advertOver = advertChars > ADVERT_MAX;

  function simulateAI() {
    setAiLoading(true);
    setAiDone(false);
    setTimeout(() => {
      const r = DUMMY_AI_RESPONSE;
      setTitle(r.title);
      setContractType(r.contractType);
      setJobType(r.jobType);
      setLocationType(r.locationType);
      setPostcode(r.postcode);
      setLocation(r.location);
      setMinSalary(String(r.minSalary));
      setMaxSalary(String(r.maxSalary));
      setSalaryType(r.salaryType);
      setHasSalary(true);
      setAdvertCopy(r.advertCopy);
      setEssential(r.essential);
      setDesirable(r.desirable);
      setAiLoading(false);
      setAiDone(true);
    }, 1800);
  }

  function handleSubmit() {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      contractType,
      jobType,
      locationType,
      postcode,
      ...(hasSalary && minSalary ? { minSalary: Number(minSalary) } : {}),
      ...(hasSalary && maxSalary ? { maxSalary: Number(maxSalary) } : {}),
      ...(hasSalary ? { salaryType } : {}),
      location,
      advertCopy,
      essentialCriteria: essential.filter(Boolean).map((text, i) => ({ id: `ec-${i}`, text, type: "essential" })),
      desirableCriteria: desirable.filter(Boolean).map((text, i) => ({ id: `dc-${i}`, text, type: "desirable" })),
      qualifyingQuestions: questions.filter(q => q.question).map((q, i) => ({
        id: `qq-${i}`, question: q.question, qualifyingAnswer: "yes",
      })),
      collectionMethod,
      redirectUrl: collectionMethod === "redirect_url" ? redirectUrl : undefined,
      status: "live",
      postedAt: new Date().toISOString(),
      endDate: openEnded ? null : new Date(endDate).toISOString(),
      daysLive: 0,
      dayRate: DAY_RATE,
      applicationCount: 0,
      runningCost: 0,
    };
    addJob(newJob);
    router.push("/jobs");
  }

  const canContinue0 = title.trim().length > 0 && (aiDone || jdInput.trim().length > 0);
  const canContinue1 = title.trim().length > 0 && advertCopy.trim().length > 0 && !advertOver;

  return (
    <div>
      <div className="px-8 py-5 border-b border-[#E2E8F0] bg-white flex items-center gap-4">
        <Link href="/jobs" className="p-1.5 rounded-lg text-[#475569] hover:bg-slate-100 transition-colors">
          <ChevronLeft size={18}/>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-heading text-[#0F172A]">
            {repostJob ? "Edit & Repost" : "Post a Job"}
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            {repostJob
              ? `Editing repost of "${repostJob.title}" — update any details then go live`
              : "AI-assisted — paste your advert and we'll do the rest"}
          </p>
        </div>
      </div>

      <div className="px-8 py-8 max-w-3xl">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === step ? "text-[#0F172A]" : i < step ? "text-[#10B981]" : "text-[#94A3B8]"
              }`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-heading ${
                  i < step ? "bg-[#10B981] text-white" : i === step ? "bg-[#6366F1] text-white" : "bg-slate-100 text-[#94A3B8]"
                }`}>
                  {i < step ? <CheckCircle2 size={14}/> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px w-6 ${i < step ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}/>
              )}
            </div>
          ))}
        </div>

        {/* ─── Step 0 — Input ──────────────────────────────────────────────── */}
        {step === 0 && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold font-heading text-[#0F172A]">Paste your job description</h2>
              <p className="text-sm text-[#475569] mt-1">
                Our AI will extract details and draft your advert. The more you give it, the better the output.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Job title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full border border-[#C7CAD1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Job description / existing advert</label>
              <textarea
                value={jdInput}
                onChange={e => setJdInput(e.target.value)}
                rows={8}
                placeholder="Paste your job description here…"
                className="w-full border border-[#C7CAD1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366] focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={simulateAI}
              disabled={!jdInput.trim() || aiLoading}
              className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {aiLoading
                ? <><Loader2 size={16} className="animate-spin"/> Analysing…</>
                : <><Sparkles size={16}/> Generate with AI</>
              }
            </button>
            {aiDone && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#10B981] bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle2 size={15}/> AI has extracted job details — review them on the next step.
              </div>
            )}
          </Card>
        )}

        {/* ─── Step 1 — Job Details ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <Card className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold font-heading text-[#0F172A]">Job details</h2>
                <p className="text-sm text-[#475569] mt-1">
                  AI has pre-filled what it found. Check every field and fill in anything left blank.
                </p>
              </div>

              <FieldInput label="Job title" value={title} onChange={setTitle} placeholder="e.g. Senior Software Engineer"/>

              <RadioGroup<ContractType>
                label="Contract type"
                value={contractType}
                onChange={setContractType}
                options={[
                  { value: "permanent", label: "Permanent" },
                  { value: "contract", label: "Contract" },
                ]}
              />

              <RadioGroup<JobType>
                label="Job type"
                value={jobType}
                onChange={setJobType}
                options={[
                  { value: "full_time",  label: "Full Time" },
                  { value: "part_time",  label: "Part Time" },
                  { value: "flexible",   label: "Flexible" },
                ]}
              />

              <RadioGroup<LocationType>
                label="Location type"
                value={locationType}
                onChange={setLocationType}
                options={[
                  { value: "fixed",         label: "Fixed / On-site" },
                  { value: "hybrid",        label: "Hybrid" },
                  { value: "fully_remote",  label: "Fully Remote" },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <FieldInput
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="e.g. London, UK"
                />
                <FieldInput
                  label="Postcode"
                  value={postcode}
                  onChange={setPostcode}
                  placeholder="e.g. EC1A 1BB"
                  hint="Used for distance filtering"
                />
              </div>
            </Card>

            {/* Salary */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">Salary</h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Optional — leave blank to advertise as &quot;competitive&quot;</p>
                </div>
                <button
                  onClick={() => { setHasSalary(h => !h); }}
                  className={`relative w-10 h-6 rounded-full transition-colors ${hasSalary ? "bg-[#FF3366]" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasSalary ? "left-5" : "left-1"}`}/>
                </button>
              </div>

              {hasSalary && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Min salary</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">£</span>
                        <input
                          type="number"
                          value={minSalary}
                          onChange={e => setMinSalary(e.target.value)}
                          placeholder="40000"
                          className="w-full border border-[#C7CAD1] rounded-xl pl-7 pr-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Max salary</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">£</span>
                        <input
                          type="number"
                          value={maxSalary}
                          onChange={e => setMaxSalary(e.target.value)}
                          placeholder="60000"
                          className="w-full border border-[#C7CAD1] rounded-xl pl-7 pr-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                        />
                      </div>
                    </div>
                  </div>
                  <RadioGroup<SalaryType>
                    label="Paid"
                    value={salaryType}
                    onChange={setSalaryType}
                    options={[
                      { value: "per_year",  label: "Per year" },
                      { value: "per_week",  label: "Per week" },
                      { value: "per_day",   label: "Per day" },
                      { value: "per_hour",  label: "Per hour" },
                    ]}
                  />
                </>
              )}
            </Card>

            {/* Advert copy */}
            <Card className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">Job advert</h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">This is what candidates will see. Max {ADVERT_MAX.toLocaleString()} characters.</p>
                </div>
                <span className={`text-xs font-medium tabular-nums shrink-0 mt-0.5 ${
                  advertOver ? "text-rose-600" : advertChars > ADVERT_MAX * 0.9 ? "text-amber-600" : "text-[#94A3B8]"
                }`}>
                  {advertChars.toLocaleString()} / {ADVERT_MAX.toLocaleString()}
                </span>
              </div>
              <textarea
                value={advertCopy}
                onChange={e => setAdvertCopy(e.target.value)}
                rows={10}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 resize-none ${
                  advertOver
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-[#C7CAD1] focus:ring-[#FF3366]"
                }`}
              />
              {advertOver && (
                <p className="text-xs text-rose-600">
                  {(advertChars - ADVERT_MAX).toLocaleString()} characters over the limit — please shorten your advert.
                </p>
              )}
            </Card>

            {/* Criteria */}
            <Card className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#0F172A]">Scoring criteria</h3>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Essential criteria</label>
                {essential.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={c}
                      onChange={e => { const a = [...essential]; a[i] = e.target.value; setEssential(a); }}
                      className="flex-1 border border-[#C7CAD1] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                    />
                    <button onClick={() => setEssential(essential.filter((_, j) => j !== i))} className="p-2 text-[#94A3B8] hover:text-rose-500">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
                {essential.length < 8 && (
                  <button onClick={() => setEssential([...essential, ""])} className="text-sm text-[#FF3366] font-medium flex items-center gap-1 mt-1">
                    <Plus size={14}/> Add essential criterion
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Desirable criteria</label>
                {desirable.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={c}
                      onChange={e => { const a = [...desirable]; a[i] = e.target.value; setDesirable(a); }}
                      className="flex-1 border border-[#C7CAD1] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                    />
                    <button onClick={() => setDesirable(desirable.filter((_, j) => j !== i))} className="p-2 text-[#94A3B8] hover:text-rose-500">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
                {desirable.length < 8 && (
                  <button onClick={() => setDesirable([...desirable, ""])} className="text-sm text-[#FF3366] font-medium flex items-center gap-1 mt-1">
                    <Plus size={14}/> Add desirable criterion
                  </button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ─── Step 2 — Qualifying Questions ──────────────────────────────── */}
        {step === 2 && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold font-heading text-[#0F172A]">Qualifying Questions</h2>
              <p className="text-sm text-[#475569] mt-1">
                Add up to 5 yes/no questions. <strong>Yes</strong> is always the qualifying answer — candidates who answer
                No will be marked as <span className="text-rose-600 font-medium">Not Qualified</span>.
              </p>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1.5">
                      Question {i + 1}
                    </label>
                    <input
                      value={q.question}
                      onChange={e => { const a = [...questions]; a[i] = { question: e.target.value }; setQuestions(a); }}
                      placeholder="e.g. Do you have the right to work in the UK?"
                      className="w-full border border-[#C7CAD1] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                    />
                  </div>
                  <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))} className="p-1.5 text-[#94A3B8] hover:text-rose-500 mt-6">
                    <Trash2 size={14}/>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#475569] pl-0.5">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0"/>
                  Qualifying answer: <span className="font-semibold text-emerald-700">Yes</span>
                </div>
              </div>
            ))}

            {questions.length < 5 && (
              <button
                onClick={() => setQuestions([...questions, { question: "" }])}
                className="flex items-center gap-2 text-sm text-[#FF3366] font-semibold border border-dashed border-[#FF3366] rounded-xl px-4 py-3 w-full hover:bg-[rgba(255,51,102,0.04)] transition-colors"
              >
                <Plus size={14}/> Add qualifying question
              </button>
            )}

            {questions.length === 0 && (
              <p className="text-sm text-[#94A3B8] italic">
                No questions added — all applicants will be marked as Qualified automatically.
              </p>
            )}
          </Card>
        )}

        {/* ─── Step 3 — Collection ─────────────────────────────────────────── */}
        {step === 3 && (
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold font-heading text-[#0F172A]">Application Collection</h2>
              <p className="text-sm text-[#475569] mt-1">How would you like to receive applications?</p>
            </div>
            {[
              { value: "collect_cvs",  label: "Collect CVs in FlexiPost",   desc: "Applications and CVs are stored in your FlexiPost account." },
              { value: "redirect_url", label: "Redirect to external URL",    desc: "Candidates are sent to a URL of your choice — no CV storage in FlexiPost." },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setCollectionMethod(opt.value as typeof collectionMethod)}
                className={`w-full text-left border rounded-xl p-4 transition-colors ${
                  collectionMethod === opt.value
                    ? "border-[#FF3366] bg-[rgba(255,51,102,0.04)]"
                    : "border-[#E2E8F0] hover:border-[#C7CAD1]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                    collectionMethod === opt.value ? "border-[#FF3366]" : "border-[#C7CAD1]"
                  }`}>
                    {collectionMethod === opt.value && <div className="w-2.5 h-2.5 bg-[#FF3366] rounded-full"/>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{opt.label}</p>
                    <p className="text-sm text-[#475569] mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              </button>
            ))}
            {collectionMethod === "redirect_url" && (
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Redirect URL</label>
                <input
                  value={redirectUrl}
                  onChange={e => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com/careers/apply"
                  className="w-full border border-[#C7CAD1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                />
              </div>
            )}
          </Card>
        )}

        {/* ─── Step 4 — Duration & Payment ─────────────────────────────────── */}
        {step === 4 && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold font-heading text-[#0F172A]">Duration & Payment</h2>
              <p className="text-sm text-[#475569] mt-1">
                Day rate: <strong>£{DAY_RATE}/day</strong>. Choose a fixed end date or post open-ended and close manually.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: false, label: "Fixed end date",  desc: "Job closes automatically on your chosen date." },
                { value: true,  label: "Open-ended",      desc: "No end date — runs until you close it manually.", icon: true },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setOpenEnded(opt.value)}
                  className={`text-left border rounded-xl p-4 transition-colors ${
                    openEnded === opt.value
                      ? "border-[#FF3366] bg-[rgba(255,51,102,0.04)]"
                      : "border-[#E2E8F0] hover:border-[#C7CAD1]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      openEnded === opt.value ? "border-[#FF3366]" : "border-[#C7CAD1]"
                    }`}>
                      {openEnded === opt.value && <div className="w-2.5 h-2.5 bg-[#FF3366] rounded-full"/>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                        {opt.label}
                        {opt.icon && <InfinityIcon size={14} className="text-[#8B5CF6]"/>}
                      </p>
                      <p className="text-xs text-[#475569] mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {!openEnded && (
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]}
                  className="border border-[#C7CAD1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                />
              </div>
            )}

            <div className="bg-[#F6F7F8] border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-sm">
              {!openEnded && (
                <div className="flex justify-between">
                  <span className="text-[#475569]">Duration</span>
                  <span className="font-semibold text-[#0F172A]">{days} days</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#475569]">Day rate</span>
                <span className="font-semibold text-[#0F172A]">£{DAY_RATE}/day</span>
              </div>
              <div className="border-t border-[#E2E8F0] pt-2 flex justify-between">
                <span className="text-[#475569]">Charged today (first 3 days)</span>
                <span className="font-semibold text-[#0F172A]">£{upfront}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Charged on close</span>
                <span className="font-semibold text-[#0F172A]">
                  {openEnded ? "Days used beyond 3 × £19" : `£${(DAY_RATE * days) - upfront}`}
                </span>
              </div>
              {!openEnded && (
                <div className="border-t border-[#E2E8F0] pt-2 flex justify-between font-semibold text-[#0F172A]">
                  <span>Estimated total</span>
                  <span>£{DAY_RATE * days}</span>
                </div>
              )}
            </div>

            {/* Important notice */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5"/>
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-semibold">You cannot make changes to the advert once it is live.</p>
                <p className="text-amber-700">You can stop the job at any point and repost with edits, but you will be charged for the first 3 days (£{upfront}) on each posting.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[rgba(255,51,102,0.04)] border border-[rgba(255,51,102,0.2)] rounded-xl p-4">
              <span className="text-base shrink-0">💳</span>
              <p className="text-xs text-[#475569]">Card details would be entered here in production. £{upfront} is charged today. The balance is charged when the job closes.</p>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#475569] hover:text-[#0F172A] disabled:opacity-30 transition-colors px-4 py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50"
          >
            <ChevronLeft size={16}/> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={(step === 0 && !canContinue0) || (step === 1 && !canContinue1)}
              className="inline-flex items-center gap-2 bg-[#FF3366] hover:bg-[#E62958] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Continue <ChevronRight size={16}/>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 bg-[#FF3366] hover:bg-[#E62958] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              <CheckCircle2 size={16}/> Post Job & Pay £{upfront}
              {openEnded && <span className="opacity-80 font-normal text-xs ml-0.5">(open-ended)</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
