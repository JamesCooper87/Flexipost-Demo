"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { ChevronLeft, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function JobApplyPage() {
  const { id } = useParams<{ id: string }>();
  const { jobs } = useApp();
  const job = jobs.find(j => j.id === id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please enter your full name.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    if (!phone.trim()) errs.phone = "Please enter a phone number.";
    if (!cvFile) errs.cv = "Please upload your CV.";
    job?.qualifyingQuestions.forEach(q => {
      if (!answers[q.id]) errs[q.id] = "Please answer this question.";
    });
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-bold font-heading text-[#0F172A] mb-2">Job not found</p>
          <p className="text-[#475569]">This job may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-[#0F172A] px-5 py-4">
          <span className="text-white font-bold font-heading text-lg tracking-tight">
            Flexi<span className="text-[#FF3366]">Post</span>
          </span>
        </header>
        <div className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-emerald-600"/>
            </div>
            <h1 className="text-2xl font-bold font-heading text-[#0F172A] mb-2">Application submitted!</h1>
            <p className="text-[#475569] text-sm leading-relaxed mb-6">
              Thanks, <strong>{name}</strong>. We&apos;ve received your application for <strong>{job.title}</strong>.
              You&apos;ll hear back from us shortly.
            </p>
            <Link
              href={`/jobs/${id}/advert`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#FF3366] hover:underline"
            >
              <ChevronLeft size={14}/> Back to job advert
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      {/* Header */}
      <header className="bg-[#0F172A] px-5 py-4 flex items-center gap-3">
        <Link href={`/jobs/${id}/advert`} className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={18}/>
        </Link>
        <span className="text-white font-bold font-heading text-lg tracking-tight">
          Flexi<span className="text-[#FF3366]">Post</span>
        </span>
      </header>

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Job summary */}
        <div className="mb-6">
          <h1 className="text-xl font-bold font-heading text-[#0F172A]">Apply for {job.title}</h1>
          <p className="text-sm text-[#475569] mt-1">{job.location}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Personal details */}
          <Section title="Your details">
            <Field label="Full name" error={errors.name}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                className={inputClass(!!errors.name)}
                autoComplete="name"
              />
            </Field>

            <Field label="Email address" error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className={inputClass(!!errors.email)}
                autoComplete="email"
                inputMode="email"
              />
            </Field>

            <Field label="Phone number" error={errors.phone}>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07700 900 123"
                className={inputClass(!!errors.phone)}
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>
          </Section>

          {/* CV upload */}
          <Section title="Your CV">
            <Field label="Upload CV (PDF, Word or plain text)" error={errors.cv}>
              <label
                className={`flex items-center gap-3 w-full border-2 border-dashed rounded-xl px-4 py-5 transition-colors ${
                  cvFile
                    ? "border-emerald-400 bg-emerald-50"
                    : errors.cv
                    ? "border-rose-300 bg-rose-50"
                    : "border-[#C7CAD1] bg-white hover:border-[#FF3366] hover:bg-[rgba(255,51,102,0.03)]"
                }`}
              >
                {cvFile ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0"/>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-emerald-700 truncate">{cvFile.name}</p>
                      <p className="text-xs text-emerald-600">{(cvFile.size / 1024).toFixed(0)} KB — tap to change</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="text-[#94A3B8] shrink-0"/>
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">Tap to upload your CV</p>
                      <p className="text-xs text-[#94A3B8]">PDF, DOC, DOCX or TXT — max 5 MB</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="sr-only"
                  onChange={e => setCvFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>
          </Section>

          {/* Qualifying questions */}
          {job.qualifyingQuestions.length > 0 && (
            <Section title="Eligibility questions">
              <p className="text-xs text-[#94A3B8] -mt-1 mb-3">
                Please answer honestly — these help us match you to the role.
              </p>
              {job.qualifyingQuestions.map((q, i) => (
                <Field key={q.id} label={`${i + 1}. ${q.question}`} error={errors[q.id]}>
                  <div className="flex gap-3">
                    {(["yes", "no"] as const).map(ans => (
                      <button
                        key={ans}
                        type="button"
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: ans }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors capitalize ${
                          answers[q.id] === ans
                            ? ans === "yes"
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-rose-500 text-white border-rose-500"
                            : "bg-white text-[#475569] border-[#C7CAD1] hover:border-[#0F172A]"
                        }`}
                      >
                        {ans}
                      </button>
                    ))}
                  </div>
                </Field>
              ))}
            </Section>
          )}

          {/* Cover note */}
          <Section title="Cover note (optional)">
            <textarea
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              rows={4}
              placeholder="Tell us why you'd be a great fit for this role…"
              className="w-full border border-[#C7CAD1] rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF3366] bg-white resize-none"
            />
          </Section>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5"/>
              <p className="text-sm text-rose-700">Please fix the errors above before submitting.</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#FF3366] hover:bg-[#E62958] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={16} className="animate-spin"/> Submitting…</> : "Submit application"}
          </button>

          <p className="text-center text-xs text-[#94A3B8] pb-4">
            By applying you agree to our privacy policy. Powered by{" "}
            <span className="font-semibold text-[#0F172A]">FlexiPost</span>.
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return `w-full border rounded-xl px-4 py-3 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-rose-400 focus:ring-rose-400"
      : "border-[#C7CAD1] focus:ring-[#FF3366]"
  }`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold font-heading text-[#0F172A]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#0F172A]">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle size={11}/> {error}
        </p>
      )}
    </div>
  );
}
