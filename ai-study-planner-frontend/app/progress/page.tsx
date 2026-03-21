"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultUserProfile } from "../lib/userProfile";

type Subject = {
  name: string;
  difficulty: number;
  previous_score: number;
};

type ScheduleDoc = {
  _id: string;
  subjects?: Subject[];
  priority_analysis?: Array<{
    subject: string;
    predicted_score: number;
    risk: number;
    priority: number;
  }>;
};

type ProgressData = {
  subject: string;
  hours_completed: number;
  test_score: number;
  progress_score: number;
  xp: number;
};

type ProgressUpdateRow = {
  _id: string;
  type: string;
  data: ProgressData;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://studyforge-api-ma0b.onrender.com";

function hoursTargetForDifficulty(difficulty: number) {
  if (difficulty >= 5) return 60;
  if (difficulty >= 4) return 50;
  if (difficulty >= 3) return 45;
  return 40;
}

export default function ProgressPage() {
  const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);
  const [updates, setUpdates] = useState<ProgressUpdateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [hoursInput, setHoursInput] = useState("2");
  const [scoreInput, setScoreInput] = useState("90");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [scheduleRes, updatesRes] = await Promise.all([
        fetch(`${API_BASE}/schedules`),
        fetch(`${API_BASE}/progress_updates?limit=100`),
      ]);

      if (!scheduleRes.ok) {
        throw new Error(`Schedule fetch failed (${scheduleRes.status})`);
      }
      if (!updatesRes.ok) {
        throw new Error(`Progress fetch failed (${updatesRes.status})`);
      }

      const scheduleData = (await scheduleRes.json()) as ScheduleDoc[];
      const progressData = (await updatesRes.json()) as ProgressUpdateRow[];

      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      setUpdates(Array.isArray(progressData) ? progressData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load progress data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const latestSchedule = schedules[0];
  const subjects = useMemo(() => latestSchedule?.subjects ?? [], [latestSchedule]);

  useEffect(() => {
    if (!selectedCourse && subjects.length > 0) {
      setSelectedCourse(subjects[0].name);
    }
  }, [subjects, selectedCourse]);

  const progressBySubject = useMemo(() => {
    const bySubject = new Map<string, { hours: number; latestScore: number; count: number }>();

    updates.forEach((row) => {
      const d = row.data;
      if (!d?.subject) return;

      const existing = bySubject.get(d.subject) ?? { hours: 0, latestScore: 0, count: 0 };
      bySubject.set(d.subject, {
        hours: existing.hours + Number(d.hours_completed || 0),
        latestScore: Number(d.test_score || existing.latestScore),
        count: existing.count + 1,
      });
    });

    return bySubject;
  }, [updates]);

  const masteryRows = useMemo(() => {
    if (!subjects.length) {
      return [];
    }

    return subjects.map((subject) => {
      const tracked = progressBySubject.get(subject.name);
      const completedHours = tracked?.hours ?? 0;
      const targetHours = hoursTargetForDifficulty(subject.difficulty);
      const pct = Math.max(0, Math.min(100, Math.round((completedHours / targetHours) * 100)));
      const latestScore = tracked?.latestScore ?? subject.previous_score;

      return {
        name: subject.name,
        completedHours,
        targetHours,
        pct,
        latestScore,
      };
    });
  }, [subjects, progressBySubject]);

  const totalXp = useMemo(() => {
    return updates.reduce((sum, row) => sum + Number(row.data?.xp || 0), 0);
  }, [updates]);

  const avgTestScore = useMemo(() => {
    if (!updates.length) return 0;
    const sum = updates.reduce((acc, row) => acc + Number(row.data?.test_score || 0), 0);
    return Math.round((sum / updates.length) * 10) / 10;
  }, [updates]);

  const streak = useMemo(() => {
    return Math.min(30, Math.max(0, updates.length));
  }, [updates.length]);

  const currentWeekXp = useMemo(() => {
    return updates.slice(0, 7).reduce((sum, row) => sum + Number(row.data?.xp || 0), 0);
  }, [updates]);

  const handleLogHours = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitMessage(null);

    if (!selectedCourse) {
      setSubmitMessage("Select a course first.");
      return;
    }

    const hours = Number(hoursInput);
    const score = Number(scoreInput);

    if (!Number.isFinite(hours) || hours <= 0) {
      setSubmitMessage("Hours should be a positive number.");
      return;
    }

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      setSubmitMessage("Score must be between 0 and 100.");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE}/update_progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedCourse,
          hours_completed: hours,
          test_score: score,
        }),
      });

      if (!response.ok) {
        throw new Error(`Update failed (${response.status})`);
      }

      const data = await response.json();
      setSubmitMessage(`Logged successfully. +${data?.xp_earned ?? 0} XP`);
      await loadData();
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : "Could not log hours.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const motivationText = useMemo(() => {
    if (!masteryRows.length) {
      return "Generate a schedule first to activate personalized AI learning insights.";
    }

    const weakest = [...masteryRows].sort((a, b) => a.pct - b.pct)[0];
    return `You're ${Math.max(0, Math.round(weakest.targetHours - weakest.completedHours))} hours away from your next ${weakest.name} milestone. Keep your momentum and lock in one focused session tonight.`;
  }, [masteryRows]);

  return (
    <div className="bg-[#f6f5f8] dark:bg-[#151022] text-slate-900 dark:text-slate-100 font-display min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-purple-500/10 bg-[#f6f5f8]/60 dark:bg-[#151022]/60 px-6 py-4 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-lg bg-purple-500 text-white">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3 4h14v12H3z" />
                <path d="M6 2v4M14 2v4" fill="#fff" opacity=".4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight">StudyForge AI</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-purple-400"><path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" /></svg>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Level 12 Scholar</span>
            </div>
            <button type="button" className="flex items-center justify-center rounded-xl size-10 bg-slate-200 dark:bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 text-slate-700 dark:text-slate-300"><path d="M10 3a5 5 0 0 0-5 5v2.5L3.7 13a1 1 0 0 0 .8 1.5h11a1 1 0 0 0 .8-1.5L15 10.5V8a5 5 0 0 0-5-5z" /></svg>
            </button>
            <button type="button" className="flex items-center justify-center rounded-xl size-10 bg-slate-200 dark:bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 text-slate-700 dark:text-slate-300"><circle cx="10" cy="7" r="3" /><path d="M4 17c1.2-2.2 3.4-3.4 6-3.4s4.8 1.2 6 3.4" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-purple-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-full bg-gradient-to-tr from-purple-500 to-purple-400 p-0.5">
                  <div className="size-full rounded-full grid place-items-center text-xs font-bold bg-[#151022] text-white">{defaultUserProfile.initials}</div>
                </div>
                <div>
                  <p className="font-bold text-lg">{defaultUserProfile.fullName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{defaultUserProfile.major}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all" href="/dashboard">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" /></svg>
                  <span className="font-medium">Dashboard</span>
                </a>
                <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-500 text-white shadow-lg shadow-purple-500/20" href="/progress">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M4 16V7M10 16V4M16 16V10" /></svg>
                  <span className="font-medium">Progress Tracker</span>
                </a>
                <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all" href="/study-plans">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M4 4h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V4z" /><path d="M6 4v12" /></svg>
                  <span className="font-medium">Study Materials</span>
                </a>
                <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all" href="/chat">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M17 11a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6z" /></svg>
                  <span className="font-medium">AI Tutor</span>
                </a>
                <div className="my-4 border-t border-slate-200 dark:border-white/10" />
                <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all" href="/milestones">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M10 2v2" /><path d="M10 16v2" /><path d="M2 10h2" /><path d="M16 10h2" /><circle cx="10" cy="10" r="4" /></svg>
                  <span className="font-medium">Settings</span>
                </a>
              </nav>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-xl">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/80"><path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" /></svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">AI Insights</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Keep it up, {defaultUserProfile.fullName.split(' ')[0]}!</h3>
                <p className="text-sm text-white/90 leading-relaxed">{motivationText}</p>
                <a href="/insights" className="mt-4 block text-center w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-bold transition-all border border-white/20">
                  VIEW LEARNING PLAN
                </a>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-24 h-24"><path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" /></svg>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 flex flex-col gap-8">
            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm">
                {error}. Make sure backend is running and reachable.
              </div>
            ) : null}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total XP Earned</p>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-400"><path d="M10 2l2.4 4.9L18 8l-4 3.9.9 5.4L10 14.8 5.1 17.3 6 11.9 2 8l5.6-1.1L10 2z" /></svg>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black">{loading ? "--" : totalXp.toLocaleString()}</h4>
                  <span className="text-xs font-bold text-emerald-500">+{currentWeekXp} this wk</span>
                </div>
                <div className="mt-4 w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (totalXp % 10000) / 100)}%` }} />
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Study Streak</p>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-500"><path d="M10 1c.5 3-1.2 4.2-2.4 5.4A5.8 5.8 0 006 11.3c0 2.5 1.8 4.7 4 5.6 2.2-.9 4-3.1 4-5.6 0-2.4-1.2-3.8-2.4-5A8 8 0 0110 1z" /></svg>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black">{loading ? "--" : `${streak} Days`}</h4>
                  <span className="text-xs font-bold text-emerald-500">Keep going!</span>
                </div>
                <div className="mt-4 flex gap-1">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className={`h-1.5 flex-1 rounded-full ${index < Math.min(streak, 7) ? "bg-purple-500" : "bg-slate-300 dark:bg-white/10"}`} />
                  ))}
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Test Score</p>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 text-blue-500"><path d="M4 14l3-3 2 2 5-5" /><path d="M4 16h12" /></svg>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black">{loading ? "--" : `${avgTestScore || 0}%`}</h4>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">vs 88% class avg</span>
                </div>
                <div className="mt-4 w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${Math.max(1, avgTestScore)}%` }} />
                </div>
              </div>
            </section>

            <section className="bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Course Mastery</h3>
                  <p className="text-slate-500 dark:text-slate-400">Your current standing across active subjects</p>
                </div>
                <button type="button" className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-500/90 text-white rounded-lg font-bold text-sm transition-all">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M10 4v12M4 10h12" /></svg>
                  UPDATE HOURS
                </button>
              </div>

              <div className="space-y-8">
                {masteryRows.length ? masteryRows.map((row, index) => {
                  const color = index % 3 === 0 ? "purple" : index % 3 === 1 ? "blue" : "emerald";
                  const colorText = color === "purple" ? "text-purple-400" : color === "blue" ? "text-blue-500" : "text-emerald-500";
                  const colorBg = color === "purple" ? "bg-purple-500" : color === "blue" ? "bg-blue-500" : "bg-emerald-500";
                  const colorSoft = color === "purple" ? "bg-purple-500/20 text-purple-400" : color === "blue" ? "bg-blue-500/20 text-blue-500" : "bg-emerald-500/20 text-emerald-500";
                  return (
                    <div key={row.name}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colorSoft}`}>
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M4 4h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V4z" /><path d="M6 4v12" /></svg>
                          </div>
                          <div>
                            <p className="font-bold">{row.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(row.completedHours)} / {row.targetHours} hours completed</p>
                          </div>
                        </div>
                        <span className={`font-black ${colorText}`}>{row.pct}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-1">
                        <div className={`h-full ${colorBg} rounded-full`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No subjects found yet. Generate a schedule first.</p>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 text-purple-400"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 2" /></svg>
                  <h3 className="text-xl font-bold">Log Study Hours</h3>
                </div>

                {!subjects.length ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-200/50 dark:bg-[#151022]/50 rounded-lg border border-dashed border-slate-300 dark:border-purple-500/20">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">You need an active schedule to log progress.</p>
                    <a href="/schedule" className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-purple-500/20">Create a Schedule</a>
                  </div>
                ) : (
                  <form onSubmit={handleLogHours} className="flex flex-col gap-6 flex-1">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">Select Course</label>
                        <select
                          className="w-full bg-slate-200 dark:bg-white/10 border-none rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white transition-all py-3 px-4"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          {subjects.map((subject) => (
                            <option key={subject.name} value={subject.name}>{subject.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">Hours Studied Today</label>
                        <div className="flex gap-4">
                          <input
                            className="w-full bg-slate-200 dark:bg-white/10 border-none rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white transition-all py-3 px-4"
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={hoursInput}
                            onChange={(e) => setHoursInput(e.target.value)}
                          />
                          <button type="submit" disabled={submitLoading} className="bg-purple-500 text-white font-bold px-8 rounded-lg hover:bg-purple-500/90 transition-all disabled:opacity-60">
                            {submitLoading ? "..." : "LOG"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">Latest Test Score (0-100)</label>
                        <input
                          className="w-full bg-slate-200 dark:bg-white/10 border-none rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white transition-all py-3 px-4"
                          type="number"
                          min={0}
                          max={100}
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                        />
                      </div>
                    </div>

                    {submitMessage ? (
                      <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-300">{submitMessage}</div>
                    ) : null}

                    <div className="mt-auto p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tip: Accurate logging helps the AI refine your personalized learning velocity and exam predictions.</p>
                    </div>
                  </form>
                )}
              </div>

              <div className="bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 text-purple-400"><path d="M4 14l3-3 2 2 5-5" /><path d="M4 16h12" /></svg>
                    <h3 className="text-xl font-bold">Recent Scores</h3>
                  </div>
                  <button type="button" className="text-xs font-bold text-purple-400 hover:underline uppercase tracking-tight">Add New</button>
                </div>

                <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[250px] pr-2">
                  {updates.length ? updates.map((row) => (
                    <div key={row._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10">
                      <div>
                        <p className="font-bold text-sm">{row.data.subject} Progress Check</p>
                        <p className="text-xs text-slate-500">Logged hours: {row.data.hours_completed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-500">{Math.round(row.data.test_score)}/100</p>
                        <p className="text-[10px] text-slate-500 uppercase">XP +{row.data.xp}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No progress updates yet. Log your first study hours.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t border-purple-500/10 py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-12 bg-slate-100/50 dark:bg-[#151022]/50">
          <div className="flex items-center gap-2 opacity-60">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" /></svg>
            <span className="text-xs">2026 StudyForge AI. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a className="text-xs text-slate-500 hover:text-purple-500 transition-colors uppercase tracking-widest font-bold" href="#">Privacy</a>
            <a className="text-xs text-slate-500 hover:text-purple-500 transition-colors uppercase tracking-widest font-bold" href="#">Terms</a>
            <a className="text-xs text-slate-500 hover:text-purple-500 transition-colors uppercase tracking-widest font-bold" href="#">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
