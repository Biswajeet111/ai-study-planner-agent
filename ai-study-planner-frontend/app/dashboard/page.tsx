"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultUserProfile } from "../lib/userProfile";

type PriorityItem = {
  subject: string;
  predicted_score: number;
  risk: number;
  priority: number;
};

type Subject = {
  name: string;
};

type ScheduleDoc = {
  _id: string;
  daily_hours?: number;
  subjects?: Subject[];
  priority_analysis?: PriorityItem[];
  daily_plan?: Record<string, number>;
  weekly_schedule?: Record<string, Record<string, number>>;
};

const API_BASE = "http://127.0.0.1:8000";
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const sessionTimes = ["10:00 AM - 11:30 AM", "02:00 PM - 03:00 PM", "04:30 PM - 05:30 PM"];

function dayLabel(day: string) {
  return day.slice(0, 3).toUpperCase();
}

function safeHour(total: number) {
  return `${Math.round(total * 10) / 10}h`;
}

export default function DashboardPage() {
  const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"hours" | "focus">("hours");

  useEffect(() => {
    fetch(`${API_BASE}/schedules`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load schedules (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        const sorted = Array.isArray(data)
          ? data.slice().sort((a, b) => String(b._id ?? "").localeCompare(String(a._id ?? "")))
          : [];
        setSchedules(sorted);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to connect to API.");
      })
      .finally(() => setLoading(false));
  }, []);

  const latest = schedules[0];

  const weeklyTotals = useMemo(() => {
    const weekly = latest?.weekly_schedule;
    return dayNames.map((day) => {
      const daySchedule = weekly?.[day] ?? {};
      const total = Object.values(daySchedule).reduce((sum, hours) => sum + Number(hours || 0), 0);
      return { day, total };
    });
  }, [latest]);

  const dailyHours = useMemo(() => {
    if (!latest) {
      return 0;
    }

    const fromDailyPlan = latest.daily_plan
      ? Object.values(latest.daily_plan).reduce((sum, hours) => sum + Number(hours || 0), 0)
      : 0;

    return fromDailyPlan || Number(latest.daily_hours || 0);
  }, [latest]);

  const weeklyFocus = useMemo(() => {
    const targetDailyHours = Math.max(1, Number(latest?.daily_hours || dailyHours || 0));
    return weeklyTotals.map((entry) => {
      const pct = Math.round((entry.total / targetDailyHours) * 100);
      return {
        day: entry.day,
        value: Math.max(0, Math.min(100, pct)),
      };
    });
  }, [weeklyTotals, latest, dailyHours]);

  const chartSeries = useMemo(() => {
    if (chartMode === "focus") {
      return weeklyFocus.map((entry) => ({ day: entry.day, value: entry.value }));
    }
    return weeklyTotals.map((entry) => ({ day: entry.day, value: entry.total }));
  }, [chartMode, weeklyFocus, weeklyTotals]);

  const chartMax = useMemo(() => {
    return Math.max(...chartSeries.map((entry) => entry.value), 0);
  }, [chartSeries]);

  const chartHasData = chartMax > 0;

  const activeDays = weeklyTotals.filter((entry) => entry.total > 0).length;
  const weeklyProgress = Math.min(100, Math.round((activeDays / 7) * 100));
  const xpEarned = schedules.length * 250;
  const focusSubjects = latest?.daily_plan ? Object.keys(latest.daily_plan).length : (latest?.subjects?.length ?? 0);

  const topSubjects = (latest?.priority_analysis ?? []).slice(0, 3);

  const schedulePreview = topSubjects.length
    ? topSubjects.map((item, idx) => ({
        time: sessionTimes[idx] ?? sessionTimes[sessionTimes.length - 1],
        title: item.subject,
        topic: idx === 0 ? "High priority deep-work session" : "Revision and focused practice",
        active: idx === 0,
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#151022] text-slate-100">
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-[#151022]/70 backdrop-blur-md sticky top-0 z-10">
        <div className="hidden md:flex items-center gap-4 w-full max-w-md">
          <div className="relative w-full">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l4 4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search resources..."
              readOnly
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button type="button" className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:bg-purple-500/10 hover:text-purple-300 transition">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
              <path d="M10 3a5 5 0 0 0-5 5v2.5L3.7 13a1 1 0 0 0 .8 1.5h11a1 1 0 0 0 .8-1.5L15 10.5V8a5 5 0 0 0-5-5z" />
              <path d="M8.8 16a1.7 1.7 0 0 0 2.4 0" />
            </svg>
          </button>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold leading-none">{defaultUserProfile.fullName}</p>
          </div>
          <div className="size-10 rounded-full border-2 border-purple-400/30 bg-purple-500/20 grid place-items-center text-xs font-bold">{defaultUserProfile.initials}</div>
        </div>
      </header>

      <div className="p-5 sm:p-8 space-y-8">
        {error ? (
          <div className="glass-card rounded-xl p-4 border border-rose-400/30 text-rose-200 text-sm">
            {error}. If MongoDB/API is not running, start backend first and refresh.
          </div>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                  <circle cx="10" cy="10" r="7" />
                  <path d="M10 6v4l2.5 2" />
                </svg>
              </div>
              <span className="text-emerald-400 text-xs font-bold">+12%</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Daily Study Hours</p>
              <h3 className="text-2xl font-bold mt-1">{loading ? "--" : safeHour(dailyHours)}</h3>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 rounded-lg bg-orange-500/10 text-orange-300 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                  <path d="M3 14l4-4 3 3 7-7" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs font-bold">Stable</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Weekly Progress</p>
              <h3 className="text-2xl font-bold mt-1">{loading ? "--" : `${weeklyProgress}%`}</h3>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 rounded-lg bg-yellow-500/10 text-yellow-300 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                  <path d="M10 2l2.4 4.9L18 8l-4 3.9.9 5.4L10 14.8 5.1 17.3 6 11.9 2 8l5.6-1.1L10 2z" />
                </svg>
              </div>
              <span className="text-emerald-400 text-xs font-bold">+250 today</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">XP Earned</p>
              <h3 className="text-2xl font-bold mt-1">{loading ? "--" : xpEarned.toLocaleString()}</h3>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 rounded-lg bg-blue-500/10 text-blue-300 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                  <path d="M4 16V7M10 16V4M16 16V10" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs font-bold">No change</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Focus Subjects</p>
              <h3 className="text-2xl font-bold mt-1">{loading ? "--" : `${focusSubjects} Subjects`}</h3>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <section className="xl:col-span-2 glass-card p-8 rounded-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Weekly Performance</h2>
                <p className="text-slate-400 text-sm">Review your study activity over the last 7 days</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChartMode("hours")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    chartMode === "hours"
                      ? "bg-purple-500/10 text-purple-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Hours
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("focus")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    chartMode === "focus"
                      ? "bg-purple-500/10 text-purple-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Focus %
                </button>
              </div>
            </div>

            <div className="h-64 relative flex items-end justify-between gap-3 pt-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0">
                <div className="border-t border-slate-300/40 w-full" />
                <div className="border-t border-slate-300/40 w-full" />
                <div className="border-t border-slate-300/40 w-full" />
                <div className="border-t border-slate-300/40 w-full" />
              </div>

              {!chartHasData ? (
                <div className="absolute inset-0 z-10 grid place-items-center text-center px-6">
                  <p className="text-sm text-slate-400">
                    No weekly activity found yet. Generate a schedule to populate this chart.
                  </p>
                </div>
              ) : null}

              {chartSeries.map((entry, index) => {
                const height = chartHasData ? Math.max(18, Math.round((entry.value / Math.max(chartMax, 1)) * 100)) : 0;
                const isPeak = entry.value === chartMax && entry.value > 0;

                return (
                  <div key={entry.day} className="flex-1 flex flex-col items-center gap-2 group z-20">
                    <div
                      className={`w-full rounded-t-lg transition-all relative border border-purple-400/20 ${isPeak ? "bg-purple-500" : "bg-purple-500/35 group-hover:bg-purple-500/55"}`}
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-purple-600 text-white text-[10px] px-2 py-1 rounded transition-opacity">
                        {chartMode === "focus" ? `${entry.value}%` : safeHour(entry.value)}
                      </div>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-tighter ${isPeak ? "text-purple-300" : "text-slate-400"}`}>
                      {dayLabel(dayNames[index])}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="glass-card p-8 rounded-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Study Preview</h2>
              <Link href="/schedule" className="text-purple-300 text-xs font-bold hover:underline">View All</Link>
            </div>

            {schedulePreview.length ? (
              <div className="space-y-6">
                {schedulePreview.map((item, idx) => (
                  <div key={`${item.title}-${item.time}`} className={`flex gap-4 items-start relative ${idx < schedulePreview.length - 1 ? "pb-6" : ""} border-l ${item.active ? "border-purple-400/30" : "border-slate-700"} ml-3 pl-6`}>
                    <div className={`absolute top-0 left-0 -translate-x-1/2 size-3 rounded-full ${item.active ? "bg-purple-500 ring-4 ring-purple-500/20" : "bg-slate-700"}`} />
                    <div>
                      <p className={`text-xs font-bold mb-1 ${item.active ? "text-purple-300" : "text-slate-500"}`}>{item.time}</p>
                      <h4 className="font-bold text-slate-100">{item.title}</h4>
                      <p className="text-slate-400 text-xs mt-1">{item.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No study plan yet. Generate your first schedule.</p>
            )}

            <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-300 mt-0.5">
                  <path d="M10 1l2.5 5.5L18 8l-4 3.8.9 5.2L10 14.5 5.1 17l.9-5.2L2 8l5.5-1.5L10 1z" />
                </svg>
                <p className="text-xs font-medium text-slate-300">
                  AI Recommendation: Focus the highest-risk subject during your first session for better retention.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="glass-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Subjects</h2>
            <Link href="/schedule" className="bg-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-500/20 transition">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M10 4v12M4 10h12" />
              </svg>
              Add Subject
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Proficiency</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Recent Goal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(latest?.priority_analysis ?? []).length ? (
                  latest!.priority_analysis!.map((item) => {
                    const proficiency = Math.max(0, Math.min(100, Math.round(item.predicted_score)));
                    const status = item.risk >= 60 ? "Behind" : item.risk >= 35 ? "In Progress" : "Ahead";
                    const statusClass = item.risk >= 60
                      ? "bg-rose-500/10 text-rose-300"
                      : item.risk >= 35
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-emerald-500/10 text-emerald-300";

                    return (
                      <tr key={item.subject} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">
                              {item.subject.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-sm">{item.subject}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: `${proficiency}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">Reach score {Math.max(70, Math.round(item.predicted_score + 10))}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${statusClass}`}>{status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/progress?subject=${encodeURIComponent(item.subject)}`}
                              className="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition"
                            >
                              Update
                            </Link>
                            <Link
                              href={`/chat?q=${encodeURIComponent(`Help me with ${item.subject}`)}`}
                              className="px-2.5 py-1 rounded text-[11px] font-bold bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition"
                            >
                              Ask AI
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No subject data yet. Generate a schedule to populate this table.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
