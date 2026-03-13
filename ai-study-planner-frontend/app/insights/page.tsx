"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultUserProfile } from "../lib/userProfile";

type PriorityItem = {
  subject: string;
  predicted_score: number;
  risk: number;
  priority: number;
};

type ScheduleDoc = {
  _id: string;
  daily_hours?: number;
  subjects?: Array<{ name: string }>;
  priority_analysis?: PriorityItem[];
  daily_plan?: Record<string, number>;
  weekly_schedule?: Record<string, Record<string, number>>;
};

const API_BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
    : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function StrategyCard({
  title,
  text,
  priorityLabel,
  secondary,
  icon,
}: {
  title: string;
  text: string;
  priorityLabel: string;
  secondary: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass p-5 rounded-xl flex gap-5 hover:bg-purple-500/10 transition-colors group cursor-pointer">
      <div className="size-10 rounded-full bg-purple-500/10 text-purple-300 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="font-bold group-hover:text-purple-300 transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{text}</p>
        <div className="mt-3 flex gap-2">
          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">{priorityLabel}</span>
          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-500">{secondary}</span>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/schedules`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load insights data (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        const sorted = rows.sort((a, b) => String(b._id ?? "").localeCompare(String(a._id ?? "")));
        setSchedules(sorted);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const latest = schedules[0];
  const priorityRows = useMemo(() => latest?.priority_analysis ?? [], [latest]);

  const metrics = useMemo(() => {
    if (!priorityRows.length) {
      return {
        overallFocus: 0,
        overallTrend: 0,
        efficiency: 0,
        efficiencyTrend: 0,
        completedGoals: 0,
        totalGoals: 0,
        goalPercent: 0,
      };
    }

    const avgPredicted = priorityRows.reduce((sum, row) => sum + row.predicted_score, 0) / priorityRows.length;
    const avgRisk = priorityRows.reduce((sum, row) => sum + row.risk, 0) / priorityRows.length;
    const completed = priorityRows.filter((row) => row.risk < 35).length;

    const overallFocus = clamp(Math.round(avgPredicted), 0, 100);
    const efficiency = clamp(Math.round(100 - avgRisk * 0.6), 0, 100);
    const totalGoals = priorityRows.length;
    const goalPercent = clamp(Math.round((completed / totalGoals) * 100), 0, 100);

    return {
      overallFocus,
      overallTrend: 5,
      efficiency,
      efficiencyTrend: -2,
      completedGoals: completed,
      totalGoals,
      goalPercent,
    };
  }, [priorityRows]);

  const riskSubjects = useMemo(() => {
    return [...priorityRows].sort((a, b) => b.risk - a.risk).slice(0, 2);
  }, [priorityRows]);

  const strategySubjects = useMemo(() => {
    if (!priorityRows.length) {
      return {
        highRisk: "Advanced Calculus",
        mediumRisk: "Molecular Biology",
        strong: "Organic Chemistry",
      };
    }

    const sorted = [...priorityRows].sort((a, b) => b.risk - a.risk);
    const highRisk = sorted[0]?.subject ?? "Advanced Calculus";
    const mediumRisk = sorted[1]?.subject ?? sorted[0]?.subject ?? "Molecular Biology";
    const strongest = [...priorityRows].sort((a, b) => b.predicted_score - a.predicted_score)[0]?.subject ?? "Organic Chemistry";

    return {
      highRisk,
      mediumRisk,
      strong: strongest,
    };
  }, [priorityRows]);

  const weeklyConsistency = useMemo(() => {
    const source = latest?.weekly_schedule;
    if (!source) {
      return [40, 55, 35, 70, 85, 95, 75];
    }

    const totals = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
      const schedule = source[day] ?? {};
      return Object.values(schedule).reduce((sum, hours) => sum + Number(hours || 0), 0);
    });

    const maxValue = Math.max(...totals, 1);
    return totals.map((value) => clamp(Math.round((value / maxValue) * 100), 10, 100));
  }, [latest]);

  const focusTrendLabel = weeklyConsistency[5] >= weeklyConsistency[0] ? "Increasing" : "Needs attention";

  return (
    <div className="bg-[#f6f5f8] dark:bg-[#151022] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-purple-500/10 px-6 md:px-10 py-4 bg-[#f6f5f8]/60 dark:bg-[#151022]/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="size-10 flex items-center justify-center rounded-lg bg-purple-500 text-white">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10 1l2.5 5.5L18 8l-4 3.8.9 5.2L10 14.5 5.1 17l.9-5.2L2 8l5.5-1.5L10 1z" />
                </svg>
              </div>
              <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">StudyForge AI</h2>
            </div>
            <div className="flex flex-1 justify-end gap-4">
              <div className="flex gap-2">
                <button type="button" className="flex items-center justify-center rounded-xl size-10 bg-purple-500/10 text-purple-300 transition-colors hover:bg-purple-500/20">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M10 3a5 5 0 0 0-5 5v2.5L3.7 13a1 1 0 0 0 .8 1.5h11a1 1 0 0 0 .8-1.5L15 10.5V8a5 5 0 0 0-5-5z" />
                  </svg>
                </button>
                <button type="button" className="flex items-center justify-center rounded-xl size-10 bg-purple-500/10 text-purple-300 transition-colors hover:bg-purple-500/20">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M10 2v2" />
                    <path d="M10 16v2" />
                    <path d="M2 10h2" />
                    <path d="M16 10h2" />
                    <circle cx="10" cy="10" r="4" />
                  </svg>
                </button>
              </div>
              <div className="bg-purple-500/30 rounded-full size-10 ring-2 ring-purple-500/20 grid place-items-center text-xs font-bold text-white">{defaultUserProfile.initials}</div>
            </div>
          </header>

          <div className="flex flex-1 flex-col lg:flex-row">
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
              {error ? (
                <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm">
                  {error}. Start backend API and refresh this page.
                </div>
              ) : null}

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <h1 className="text-slate-900 dark:text-white text-4xl font-extrabold tracking-tight">Performance Insights</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">AI-powered analysis of your recent study sessions and retention metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass p-6 rounded-xl flex flex-col gap-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Overall Focus</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold">{loading ? "--" : `${metrics.overallFocus}%`}</p>
                      <p className="text-emerald-500 text-sm font-medium mb-1 flex items-center gap-1">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M10 4l5 8H5l5-8z" /></svg>{metrics.overallTrend}%
                      </p>
                    </div>
                    <div className="w-full bg-purple-500/10 h-1.5 rounded-full mt-2">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${metrics.overallFocus}%` }} />
                    </div>
                  </div>

                  <div className="glass p-6 rounded-xl flex flex-col gap-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Efficiency Score</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold">{loading ? "--" : `${metrics.efficiency}%`}</p>
                      <p className="text-rose-500 text-sm font-medium mb-1 flex items-center gap-1">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 rotate-180"><path d="M10 4l5 8H5l5-8z" /></svg>{Math.abs(metrics.efficiencyTrend)}%
                      </p>
                    </div>
                    <div className="w-full bg-purple-500/10 h-1.5 rounded-full mt-2">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${metrics.efficiency}%` }} />
                    </div>
                  </div>

                  <div className="glass p-6 rounded-xl flex flex-col gap-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Goal Completion</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold">{loading ? "--" : `${metrics.completedGoals}/${metrics.totalGoals || 1}`}</p>
                      <p className="text-emerald-500 text-sm font-medium mb-1 flex items-center gap-1">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M7.5 13.2L4.8 10.5 3.6 11.7l3.9 3.9 8-8-1.2-1.2z" /></svg>{metrics.goalPercent}%
                      </p>
                    </div>
                    <div className="w-full bg-purple-500/10 h-1.5 rounded-full mt-2">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${metrics.goalPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-500"><path d="M10 2l8 14H2L10 2zm0 4.8a1 1 0 00-1 1v3.4a1 1 0 102 0V7.8a1 1 0 00-1-1zm0 7a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z" /></svg>
                    <h2 className="text-2xl font-bold">Risk Subjects</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {riskSubjects.length ? (
                      riskSubjects.map((item) => {
                        const critical = item.risk >= 60;
                        return (
                          <div
                            key={item.subject}
                            className={`glass p-5 rounded-xl flex items-center justify-between ${critical ? "shadow-[0_0_15px_rgba(255,77,77,0.15)] bg-rose-500/5 border-rose-500/30" : "bg-amber-500/5 border-amber-500/30"}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`size-12 rounded-lg flex items-center justify-center ${critical ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"}`}>
                                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                                  <path d="M4 16V7M10 16V4M16 16V10" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{item.subject}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Risk level at {Math.round(item.risk)}% based on latest prediction
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`${critical ? "text-rose-400" : "text-amber-400"} font-bold text-xl`}>{critical ? "Critical" : "At Risk"}</p>
                              <p className="text-xs text-slate-400">Priority {Math.round(item.priority)}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="glass p-5 rounded-xl text-sm text-slate-400 md:col-span-2">
                        No risk data yet. Generate a study schedule first.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Recommended Strategies</h2>
                    <div className="flex flex-col gap-4">
                      <StrategyCard
                        title={`Implement spaced repetition for ${strategySubjects.highRisk}`}
                        text={`Your data shows steep forgetting curves on ${strategySubjects.highRisk}. Schedule a short review session within the next 24 hours.`}
                        priorityLabel="Priority High"
                        secondary="Focus Session"
                        icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 2" /></svg>}
                      />

                      <StrategyCard
                        title={`Active recall for ${strategySubjects.mediumRisk}`}
                        text={`Switch from passive reading to quick recall prompts for ${strategySubjects.mediumRisk}. This usually improves retention in under a week.`}
                        priorityLabel="Priority Medium"
                        secondary="Flashcards"
                        icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M10 2a6 6 0 0 0-4 10.5V15a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 14 15v-2.5A6 6 0 0 0 10 2z" /></svg>}
                      />

                      <StrategyCard
                        title={`Peer teaching opportunity in ${strategySubjects.strong}`}
                        text={`You are currently strongest in ${strategySubjects.strong}. Teaching this subject to others will reinforce your mastery.`}
                        priorityLabel="Reinforcement"
                        secondary="Social Study"
                        icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><circle cx="7" cy="7" r="2.2" /><circle cx="13" cy="7" r="2.2" /><path d="M3.5 15c.8-2 2-3 3.5-3s2.7 1 3.5 3" /><path d="M9.5 15c.8-2 2-3 3.5-3s2.7 1 3.5 3" /></svg>}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-bold">Focus Trend</h2>
                    <div className="glass p-6 rounded-xl relative overflow-hidden h-64 flex flex-col justify-between">
                      <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-400">Weekly Consistency</p>
                        <p className="text-2xl font-bold">{focusTrendLabel}</p>
                      </div>

                      <div className="flex items-end justify-between h-32 gap-1">
                        {weeklyConsistency.map((height, idx) => (
                          <div
                            key={WEEK_DAYS[idx]}
                            className={`${idx === 5 ? "bg-purple-500 shadow-[0_0_15px_rgba(137,90,246,0.3)]" : idx === 6 ? "bg-purple-500/40" : "bg-purple-500/20"} w-full rounded-t`}
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-2">
                        {WEEK_DAYS.map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-xl flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-400"><path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" /></svg>
                        <h3 className="font-bold">Pro Tip</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Taking a 5-minute break every 25 minutes can improve your focus score. Enable the built-in timer below.
                      </p>
                      <button
                        type="button"
                        onClick={() => setTimerOn((value) => !value)}
                        className="w-full py-2.5 rounded-lg bg-purple-500 text-white text-sm font-bold hover:brightness-110 transition-all"
                      >
                        {timerOn ? "Timer Enabled" : "Enable Timer"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
