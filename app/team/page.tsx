"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { UserPlus, Crown, User, Check, X, Briefcase } from "lucide-react";

export default function TeamPage() {
  const { teamMembers, jobs } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div>
      <div className="px-8 py-5 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-[#0F172A]">Team</h1>
          <p className="text-sm text-[#475569] mt-0.5">{teamMembers.length} members</p>
        </div>
        <button onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 bg-[#FF3366] hover:bg-[#E62958] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <UserPlus size={15}/> Invite team member
        </button>
      </div>

      <div className="px-8 py-8 space-y-6">
        <div className="space-y-3">
          {teamMembers.map(member => {
            const assignedJobs = member.jobAccess === "all"
              ? jobs
              : jobs.filter(j => Array.isArray(member.jobAccess) && member.jobAccess.includes(j.id));

            return (
              <Card key={member.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-[#475569] font-heading">
                        {member.name.split(" ").map(n=>n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#0F172A]">{member.name}</p>
                        {member.role === "owner"
                          ? <Badge className="bg-[rgba(255,51,102,0.08)] text-[#FF3366] border-[rgba(255,51,102,0.2)] flex items-center gap-1">
                              <Crown size={10}/> Owner
                            </Badge>
                          : <Badge className="bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1">
                              <User size={10}/> Member
                            </Badge>
                        }
                      </div>
                      <p className="text-sm text-[#94A3B8]">{member.email}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Joined {formatDate(member.joinedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-8 text-sm">
                    {/* Can post */}
                    <div>
                      <p className="text-xs font-medium text-[#475569] mb-1">Can post jobs</p>
                      {member.canPostJobs
                        ? <span className="flex items-center gap-1 text-emerald-600 font-medium"><Check size={14}/> Yes</span>
                        : <span className="flex items-center gap-1 text-[#94A3B8]"><X size={14}/> No</span>
                      }
                    </div>

                    {/* Job access */}
                    <div className="min-w-[180px]">
                      <p className="text-xs font-medium text-[#475569] mb-1.5">Job access</p>
                      {member.jobAccess === "all" ? (
                        <p className="text-sm text-[#0F172A] font-medium">All jobs</p>
                      ) : (
                        <div className="space-y-1">
                          {assignedJobs.map(j => (
                            <div key={j.id} className="flex items-center gap-1.5 text-xs text-[#475569]">
                              <Briefcase size={11} className="text-[#94A3B8]"/>
                              <span className="truncate max-w-[160px]">{j.title}</span>
                            </div>
                          ))}
                          {assignedJobs.length === 0 && <p className="text-xs text-[#94A3B8]">No jobs assigned</p>}
                        </div>
                      )}
                    </div>

                    {member.role !== "owner" && (
                      <div className="flex flex-col gap-1">
                        <button className="text-xs font-medium text-[#8B5CF6] hover:underline">Edit</button>
                        <button className="text-xs font-medium text-red-500 hover:underline">Remove</button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Permissions info */}
        <Card className="p-5 bg-[#F6F7F8] border-[#E2E8F0]">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Permission levels</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-[#475569]">
            <div>
              <p className="font-medium text-[#0F172A] mb-1 flex items-center gap-1.5"><Crown size={13} className="text-[#FF3366]"/> Account Owner</p>
              <p className="text-xs leading-relaxed">Full access to all jobs, billing, team management, and settings. One per account.</p>
            </div>
            <div>
              <p className="font-medium text-[#0F172A] mb-1 flex items-center gap-1.5"><User size={13} className="text-[#475569]"/> Team Member</p>
              <p className="text-xs leading-relaxed">Access to assigned jobs only. Posting rights and job visibility are set by the owner. Cannot access billing or team management.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold font-heading text-[#0F172A]">Invite team member</h3>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Name</label>
              <input placeholder="Full name" className="w-full border border-[#C7CAD1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3366]"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email address</label>
              <input type="email" placeholder="colleague@company.co.uk" className="w-full border border-[#C7CAD1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3366]"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Can post jobs?</label>
              <div className="flex gap-2">
                {["Yes","No"].map(opt => (
                  <button key={opt} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E2E8F0] text-[#475569] hover:border-[#FF3366] hover:text-[#FF3366] transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setInviteOpen(false)} className="px-4 py-2 text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-xl hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => setInviteOpen(false)} className="px-4 py-2 text-sm font-semibold bg-[#FF3366] text-white rounded-xl hover:bg-[#E62958]">
                Send invite
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
