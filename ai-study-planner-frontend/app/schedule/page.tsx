"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type PriorityItem = {
  subject: string;
  predicted_score: number;
  risk: number;
  priority: number;
};

type ScheduleResponse = {
  _id?: string;
  priority_analysis: PriorityItem[];
  daily_plan: Record<string, number>;
  weekly_schedule: Record<string, Record<string, number>>;
  ai_insights?: string;
};

type ScheduleRow = {
  timeBlock: string;
  topic: string;
  detail: string;
  activityType: string;
  focusLevel: 1 | 2 | 3;
};

const API_URL = "http://127.0.0.1:8000/generate_schedule";

const difficultyMap: Record<string, number> = {
  easy: 2,
  medium: 3,
  hard: 5,
};

function parseNumber(value: string, fallback: number) {
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function toTimeLabel(totalMinutes: number) {
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function inferActivityType(priority: number, risk: number) {
  if (risk >= 60 || priority >= 75) return "Active Practice";
  if (risk >= 35 || priority >= 55) return "Theory Review";
  return "Self Assessment";
}

function inferFocusLevel(priority: number, risk: number): 1 | 2 | 3 {
  if (risk >= 60 || priority >= 75) return 3;
  if (risk >= 35 || priority >= 55) return 2;
  return 1;
}

function tagStyle(activityType: string) {
  if (activityType === "Active Practice") {
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
  }
  if (activityType === "Self Assessment") {
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
  }
  return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
}

export default function PlannerPage() {
  const [subjectName, setSubjectName] = useState("Mathematics");
  const [dailyHours, setDailyHours] = useState("4");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [previousScore, setPreviousScore] = useState("78");
  const [practiceInput, setPracticeInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScheduleResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scheduleRows = useMemo<ScheduleRow[]>(() => {
    if (!result?.daily_plan) {
      return [];
    }

    const priorityMap = new Map(result.priority_analysis.map((item) => [item.subject, item]));
    const entries = Object.entries(result.daily_plan).sort((a, b) => {
      const pa = priorityMap.get(a[0])?.priority ?? 0;
      const pb = priorityMap.get(b[0])?.priority ?? 0;
      return pb - pa;
    });

    let cursor = 9 * 60;
    return entries.map(([topic, hours], index) => {
      const mins = Math.max(30, Math.round(Number(hours) * 60));
      const start = cursor;
      const end = cursor + mins;
      cursor = end + 15;

      const p = priorityMap.get(topic);
      const activityType = inferActivityType(p?.priority ?? 50, p?.risk ?? 50);
      const focusLevel = inferFocusLevel(p?.priority ?? 50, p?.risk ?? 50);

      return {
        timeBlock: `${toTimeLabel(start)} - ${toTimeLabel(end)}`,
        topic,
        detail: index === 0 ? "High-priority targeted revision" : "Problem solving and retention practice",
        activityType,
        focusLevel,
      };
    });
  }, [result]);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedSubject = subjectName.trim() || "General Study";

    const parsedDailyHours = Math.max(1, parseNumber(dailyHours, 4));
    const parsedPreviousScore = Math.max(0, Math.min(100, parseNumber(previousScore, 78)));

    const parsedPractice = (() => {
      if (!practiceInput.trim()) return 1;
      if (/^https?:\/\//i.test(practiceInput.trim())) return 1;
      return Math.max(1, parseNumber(practiceInput, 1));
    })();

    const payload = {
      daily_hours: parsedDailyHours,
      subjects: [
        {
          name: normalizedSubject,
          difficulty: difficultyMap[difficulty],
          previous_score: parsedPreviousScore,
          study_hours: Math.max(1, parsedDailyHours),
          sleep_hours: 7,
          practice_papers: parsedPractice,
        },
      ],
    };

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const failureBody = await response.text();
        throw new Error(`Request failed with status ${response.status}${failureBody ? `: ${failureBody}` : ""}`);
      }

      const data: ScheduleResponse = await response.json();
      const normalized: ScheduleResponse = {
        ...data,
        priority_analysis: Array.isArray(data.priority_analysis) ? data.priority_analysis : [],
        daily_plan:
          data.daily_plan && Object.keys(data.daily_plan).length
            ? data.daily_plan
            : { [normalizedSubject]: parsedDailyHours },
        weekly_schedule: data.weekly_schedule ?? {},
        ai_insights: data.ai_insights ?? "Your plan is ready. Start with highest-priority topics first.",
      };

      setResult(normalized);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      const fallbackResult: ScheduleResponse = {
        priority_analysis: [
          {
            subject: normalizedSubject,
            predicted_score: parsedPreviousScore,
            risk: Math.max(0, 100 - parsedPreviousScore),
            priority: Math.max(40, 100 - parsedPreviousScore),
          },
        ],
        daily_plan: { [normalizedSubject]: parsedDailyHours },
        weekly_schedule: {
          Monday: { [normalizedSubject]: parsedDailyHours },
          Tuesday: { [normalizedSubject]: parsedDailyHours },
          Wednesday: { [normalizedSubject]: parsedDailyHours },
          Thursday: { [normalizedSubject]: parsedDailyHours },
          Friday: { [normalizedSubject]: parsedDailyHours },
          Saturday: { [normalizedSubject]: 0 },
          Sunday: { [normalizedSubject]: 0 },
        },
        ai_insights: "API is unavailable right now, so a local fallback plan was generated. Start with this and retry backend generation once the API is up.",
      };

      setResult(fallbackResult);

      setError(
        err instanceof Error
          ? `${err.name === "AbortError" ? "Request timed out" : err.message}. API is unavailable, so a local fallback plan was generated.`
          : "Unable to generate plan. Please check backend and try again.",
      );

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  const aiTip = result?.ai_insights
    ? result.ai_insights
    : "Based on your previous score, the planner will allocate more time to high-risk sections.";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f5f8] dark:bg-[#151022] text-slate-900 dark:text-slate-100">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 flex-col items-center px-4 py-8 md:px-10">
          <div className="max-w-4xl w-full flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                AI Study <span className="text-purple-500">Planner</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                Enter your details below and let our AI forge a customized high-performance study schedule based on your current progress and goals.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-purple-500/10 rounded-xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject Name</span>
                  <div className="relative">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <path d="M4 4h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V4z" />
                      <path d="M6 4v12" />
                    </svg>
                    <input
                      className="w-full pl-11 pr-4 h-12 rounded-lg border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#151022]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                      placeholder="e.g. Advanced Physics"
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily Study Hours</span>
                  <div className="relative">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <circle cx="10" cy="10" r="7" />
                      <path d="M10 6v4l2.5 2" />
                    </svg>
                    <input
                      className="w-full pl-11 pr-4 h-12 rounded-lg border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#151022]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                      placeholder="e.g. 4"
                      type="number"
                      min={1}
                      max={24}
                      step={0.5}
                      value={dailyHours}
                      onChange={(e) => setDailyHours(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Difficulty Level</span>
                  <div className="relative">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <path d="M4 14h2M8 10h2M12 6h2" />
                      <path d="M3 16h14" />
                    </svg>
                    <select
                      className="w-full pl-11 pr-4 h-12 rounded-lg border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#151022]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all appearance-none"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                    >
                      <option value="easy">Beginner / Easy</option>
                      <option value="medium">Intermediate / Medium</option>
                      <option value="hard">Advanced / Hard</option>
                    </select>
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Previous Score (%)</span>
                  <div className="relative">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <path d="M4 14l3-3 2 2 5-5" />
                      <path d="M4 16h12" />
                    </svg>
                    <input
                      className="w-full pl-11 pr-4 h-12 rounded-lg border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#151022]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                      placeholder="e.g. 78"
                      type="text"
                      value={previousScore}
                      onChange={(e) => setPreviousScore(e.target.value)}
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Practice Papers (Link or Count)</span>
                  <div className="relative">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <path d="M7 10h6" />
                      <path d="M6 6h8a2 2 0 0 1 0 4h-1" />
                      <path d="M14 14H6a2 2 0 0 1 0-4h1" />
                    </svg>
                    <input
                      className="w-full pl-11 pr-4 h-12 rounded-lg border border-slate-200 dark:border-purple-500/20 bg-slate-50 dark:bg-[#151022]/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                      placeholder="Enter URL or paper count"
                      type="text"
                      value={practiceInput}
                      onChange={(e) => setPracticeInput(e.target.value)}
                    />
                  </div>
                </label>
              </div>

              {error ? (
                <div className="mt-6 rounded-lg border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
                  {error}
                </div>
              ) : null}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-purple-500/20"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 1l2.5 5.5L18 8l-4 3.8.9 5.2L10 14.5 5.1 17l.9-5.2L2 8l5.5-1.5L10 1z" />
                  </svg>
                  {loading ? "Generating..." : "Generate AI Study Plan"}
                </button>
              </div>
            </form>

            <div ref={resultsRef} className="mt-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5 text-purple-500">
                    <rect x="3" y="4" width="14" height="13" rx="2" />
                    <path d="M7 2v3M13 2v3M3 8h14" />
                  </svg>
                  Your Optimized Schedule
                </h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-purple-500 text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
                    <path d="M6 2h8v4H6z" />
                    <rect x="4" y="8" width="12" height="6" rx="1" />
                    <path d="M6 12h8v6H6z" />
                  </svg>
                  Export PDF
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-purple-500/10 shadow-sm bg-white dark:bg-slate-900/30">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-purple-500/5 border-b border-slate-200 dark:border-purple-500/10">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Time Block</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Topic</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Activity Type</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Focus Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-500/5">
                    {scheduleRows.length ? (
                      scheduleRows.map((row) => (
                        <tr key={`${row.timeBlock}-${row.topic}`}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">{row.timeBlock}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{row.topic}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{row.detail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tagStyle(row.activityType)}`}>
                              {row.activityType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-0.5">
                              {[1, 2, 3].map((level) => (
                                <svg
                                  key={level}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className={`w-4 h-4 ${level <= row.focusLevel ? "text-purple-500" : "text-slate-300 dark:text-slate-700"}`}
                                >
                                  <path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" />
                                </svg>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          Generate a study plan to view your schedule table.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-4 items-start">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-500 mt-1 shrink-0">
                  <path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" />
                </svg>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">AI Study Tip</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{aiTip}</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-12 border-t border-slate-200 dark:border-purple-500/10 px-4 md:px-10 py-8 bg-white dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
            <p>© 2026 StudyForge AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-purple-500 transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-purple-500 transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-purple-500 transition-colors" href="#">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
