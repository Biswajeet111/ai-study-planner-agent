"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StudyBuddy from "../components/StudyBuddy";
import { defaultUserProfile } from "../lib/userProfile";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f6f9ff] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6">
        <section className="rounded-3xl bg-white border border-blue-100 p-7 sm:p-10 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Auto Sign-In Enabled</p>
          <h1 className="display-font text-3xl sm:text-4xl font-black text-slate-900 mt-2">Redirecting to Dashboard</h1>
          <p className="text-sm text-slate-600 leading-7 mt-3">
            Sign-in is bypassed for now. You are continuing as {defaultUserProfile.fullName}.
          </p>

          <div className="mt-7 space-y-4">
            <Link
              href="/dashboard"
              className="w-full h-12 rounded-xl bg-accent hover:bg-accent-strong text-white font-bold inline-flex items-center justify-center transition shadow-md shadow-blue-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>

        <aside className="rounded-3xl hero-gradient border border-blue-100 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <StudyBuddy className="h-64 w-auto mb-4" />
          <h2 className="display-font text-2xl font-black text-slate-900">Your AI Study Buddy Is Ready</h2>
          <p className="mt-2 text-sm text-slate-600 leading-7 max-w-sm">
            Build adaptive schedules, ask questions in chat, and hit your goals with confidence.
          </p>
          <div className="mt-5 flex gap-2 text-xs font-semibold text-slate-600 flex-wrap justify-center">
            <span className="rounded-full bg-white px-3 py-1 border border-blue-100">Smart Scheduling</span>
            <span className="rounded-full bg-white px-3 py-1 border border-blue-100">AI Insights</span>
            <span className="rounded-full bg-white px-3 py-1 border border-blue-100">Milestones</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
