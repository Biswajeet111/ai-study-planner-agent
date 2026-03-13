"use client";

import { useEffect, useState } from "react";
import { defaultUserProfile } from "../lib/userProfile";

const API_BASE = "http://127.0.0.1:8000";

type Badge = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  color: string;
};

function ProgressRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#dde8f8" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#2563eb" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#0f172a">
        {pct}%
      </text>
    </svg>
  );
}

export default function MilestonesPage() {
  const [planCount, setPlanCount] = useState(0);
  const [motivationMsg, setMotivationMsg] = useState<string | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/schedules`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlanCount(data.length);
      })
      .catch(() => {});
  }, []);

  const fetchMotivation = () => {
    setLoadingMotivation(true);
    const progressScore = Math.min(100, Math.round((planCount / 10) * 100));
    fetch(`${API_BASE}/motivation?progress_score=${progressScore}`)
      .then((r) => r.json())
      .then((data) => setMotivationMsg(data?.message ?? data?.motivation ?? "Keep going — you're doing great!"))
      .catch(() => setMotivationMsg("Stay consistent and trust the process. Every focused session moves you forward!"))
      .finally(() => setLoadingMotivation(false));
  };

  const badges: Badge[] = [
    {
      id: "first-plan",
      title: "First Step",
      description: "Generated your very first study plan.",
      unlocked: planCount >= 1,
      color: "from-blue-400 to-blue-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      id: "three-plans",
      title: "Building Momentum",
      description: "Generated 3 or more study plans.",
      unlocked: planCount >= 3,
      color: "from-purple-400 to-purple-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      id: "five-plans",
      title: "Study Champion",
      description: "Generated 5 or more study plans.",
      unlocked: planCount >= 5,
      color: "from-yellow-400 to-orange-500",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 16v4M9 20h6M8 4H5a1 1 0 0 0-1 1v2a5 5 0 0 0 3 4.58" />
          <path d="M16 4h3a1 1 0 0 1 1 1v2a5 5 0 0 1-3 4.58" />
          <path d="M8 4h8v6a4 4 0 0 1-8 0V4z" />
        </svg>
      ),
    },
    {
      id: "ten-plans",
      title: "Unstoppable",
      description: "Generated 10 or more study plans. You're a planner!",
      unlocked: planCount >= 10,
      color: "from-emerald-400 to-teal-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const progressPct = Math.round((unlockedCount / badges.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-5 py-7 sm:px-8">
      {/* Header */}
      <div className="mb-7 stagger-up">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Profile</p>
        <h1 className="display-font text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Profile & Milestones</h1>
        <p className="text-muted text-sm mt-2 leading-6">
          Track your journey, celebrate progress, and unlock badges as you grow.
        </p>
      </div>

      <div className="dashboard-card p-6 mb-6 flex items-center gap-5">
        <div className="size-16 rounded-full bg-accent text-white grid place-items-center text-lg font-black">
          {defaultUserProfile.initials}
        </div>
        <div>
          <p className="display-font text-2xl font-extrabold text-slate-900">{defaultUserProfile.fullName}</p>
          <p className="text-sm text-muted">{defaultUserProfile.major}</p>
          <p className="text-xs text-muted mt-1">Default profile is auto-loaded. Login input is bypassed for now.</p>
        </div>
      </div>

      {/* Progress + motivation */}
      <div className="grid sm:grid-cols-2 gap-5 mb-8 stagger-up">
        {/* Progress ring card */}
        <div className="dashboard-card p-6 flex items-center gap-6">
          <ProgressRing pct={progressPct} size={90} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Badge Progress</p>
            <p className="display-font text-3xl font-extrabold text-slate-900">
              {unlockedCount} <span className="text-muted text-xl font-semibold">/ {badges.length}</span>
            </p>
            <p className="text-sm text-muted mt-1">badges unlocked</p>
          </div>
        </div>

        {/* Plans count card */}
        <div className="dashboard-card p-6 flex items-center gap-5">
          <div className="size-16 rounded-2xl bg-accent-soft flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M8 2v3M16 2v3M3 9h18M8 13h2M14 13h2M8 17h2M14 17h2" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Study Plans Created</p>
            <p className="display-font text-4xl font-extrabold text-slate-900">{planCount}</p>
            <p className="text-sm text-muted mt-1">plans generated</p>
          </div>
        </div>
      </div>

      {/* Motivation button */}
      <div className="dashboard-card p-5 mb-8 stagger-up flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-strong mb-1">Daily Motivation</p>
          <p className="text-sm text-slate-700 leading-7">
            {motivationMsg ??
              "Hit the button to get a personalized motivational message from your AI coach!"}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMotivation}
          disabled={loadingMotivation}
          className="rounded-2xl bg-gradient-to-r from-accent to-blue-500 text-white px-5 py-3 text-sm font-bold transition hover:from-accent-strong hover:to-blue-600 disabled:opacity-60 shadow-md shadow-blue-200 whitespace-nowrap"
        >
          {loadingMotivation ? "Loading..." : "Get Motivated!"}
        </button>
      </div>

      {/* Badges grid */}
      <div>
        <h2 className="display-font text-xl font-bold text-slate-900 mb-4">All Badges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`dashboard-card p-5 flex items-start gap-4 transition-all ${
                badge.unlocked ? "" : "opacity-50 grayscale"
              }`}
            >
              {/* Icon circle */}
              <div
                className={`size-14 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shrink-0 shadow-md`}
              >
                {badge.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="display-font font-bold text-slate-900">{badge.title}</p>
                  {badge.unlocked ? (
                    <span className="text-xs font-bold bg-green-100 text-green-700 rounded-full px-2 py-0.5">Unlocked</span>
                  ) : (
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">Locked</span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1 leading-5">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study tips / rewards section */}
      <div className="mt-10">
        <h2 className="display-font text-xl font-bold text-slate-900 mb-4">Study Rewards</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { reward: "Unlock AI Insights", req: "Generate your first plan", pct: planCount >= 1 ? 100 : 0, color: "bg-blue-500" },
            { reward: "Coaching Notes", req: "Generate 3 plans", pct: Math.min(100, Math.round((planCount / 3) * 100)), color: "bg-purple-500" },
            { reward: "Master Planner Badge", req: "Generate 10 plans", pct: Math.min(100, Math.round((planCount / 10) * 100)), color: "bg-yellow-500" },
          ].map((item) => (
            <div key={item.reward} className="dashboard-card p-5">
              <p className="display-font font-bold text-slate-900 text-sm">{item.reward}</p>
              <p className="text-xs text-muted mt-1 mb-3">{item.req}</p>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <p className="text-xs font-bold text-muted mt-2">{item.pct}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
