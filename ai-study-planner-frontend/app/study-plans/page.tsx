"use client";

import { useEffect, useState } from "react";

type PriorityItem = {
  subject: string;
  predicted_score: number;
  risk: number;
  priority: number;
};

type StoredSchedule = {
  _id: string;
  daily_hours?: number;
  subjects?: Array<{ name: string }>;
  priority_analysis?: PriorityItem[];
  daily_plan?: Record<string, number>;
  ai_insights?: string;
  created_at?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://studyforge-api-ma0b.onrender.com";

function RiskPill({ risk }: { risk: number }) {
  if (risk >= 60)
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">High Risk</span>;
  if (risk >= 35)
    return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">Med Risk</span>;
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Low Risk</span>;
}

export default function StudyPlansPage() {
  const [plans, setPlans] = useState<StoredSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/schedules`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data) => setPlans(Array.isArray(data) ? data.slice().reverse() : []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load plans."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 py-7 sm:px-8">
      {/* Header */}
      <div className="mb-7 stagger-up">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Your History</p>
        <h1 className="display-font text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Study Plans</h1>
        <p className="text-muted text-sm mt-2 leading-6">
          All your previously generated study schedules are stored here. Review, compare, and track your progress.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-muted gap-4">
          <svg className="animate-spin w-10 h-10 text-accent" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#dde8f8" strokeWidth="4" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium">Loading your study plans...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="dashboard-card p-8 text-center">
          <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="w-8 h-8">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          </div>
          <p className="display-font text-xl font-bold text-slate-900 mb-2">Could Not Load Plans</p>
          <p className="text-muted text-sm">{error}</p>
          <p className="text-xs text-muted mt-2">Make sure the FastAPI backend is running on port 8000.</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && plans.length === 0 && (
        <div className="dashboard-card p-12 text-center">
          <div className="size-20 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" className="w-10 h-10">
              <path d="M12 7v10M12 7C12 5 10 4 6 4v10c4 0 6 1 6 3" strokeLinecap="round" />
              <path d="M12 7C12 5 14 4 18 4v10c-4 0-6 1-6 3" strokeLinecap="round" />
            </svg>
          </div>
          <p className="display-font text-2xl font-bold text-slate-900 mb-2">No Plans Yet</p>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            You haven&apos;t generated any study schedules yet. Head to the Schedule page to create your first plan!
          </p>
          <a
            href="/schedule"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-accent-strong transition shadow-md shadow-blue-200"
          >
            Create Your First Plan
          </a>
        </div>
      )}

      {/* Plans list */}
      {!loading && !error && plans.length > 0 && (
        <div className="space-y-5">
          <p className="text-sm text-muted font-semibold">{plans.length} plan{plans.length !== 1 ? "s" : ""} found</p>
          {plans.map((plan, idx) => {
            const subjectNames =
              plan.daily_plan
                ? Object.keys(plan.daily_plan)
                : plan.subjects?.map((s) => s.name) ?? [];
            const topPriority = plan.priority_analysis?.[0];
            const totalAllocated = plan.daily_plan
              ? Object.values(plan.daily_plan).reduce((s, h) => s + h, 0)
              : 0;

            return (
              <div key={plan._id} className="dashboard-card p-5 sm:p-6 stagger-up">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="size-7 rounded-lg bg-accent text-white text-xs font-bold grid place-items-center shrink-0">
                        {plans.length - idx}
                      </span>
                      <p className="display-font text-lg font-bold text-slate-900">
                        {subjectNames.length > 0 ? subjectNames.join(", ") : "Study Plan"}
                      </p>
                    </div>
                    {plan.created_at && (
                      <p className="text-xs text-muted mt-1">
                        Generated {new Date(plan.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {topPriority && <RiskPill risk={topPriority.risk} />}
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
                      {totalAllocated > 0 ? `${totalAllocated}h/day` : `${plan.daily_hours ?? "—"}h/day`}
                    </span>
                  </div>
                </div>

                {/* Subject breakdown */}
                {plan.daily_plan && Object.keys(plan.daily_plan).length > 0 && (
                  <div className="space-y-2 mb-4">
                    {Object.entries(plan.daily_plan).map(([subj, hrs]) => (
                      <div key={subj}>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>{subj}</span>
                          <span>{hrs}h</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-accent to-blue-300"
                            style={{ width: `${Math.min((hrs / Math.max(totalAllocated, 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Priority analysis mini table */}
                {plan.priority_analysis && plan.priority_analysis.length > 0 && (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-surface-soft text-muted uppercase tracking-wide">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Subject</th>
                          <th className="px-3 py-2 text-left font-semibold">Predicted Score</th>
                          <th className="px-3 py-2 text-left font-semibold">Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.priority_analysis.map((item) => (
                          <tr key={item.subject} className="border-t border-border text-slate-700">
                            <td className="px-3 py-2 font-semibold text-slate-900">{item.subject}</td>
                            <td className="px-3 py-2">{item.predicted_score.toFixed(1)}</td>
                            <td className="px-3 py-2"><RiskPill risk={item.risk} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* AI insights */}
                {plan.ai_insights && (
                  <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-xs leading-6 text-slate-700 border border-accent/15">
                    <span className="font-bold text-accent-strong">AI Insight: </span>
                    {plan.ai_insights}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
