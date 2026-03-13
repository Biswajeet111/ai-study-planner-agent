"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { defaultUserProfile } from "../lib/userProfile";

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
};

type ScheduleDoc = {
  _id: string;
  subjects?: Array<{ name: string }>;
  daily_plan?: Record<string, number>;
  weekly_schedule?: Record<string, Record<string, number>>;
};

const API_BASE = "http://127.0.0.1:8000";

const starterPrompts = [
  "Can you explain the key concepts of thermodynamics for my exam tomorrow?",
  "Give me a 5-question practice quiz on entropy.",
  "Summarize the most important formulas I should revise tonight.",
  "How should I split my last 4 hours before the exam?",
  "Ask me viva-style questions on second law and entropy.",
];

const resourceLibrary = [
  { title: "Thermo Fundamentals", meta: "PDF Guide • 1.2MB", icon: "book" },
  { title: "Laws of Physics Recap", meta: "Video • 14:20", icon: "video" },
  { title: "Entropy Quick Notes", meta: "Cheatsheet • 2 pages", icon: "note" },
];

function iconNode(icon: string) {
  if (icon === "video") {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
        <rect x="3" y="5" width="10" height="10" rx="2" />
        <path d="M13 8l4-2v8l-4-2" />
      </svg>
    );
  }
  if (icon === "note") {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
        <path d="M4 3h8l4 4v10H4z" />
        <path d="M12 3v4h4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
      <path d="M4 4h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V4z" />
      <path d="M6 4v12" />
    </svg>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      text: "Hello! I've analyzed your study plan. How can I help you stay on track today?",
    },
  ]);
  const [chatHistory, setChatHistory] = useState<string[]>([
    "Exam Prep 2024",
    "Physics Revision",
    "History Notes",
    "Essay Feedback",
    "Calculus Review",
  ]);
  const [activeSession, setActiveSession] = useState("Exam Prep 2024");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleDoc | null>(null);

  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/schedules`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1] as ScheduleDoc;
          setScheduleData(latest);
        }
      })
      .catch(() => {
        setScheduleData(null);
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const contextSubjects = useMemo(() => {
    if (!scheduleData?.daily_plan) {
      return scheduleData?.subjects?.map((s) => s.name) ?? [];
    }

    return Object.keys(scheduleData.daily_plan);
  }, [scheduleData]);

  const weeklyCompletion = useMemo(() => {
    const weekly = scheduleData?.weekly_schedule;
    if (!weekly) return 0;

    const subjectsPlanned = new Set<string>();
    Object.values(weekly).forEach((day) => {
      Object.keys(day).forEach((subject) => subjectsPlanned.add(subject));
    });

    if (!subjectsPlanned.size || !contextSubjects.length) return 0;
    return Math.min(100, Math.round((subjectsPlanned.size / Math.max(contextSubjects.length, 1)) * 100));
  }, [scheduleData, contextSubjects]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/study_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const payload = response.ok ? await response.json() : null;
      const answer = payload?.answer ?? payload?.response ?? "I couldn't get a response right now. Please try again.";

      const aiMessage: Message = {
        id: nextId.current++,
        role: "ai",
        text: String(answer),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "ai",
          text: "I can't reach the API right now. Please make sure backend is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const startNewSession = () => {
    const name = `Session ${chatHistory.length + 1}`;
    setActiveSession(name);
    setChatHistory((prev) => [name, ...prev]);
    setMessages([
      {
        id: 0,
        role: "ai",
        text: "New session started. Tell me your subject, exam date, and what you are struggling with.",
      },
    ]);
    nextId.current = 1;
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f6f5f8] dark:bg-[#0c0816] text-slate-900 dark:text-slate-100">
      <div className="flex h-full w-full overflow-hidden">
        <aside className="hidden 2xl:flex w-72 flex-col glass border-r border-purple-500/10 shrink-0 h-full">
          <div className="p-6 flex flex-col gap-6 h-full">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-0.5 rounded-full">
                <div className="size-10 rounded-full border-2 border-purple-500/50 bg-[#151022] grid place-items-center text-xs font-bold text-white">{defaultUserProfile.initials}</div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-100 text-sm font-semibold tracking-tight">StudyForge AI</h1>
                <span className="text-purple-300 text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full w-fit">Premium</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startNewSession}
              className="flex items-center justify-center gap-2 w-full bg-purple-500 hover:bg-purple-500/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M10 4v12M4 10h12" /></svg>
              <span className="text-sm">New Session</span>
            </button>

            <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-2 -mr-2 custom-scrollbar">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2 px-3">Recent Chats</p>
              {chatHistory.map((item) => {
                const isActive = item === activeSession;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveSession(item)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                      isActive
                        ? "bg-purple-500/20 text-slate-100 border border-purple-500/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={`w-5 h-5 ${isActive ? "text-purple-300" : ""}`}>
                      <path d="M17 11a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6z" />
                    </svg>
                    <p className="text-sm font-medium truncate">{item}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-purple-500/10">
              <button type="button" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M10 2v2" /><path d="M10 16v2" /><path d="M2 10h2" /><path d="M16 10h2" /><circle cx="10" cy="10" r="4" /></svg>
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button type="button" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><circle cx="10" cy="10" r="7" /><path d="M10 14v.01" /><path d="M8.5 8.5a1.8 1.8 0 1 1 3 1.3c-.9.6-1.5 1.1-1.5 2" /></svg>
                <span className="text-sm font-medium">Help Center</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative bg-[#f6f5f8] dark:bg-[#0c0816]">
          <header className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-purple-500/10 glass z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-purple-300"><path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" /></svg>
              </div>
              <div>
                <h2 className="text-slate-100 font-bold text-base">{activeSession}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-slate-500 text-[11px] font-medium">
                    {scheduleData ? "Synced with your latest study plan" : "No study plan found yet"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="p-2 text-slate-400 hover:text-purple-300 transition-colors hover:bg-purple-500/10 rounded-lg">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M10 3v9" /><path d="M7 6l3-3 3 3" /><rect x="4" y="11" width="12" height="6" rx="1" /></svg>
              </button>
              <button type="button" className="p-2 text-slate-400 hover:text-purple-300 transition-colors hover:bg-purple-500/10 rounded-lg">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><circle cx="10" cy="5" r="1.2" /><circle cx="10" cy="10" r="1.2" /><circle cx="10" cy="15" r="1.2" /></svg>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 max-w-4xl mx-auto w-full custom-scrollbar">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "ai" ? (
                  <div className="shrink-0 size-10 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" /></svg>
                  </div>
                ) : null}

                <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === "user" ? "items-end" : ""}`}>
                  <p className={`text-[11px] font-bold tracking-wider uppercase ${message.role === "user" ? "text-slate-500 pr-1" : "text-purple-300 pl-1"}`}>
                    {message.role === "user" ? "You" : "StudyForge AI"}
                  </p>
                  <div
                    className={`${
                      message.role === "user"
                        ? "bg-purple-500 text-white rounded-2xl rounded-tr-none"
                        : "bg-slate-800/50 border border-purple-500/10 text-slate-200 rounded-2xl rounded-tl-none"
                    } p-5 text-[15px] leading-relaxed message-shadow whitespace-pre-wrap`}
                  >
                    {message.text}
                  </div>

                  {message.role === "ai" && messages[messages.length - 1]?.id === message.id && !loading ? (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button type="button" onClick={() => void sendMessage("Yes, start the quiz")}
                        className="px-4 py-2 bg-slate-800/40 border border-purple-500/10 rounded-full text-xs font-medium text-slate-300 hover:bg-purple-500/20 hover:border-purple-500 transition-all">
                        Yes, start the quiz
                      </button>
                      <button type="button" onClick={() => void sendMessage("Explain entropy deeper")}
                        className="px-4 py-2 bg-slate-800/40 border border-purple-500/10 rounded-full text-xs font-medium text-slate-300 hover:bg-purple-500/20 hover:border-purple-500 transition-all">
                        Explain entropy deeper
                      </button>
                    </div>
                  ) : null}
                </div>

                {message.role === "user" ? (
                  <div className="shrink-0 size-10 rounded-xl bg-slate-700 p-0.5 grid place-items-center text-xs font-bold text-white">{defaultUserProfile.initials}</div>
                ) : null}
              </div>
            ))}

            {loading ? (
              <div className="flex gap-4">
                <div className="shrink-0 size-10 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 1l2.2 5 5.3.6-3.9 3.6 1 5.2-4.6-2.5-4.6 2.5 1-5.2L2.5 6.6 7.8 6 10 1z" /></svg>
                </div>
                <div className="bg-slate-800/50 border border-purple-500/10 rounded-2xl rounded-tl-none p-4 text-slate-300 message-shadow">
                  <span className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            ) : null}

            <div ref={scrollRef} />
          </div>

          <div className="p-6 max-w-4xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-purple-600/30 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000" />
              <div className="relative bg-[#1a142e] border border-purple-500/20 rounded-2xl flex items-end p-2 pr-4 shadow-2xl">
                <button type="button" className="p-3 text-slate-500 hover:text-purple-300 transition-colors">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><path d="M11.5 8.5l-4 4a2 2 0 1 1-2.8-2.8l5.2-5.2a3.5 3.5 0 1 1 5 5L8.8 15.7" /></svg>
                </button>
                <textarea
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-200 text-sm py-3 px-2 resize-none max-h-40 placeholder-slate-500"
                  placeholder="Ask me anything about your study plan..."
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={loading}
                />
                <div className="flex items-center gap-2 pb-1.5">
                  <button type="button" className="p-2.5 text-slate-500 hover:text-purple-300 transition-colors">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5"><rect x="7" y="3" width="6" height="10" rx="3" /><path d="M5 9a5 5 0 0 0 10 0" /><path d="M10 14v3" /></svg>
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-purple-500 hover:bg-purple-500/90 disabled:opacity-60 text-white size-10 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-purple-500/30"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3 10l13-6-3 6 3 6-13-6z" /></svg>
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-3 flex gap-2 flex-wrap">
              {starterPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="px-3 py-1.5 bg-slate-800/30 border border-purple-500/10 rounded-full text-[11px] font-medium text-slate-300 hover:bg-purple-500/20 hover:border-purple-500 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-600 mt-4 tracking-wide">
              StudyForge AI can make mistakes. Verify important information with your textbooks.
            </p>
          </div>
        </main>

        <aside className="w-80 flex-col glass border-l border-purple-500/10 shrink-0 h-full hidden xl:flex">
          <div className="p-6 flex flex-col gap-6 h-full">
            <div>
              <h3 className="text-slate-100 font-bold text-sm mb-4">Study Plan Context</h3>
              <div className="space-y-3">
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-purple-300">{contextSubjects[0] ?? "Physics Unit 4"}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{weeklyCompletion}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${weeklyCompletion}%` }} />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-300 mb-2">Upcoming Deadline</h4>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><rect x="3" y="4" width="14" height="13" rx="2" /><path d="M7 2v3M13 2v3M3 8h14" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-200">Final Physics Exam</p>
                      <p className="text-[10px] text-slate-500">Tomorrow at 09:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-slate-100 font-bold text-sm mb-4">Recommended Resources</h3>
              <div className="space-y-3">
                {resourceLibrary.map((resource) => (
                  <div key={resource.title} className="group flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                    <div className="size-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-purple-300">
                      {iconNode(resource.icon)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{resource.title}</p>
                      <p className="text-[10px] text-slate-500">{resource.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/20 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-purple-300 uppercase mb-1">Weekly Goal</p>
                  <h4 className="text-xs font-bold text-slate-100 mb-3">Master Thermodynamics</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{Math.max(1, Math.round((weeklyCompletion / 20) || 4))}/5 Chapters read</span>
                    <span className="text-[10px] font-bold text-slate-200">{weeklyCompletion}%</span>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-20 h-20"><path d="M10 2l2.4 4.9L18 8l-4 3.9.9 5.4L10 14.8 5.1 17.3 6 11.9 2 8l5.6-1.1L10 2z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
