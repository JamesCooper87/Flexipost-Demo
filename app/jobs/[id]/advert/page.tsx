"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import {
  MapPin, Briefcase, Clock, Building2, ChevronRight,
  Banknote, Wifi, LocateFixed, Blend,
} from "lucide-react";
import type { Job } from "@/lib/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

function salaryLabel(job: Job): string | null {
  if (!job.minSalary && !job.maxSalary) return null;
  const unit: Record<string, string> = {
    per_year: "/ year", per_week: "/ week", per_day: "/ day", per_hour: "/ hour",
  };
  const fmt = (n: number) => `£${n.toLocaleString("en-GB")}`;
  if (job.minSalary && job.maxSalary) {
    return `${fmt(job.minSalary)} – ${fmt(job.maxSalary)} ${unit[job.salaryType ?? "per_year"]}`;
  }
  if (job.minSalary) return `From ${fmt(job.minSalary)} ${unit[job.salaryType ?? "per_year"]}`;
  if (job.maxSalary) return `Up to ${fmt(job.maxSalary)} ${unit[job.salaryType ?? "per_year"]}`;
  return null;
}

function schemaEmploymentType(job: Job): string {
  if (job.contractType === "contract") return "CONTRACTOR";
  if (job.jobType === "full_time") return "FULL_TIME";
  if (job.jobType === "part_time") return "PART_TIME";
  return "OTHER";
}

function salaryUnitText(s: string): string {
  return ({ per_year: "YEAR", per_week: "WEEK", per_day: "DAY", per_hour: "HOUR" } as Record<string, string>)[s] ?? "YEAR";
}

function buildSchema(job: Job): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.advertCopy,
    identifier: {
      "@type": "PropertyValue",
      name: "FlexiPost",
      value: job.id,
    },
    datePosted: job.postedAt.split("T")[0],
    hiringOrganization: {
      "@type": "Organization",
      name: "FlexiPost Demo Co.",
      sameAs: "https://flexipost.co.uk",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        postalCode: job.postcode,
        addressCountry: "GB",
      },
    },
    employmentType: schemaEmploymentType(job),
    directApply: true,
  };

  if (job.endDate) schema.validThrough = job.endDate;

  if (job.minSalary || job.maxSalary) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: {
        "@type": "QuantitativeValue",
        ...(job.minSalary ? { minValue: job.minSalary } : {}),
        ...(job.maxSalary ? { maxValue: job.maxSalary } : {}),
        unitText: salaryUnitText(job.salaryType ?? "per_year"),
      },
    };
  }

  if (job.locationType === "fully_remote") {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: "United Kingdom",
    };
  }

  return schema;
}

const locationTypeLabel: Record<string, string> = {
  fixed: "On-site",
  hybrid: "Hybrid",
  fully_remote: "Remote",
};

const jobTypeLabel: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  flexible: "Flexible",
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default function JobAdvertPage() {
  const { id } = useParams<{ id: string }>();
  const { jobs } = useApp();
  const job = jobs.find(j => j.id === id);

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

  const schema = buildSchema(job);
  const salary = salaryLabel(job);
  const paragraphs = job.advertCopy.split(/\n+/).filter(Boolean);

  return (
    <>
      {/* Google Jobs structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header bar */}
        <header className="bg-[#0F172A] px-5 py-4 flex items-center justify-between">
          <span className="text-white font-bold font-heading text-lg tracking-tight">
            Flexi<span className="text-[#FF3366]">Post</span>
          </span>
          <Link
            href={`/jobs/${id}/apply`}
            className="bg-[#FF3366] hover:bg-[#E62958] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            Apply now <ChevronRight size={14}/>
          </Link>
        </header>

        <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">

          {/* Key info card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-6 py-6">
              <h1 className="text-2xl font-bold font-heading text-white leading-tight">{job.title}</h1>
              <p className="text-slate-400 mt-1 text-sm flex items-center gap-1.5">
                <Building2 size={13}/> FlexiPost Demo Co.
              </p>
            </div>

            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <Chip icon={<MapPin size={14}/>} label="Location" value={job.location}/>
              {salary && <Chip icon={<Banknote size={14}/>} label="Salary" value={salary}/>}
              <Chip
                icon={<Briefcase size={14}/>}
                label="Contract"
                value={job.contractType === "permanent" ? "Permanent" : "Contract"}
              />
              <Chip
                icon={<Clock size={14}/>}
                label="Hours"
                value={jobTypeLabel[job.jobType] ?? job.jobType}
              />
              <Chip
                icon={
                  job.locationType === "fully_remote" ? <Wifi size={14}/> :
                  job.locationType === "hybrid" ? <Blend size={14}/> :
                  <LocateFixed size={14}/>
                }
                label="Working pattern"
                value={locationTypeLabel[job.locationType] ?? job.locationType}
              />
              {job.postcode && <Chip icon={<MapPin size={14}/>} label="Postcode" value={job.postcode}/>}
            </div>
          </div>

          {/* Advert copy */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-heading text-[#0F172A]">About the role</h2>
            <div className="prose prose-sm prose-slate max-w-none">
              {paragraphs.map((p, i) => {
                // Render lines starting with "**...**" as bold headings
                if (/^\*\*[^*]+\*\*$/.test(p.trim())) {
                  return (
                    <h3 key={i} className="text-sm font-bold text-[#0F172A] mt-5 mb-2">
                      {p.replace(/\*\*/g, "")}
                    </h3>
                  );
                }
                // Render bullet lines
                if (p.trim().startsWith("- ")) {
                  return (
                    <ul key={i} className="space-y-1 mb-2 pl-4">
                      {p.split("\n").filter(l => l.trim().startsWith("- ")).map((l, j) => (
                        <li key={j} className="text-sm text-[#475569] list-disc">{l.replace(/^- /, "")}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i} className="text-sm text-[#475569] leading-relaxed">{p}</p>;
              })}
            </div>
          </div>

          {/* Apply CTA */}
          <div className="bg-[#F6F7F8] border border-[#E2E8F0] rounded-2xl p-6 text-center space-y-4">
            <p className="text-base font-semibold font-heading text-[#0F172A]">Ready to apply?</p>
            <p className="text-sm text-[#475569]">It takes less than 5 minutes. Upload your CV and answer a few short questions.</p>
            <Link
              href={`/jobs/${id}/apply`}
              className="inline-flex items-center gap-2 bg-[#FF3366] hover:bg-[#E62958] text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              Apply for this role <ChevronRight size={15}/>
            </Link>
          </div>

          <p className="text-center text-xs text-[#94A3B8] pb-6">
            Powered by <span className="font-semibold text-[#0F172A]">FlexiPost</span>
          </p>
        </div>
      </div>
    </>
  );
}

function Chip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[#FF3366] mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-[#94A3B8] leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-[#0F172A] leading-tight">{value}</p>
      </div>
    </div>
  );
}
