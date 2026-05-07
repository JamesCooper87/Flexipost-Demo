export type JobStatus = "live" | "closed" | "draft";
export type CandidateStatus = "new" | "reviewing" | "shortlisted" | "rejected";
export type CandidateTier = 1 | 2 | 3 | 4 | 5 | 6;
export type NotificationPreference = "realtime" | "daily";
export type CollectionMethod = "collect_cvs" | "redirect_url";
export type CandidateSource = "totaljobs" | "reed" | "cvlibrary";
export type ContractType = "permanent" | "contract";
export type JobType = "full_time" | "part_time" | "flexible";
export type LocationType = "fixed" | "hybrid" | "fully_remote";
export type SalaryType = "per_year" | "per_week" | "per_day" | "per_hour";

export interface Criterion {
  id: string;
  text: string;
  type: "essential" | "desirable";
}

export interface QualifyingQuestion {
  id: string;
  question: string;
  qualifyingAnswer: "yes" | "no";
}

export interface WorkExperience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

export interface Education {
  institution: string;
  qualification: string;
  subject: string;
  startYear: number;
  endYear: number;
  grade?: string;
}

export interface CV {
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  rightToWork: boolean;
  noticePeriod: string;
}

export interface CriterionScore {
  criterionId: string;
  criterionText: string;
  type: "essential" | "desirable";
  score: number;
  rationale: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  appliedAt: string;
  source: CandidateSource;
  qualified: boolean;
  qualifyingAnswers: { questionId: string; answer: "yes" | "no" }[];
  aiScore: number;
  tier: CandidateTier;
  criterionScores: CriterionScore[];
  status: CandidateStatus;
  cv: CV;
}

export interface Job {
  id: string;
  title: string;
  contractType: ContractType;
  jobType: JobType;
  locationType: LocationType;
  postcode: string;
  minSalary?: number;
  maxSalary?: number;
  salaryType?: SalaryType;
  location: string;
  advertCopy: string;
  essentialCriteria: Criterion[];
  desirableCriteria: Criterion[];
  qualifyingQuestions: QualifyingQuestion[];
  collectionMethod: CollectionMethod;
  redirectUrl?: string;
  status: JobStatus;
  postedAt: string;
  endDate: string | null;
  daysLive: number;
  dayRate: number;
  applicationCount: number;
  runningCost: number;
  teamMemberId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  canPostJobs: boolean;
  jobAccess: "all" | string[];
  role: "owner" | "member";
  joinedAt: string;
}

export interface Invoice {
  id: string;
  jobId: string;
  jobTitle: string;
  daysLive: number;
  dayRate: number;
  upfrontAmount: number;
  finalAmount: number | null;
  total: number | null;
  status: "paid" | "partial" | "pending";
  createdAt: string;
  closedAt: string | null;
}
