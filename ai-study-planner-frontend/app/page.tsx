"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StudyBuddy from "./components/StudyBuddy";

const features = [
  {
    title: "AI Study Planner",
    description: "Automatically create schedules based on your subjects, strengths, and available study hours.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v3M16 2v3M3 9h18" />
      </svg>
    ),
  },
  {
    title: "ML Performance Prediction",
    description: "Estimate your performance trend from study habits, sleep, and practice consistency.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "AI Study Insights",
    description: "Get concise coaching points to improve focus, retention, and weekly outcomes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2a6.5 6.5 0 0 0-4 11.7V17a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3.3A6.5 6.5 0 0 0 14.5 2h-5z" />
        <path d="M9 22h6" />
      </svg>
    ),
  },
  {
    title: "Progress Tracking",
    description: "Monitor your daily consistency and review where your plan needs adjustment.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="20" x2="20" y2="20" />
        <rect x="6" y="12" width="3" height="8" />
        <rect x="11" y="8" width="3" height="12" />
        <rect x="16" y="5" width="3" height="15" />
      </svg>
    ),
  },
  {
    title: "Gamified Milestones",
    description: "Stay motivated with streaks, badges, and rewards as you complete study targets.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16v4M9 20h6" />
        <path d="M8 4H5a1 1 0 0 0-1 1v2a5 5 0 0 0 4 4.58" />
        <path d="M16 4h3a1 1 0 0 1 1 1v2a5 5 0 0 1-4 4.58" />
        <path d="M8 4h8v6a4 4 0 0 1-8 0V4z" />
      </svg>
    ),
  },
  {
    title: "AI Chat Assistant",
    description: "Ask questions instantly and get practical study help tailored to your plan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 14a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8z" />
      </svg>
    ),
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://studyforge-api-ma0b.onrender.com";

type ScheduleDoc = {
  _id: string;
  daily_hours?: number;
  priority_analysis?: Array<{ predicted_score?: number }>;
};

export default function LandingPage() {
  const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/schedules`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        setSchedules(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setSchedules([]);
      });
  }, []);

  const stats = useMemo(() => {
    const activeStudents = schedules.length;
    const hoursOptimized = schedules.reduce((sum, row) => sum + Number(row.daily_hours || 0), 0);

    const allPredictions = schedules.flatMap((row) =>
      (row.priority_analysis ?? [])
        .map((item) => Number(item.predicted_score || 0))
        .filter((value) => Number.isFinite(value)),
    );

    const avgPredicted = allPredictions.length
      ? Math.round((allPredictions.reduce((a, b) => a + b, 0) / allPredictions.length) * 10) / 10
      : 0;

    return [
      {
        label: "Active Students",
        value: String(activeStudents),
        trend: `${activeStudents} plan records`,
      },
      {
        label: "Hours Optimized",
        value: `${Math.round(hoursOptimized * 10) / 10}h`,
        trend: "from generated schedules",
      },
      {
        label: "Avg Grade Boost",
        value: `${avgPredicted}%`,
        trend: "predicted score trend",
      },
    ];
  }, [schedules]);

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-blue-100/70 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-16 px-5 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-accent text-white grid place-items-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10 1l2.5 5.5L18 8l-4 3.8.9 5.2L10 14.5 5.1 17l.9-5.2L2 8l5.5-1.5L10 1z" />
              </svg>
            </div>
            <span className="display-font font-extrabold tracking-tight text-lg">StudyForge AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-accent transition">Features</a>
            <a href="#stats" className="hover:text-accent transition">Stats</a>
            <a href="#cta" className="hover:text-accent transition">Get Started</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-accent hover:text-accent transition">
              Login
            </Link>
            <Link href="/dashboard" className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-strong transition shadow-md shadow-blue-200">
              Start Planning
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 px-5 sm:px-8 overflow-hidden">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[740px] h-[420px] bg-blue-200/60 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-strong">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                New: Adaptive Planner v2
              </p>
              <h1 className="display-font mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-slate-900">
                Adaptive AI
                <br className="hidden lg:block" />
                Study Planner
              </h1>
              <p className="mt-4 max-w-xl mx-auto lg:mx-0 text-lg text-slate-600 leading-8">
                Personalized planning with smart workload balancing, performance forecasting,
                and AI coaching to help you study with less stress and better results.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/dashboard" className="h-13 px-7 rounded-xl bg-accent hover:bg-accent-strong text-white text-base font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200">
                  Start Planning
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="/dashboard" className="h-13 px-7 rounded-xl bg-white border border-blue-200 text-base font-semibold flex items-center justify-center hover:border-accent hover:text-accent transition">
                  Explore Demo Dashboard
                </Link>
              </div>

              <p className="mt-4 text-sm text-slate-500">Joined by 50,000+ students</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-300/30 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl bg-white/90 border border-blue-100 p-5 sm:p-7 shadow-2xl">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 p-5 mb-4">
                  <p className="text-xs uppercase tracking-widest font-bold text-accent-strong">Prediction</p>
                  <p className="display-font text-3xl font-black text-slate-900 mt-2">94% Success Rate</p>
                  <p className="text-sm text-slate-600 mt-1">Based on your consistency and revision patterns</p>
                </div>
                <StudyBuddy className="mx-auto h-64 sm:h-72 w-auto" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 px-5 sm:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="display-font text-3xl sm:text-4xl font-black tracking-tight">Powerful Features for Smarter Learning</h2>
              <p className="mt-3 text-slate-600 text-lg leading-8">
                Everything you need to plan, track, and improve your study performance in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-blue-100 bg-[#fbfdff] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="size-12 rounded-xl bg-blue-100 text-accent grid place-items-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="display-font text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-7">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="stats" className="py-16 px-5 sm:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="display-font text-4xl font-black mt-2 text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-green-600">{stat.trend}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="cta" className="py-20 px-5 sm:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/70 to-indigo-100/70" />
          <div className="max-w-4xl mx-auto text-center relative">
            <h2 className="display-font text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
              Ready to transform your study routine?
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-8">
              Join thousands of students using StudyForge AI to study smarter and score higher.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto px-10 h-14 bg-accent hover:bg-accent-strong text-white text-lg font-bold rounded-xl transition shadow-xl shadow-blue-200 inline-flex items-center justify-center">
                Start Planning Now
              </Link>
              <p className="text-sm text-slate-600 font-medium italic">No credit card required</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-blue-100 py-10 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-5 md:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-accent text-white grid place-items-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 1l2.5 5.5L18 8l-4 3.8.9 5.2L10 14.5 5.1 17l.9-5.2L2 8l5.5-1.5L10 1z" />
              </svg>
            </div>
            <span className="text-sm font-bold">StudyForge AI</span>
          </div>

          <div className="flex gap-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <a href="#" className="hover:text-accent transition">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition">Terms</a>
            <a href="#" className="hover:text-accent transition">Support</a>
          </div>
        </div>

        <p className="max-w-7xl mx-auto mt-6 pt-6 border-t border-blue-100 text-center text-xs text-slate-500">
          © 2026 StudyForge AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
