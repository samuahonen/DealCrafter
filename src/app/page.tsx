"use client";

import Link from "next/link";
import { ArrowRight, FileText, Download, Link2, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Nav */}
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
        <span className="font-heading text-[22px] font-bold tracking-tight text-text-primary">
          DealCraft
        </span>
        <Link
          href="/proposals"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[14px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover"
        >
          Open App
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1100px] px-6 pt-20 pb-16 text-center">
        <div className="animate-fade-in-up">
          <span className="inline-block rounded-full bg-accent-subtle px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-accent-text">
            Free & Open Source
          </span>
        </div>
        <h1
          className="animate-fade-in-up mt-6 font-heading font-bold text-text-primary"
          style={{ fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1.1, animationDelay: "40ms" }}
        >
          Beautiful proposals,<br />
          no sign-up required
        </h1>
        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-[560px] text-[18px] leading-relaxed text-text-secondary"
          style={{ animationDelay: "80ms" }}
        >
          Craft professional proposals with a drag-and-drop editor.
          Download as PDF or share with a link. Your data stays in your browser.
        </p>
        <div
          className="animate-fade-in-up mt-10 flex items-center justify-center gap-4"
          style={{ animationDelay: "120ms" }}
        >
          <Link
            href="/proposals"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-[16px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover"
          >
            <Sparkles size={18} strokeWidth={2} />
            Start Building
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-[16px] font-medium text-text-secondary transition-colors hover:bg-surface-alt"
            style={{ borderColor: "rgba(26,26,23,0.12)" }}
          >
            Browse Templates
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Block Editor",
              description: "Drag, drop, and edit blocks — cover page, scope, timeline, pricing, and signature. Click any block to edit inline.",
            },
            {
              icon: Download,
              title: "PDF Download",
              description: "Export your proposal as a clean PDF with one click. Uses your browser's print engine — no server needed.",
            },
            {
              icon: Link2,
              title: "Shareable Link",
              description: "Generate a link that contains your entire proposal. Anyone with the link can view it — no account required.",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="animate-fade-in-up rounded-2xl border bg-surface p-6"
                style={{
                  borderColor: "rgba(26,26,23,0.08)",
                  boxShadow: "var(--shadow-paper)",
                  animationDelay: `${200 + i * 60}ms`,
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(45,106,79,0.08)" }}
                >
                  <Icon size={20} strokeWidth={1.75} className="text-accent" />
                </div>
                <h3 className="mt-4 text-[18px] font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center" style={{ borderColor: "rgba(26,26,23,0.08)" }}>
        <p className="text-[13px] text-text-muted">
          DealCraft is open source. Your data never leaves your browser.
        </p>
      </footer>
    </div>
  );
}
