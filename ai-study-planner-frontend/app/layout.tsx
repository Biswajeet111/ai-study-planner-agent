import type { Metadata } from "next";
import { Nunito, Sora } from "next/font/google";
import "./globals.css";
import AppShell from "./components/AppShell";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Study Planner",
  description: "Your personal AI-powered study planner — smart scheduling, risk analysis, and daily coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${nunito.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
