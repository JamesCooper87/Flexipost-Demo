"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { JOBS, CANDIDATES, TEAM_MEMBERS, INVOICES } from "./data";
import type { Job, Candidate, TeamMember, Invoice, CandidateStatus } from "./types";

interface AppContextType {
  jobs: Job[];
  candidates: Candidate[];
  teamMembers: TeamMember[];
  invoices: Invoice[];
  addJob: (job: Job) => void;
  updateJobStatus: (jobId: string, status: Job["status"]) => void;
  extendJob: (jobId: string, days: number | null) => void;
  updateCandidateStatus: (candidateId: string, status: CandidateStatus) => void;
  updateJobCriteria: (jobId: string, essential: Job["essentialCriteria"], desirable: Job["desirableCriteria"]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES);
  const [teamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [invoices] = useState<Invoice[]>(INVOICES);

  function addJob(job: Job) {
    setJobs(prev => [job, ...prev]);
  }

  function updateJobStatus(jobId: string, status: Job["status"]) {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  }

  function extendJob(jobId: string, days: number | null) {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      if (days === null) return { ...j, endDate: null };
      const base = j.endDate ? new Date(j.endDate) : new Date();
      base.setDate(base.getDate() + days);
      return { ...j, endDate: base.toISOString() };
    }));
  }

  function updateCandidateStatus(candidateId: string, status: CandidateStatus) {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status } : c));
  }

  function updateJobCriteria(
    jobId: string,
    essential: Job["essentialCriteria"],
    desirable: Job["desirableCriteria"],
  ) {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, essentialCriteria: essential, desirableCriteria: desirable } : j));
  }

  return (
    <AppContext.Provider value={{ jobs, candidates, teamMembers, invoices, addJob, updateJobStatus, extendJob, updateCandidateStatus, updateJobCriteria }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
