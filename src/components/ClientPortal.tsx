"use client";

import { useState } from "react";
import {
  MessageSquare,
  X,
  Send,
  Check,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";

/* ─── Mock Data ──────────────────────────────────────────────── */

const proposal = {
  title: "Website Redesign Proposal",
  client: "Acme Corp",
  from: "Studio Craft",
  date: "March 15, 2026",
  status: "Sent" as const,
};

const deliverables = [
  "Discovery workshop and stakeholder interviews (2 sessions)",
  "Competitive audit and UX benchmarking report",
  "Information architecture and sitemap revision",
  "Wireframes for 8 core page templates",
  "High-fidelity UI design (desktop + mobile) in Figma",
  "Interactive prototype for user-testing",
  "Front-end development (Next.js + Tailwind CSS)",
  "CMS integration with content migration",
  "QA testing across browsers and devices",
  "Launch support and 30-day post-launch warranty",
];

const timeline = [
  {
    phase: "Discovery & Research",
    start: "Mar 18",
    end: "Apr 4",
    offset: 0,
    width: 18,
    color: "var(--color-accent)",
  },
  {
    phase: "UX & Wireframes",
    start: "Apr 7",
    end: "Apr 25",
    offset: 20,
    width: 20,
    color: "var(--color-accent)",
  },
  {
    phase: "Visual Design",
    start: "Apr 28",
    end: "May 23",
    offset: 42,
    width: 26,
    color: "var(--color-warning)",
  },
  {
    phase: "Development",
    start: "May 26",
    end: "Jun 27",
    offset: 55,
    width: 34,
    color: "var(--color-accent)",
  },
  {
    phase: "QA & Launch",
    start: "Jun 30",
    end: "Jul 11",
    offset: 90,
    width: 10,
    color: "var(--color-success)",
  },
];

const pricingItems = [
  {
    item: "Discovery & Research",
    description: "Workshops, audit, and IA",
    amount: 2000,
    optional: false,
  },
  {
    item: "UX Design",
    description: "Wireframes and prototype",
    amount: 2500,
    optional: false,
  },
  {
    item: "Visual Design",
    description: "High-fidelity UI, desktop + mobile",
    amount: 3000,
    optional: false,
  },
  {
    item: "Front-end Development",
    description: "Next.js build with CMS",
    amount: 3500,
    optional: false,
  },
  {
    item: "QA & Launch",
    description: "Testing, migration, deployment",
    amount: 1500,
    optional: false,
  },
  {
    item: "SEO Audit & Optimization",
    description: "Technical SEO and meta setup",
    amount: 800,
    optional: true,
  },
  {
    item: "Analytics Setup",
    description: "GA4, events, dashboards",
    amount: 500,
    optional: true,
  },
];

const milestones = [
  {
    label: "Upon signing",
    percent: 50,
    amount: 6250,
    date: "Mar 18, 2026",
    icon: FileText,
  },
  {
    label: "Design approval",
    percent: 25,
    amount: 3125,
    date: "May 23, 2026",
    icon: Check,
  },
  {
    label: "Final delivery",
    percent: 25,
    amount: 3125,
    date: "Jul 11, 2026",
    icon: ChevronRight,
  },
];

type SectionKey = "scope" | "timeline" | "pricing" | "payment";

const commentsBySection: Record<
  SectionKey,
  { author: string; role: "client" | "agency"; text: string; time: string }[]
> = {
  scope: [
    {
      author: "Sarah Chen",
      role: "client",
      text: "Can you clarify what's included in the content migration?",
      time: "2h ago",
    },
    {
      author: "Studio Craft",
      role: "agency",
      text: "We'll migrate up to 50 pages of existing content, reformatting as needed for the new templates.",
      time: "1h ago",
    },
  ],
  timeline: [
    {
      author: "Sarah Chen",
      role: "client",
      text: "Is there any flexibility on the launch date?",
      time: "3h ago",
    },
  ],
  pricing: [],
  payment: [
    {
      author: "Sarah Chen",
      role: "client",
      text: "Can the first milestone be net-15 instead of upfront?",
      time: "5h ago",
    },
    {
      author: "Studio Craft",
      role: "agency",
      text: "We can do net-7 to keep things moving. Does that work?",
      time: "4h ago",
    },
    {
      author: "Sarah Chen",
      role: "client",
      text: "That works for us. Thanks!",
      time: "3h ago",
    },
  ],
};

/* ─── Helpers ────────────────────────────────────────────────── */

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const subtotal = pricingItems.reduce((s, i) => s + i.amount, 0);
const tax = Math.round(subtotal * 0.0);
const total = subtotal + tax;

/* ─── Comment Indicator ──────────────────────────────────────── */

function CommentIndicator({
  section,
  count,
  activeSection,
  onOpen,
}: {
  section: SectionKey;
  count: number;
  activeSection: SectionKey | null;
  onOpen: (s: SectionKey) => void;
}) {
  const isActive = activeSection === section;
  return (
    <button
      type="button"
      onClick={() => onOpen(section)}
      aria-label={`${count} comments on ${section} section`}
      className={`
        absolute -right-14 top-2 flex items-center gap-1.5
        rounded-full px-2.5 py-1.5
        text-[12px] font-medium select-none
        cursor-pointer
        transition-all duration-[120ms] ease-out
        ${
          isActive
            ? "bg-accent text-on-accent shadow-sm"
            : "bg-surface-alt text-text-muted"
        }
      `}
    >
      <MessageSquare size={14} strokeWidth={1.75} aria-hidden="true" />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </button>
  );
}

/* ─── Comment Panel ──────────────────────────────────────────── */

function CommentPanel({
  section,
  onClose,
}: {
  section: SectionKey;
  onClose: () => void;
}) {
  const [newComment, setNewComment] = useState("");
  const comments = commentsBySection[section];
  const sectionLabel =
    section === "scope"
      ? "Scope of Work"
      : section === "timeline"
        ? "Timeline"
        : section === "pricing"
          ? "Pricing"
          : "Payment Schedule";

  return (
    <div
      className="comment-panel-enter fixed top-0 right-0 z-50 flex h-dvh w-[360px] flex-col border-l border-border bg-surface shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Comments
          </p>
          <p className="mt-0.5 text-[14px] font-medium text-text-primary">
            {sectionLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close comments"
          className="
            flex h-8 w-8 items-center justify-center rounded-lg
            text-text-muted cursor-pointer select-none
            transition-colors duration-[120ms] ease-out
          "
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare
              size={32}
              strokeWidth={1.25}
              className="mb-3 text-text-muted"
              aria-hidden="true"
            />
            <p className="text-[14px] text-text-muted">
              No comments yet on this section.
            </p>
            <p className="mt-1 text-[12px] text-text-muted">
              Start a conversation below.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((c, i) => (
              <div
                key={i}
                className={`comment-stagger flex flex-col gap-1 ${
                  c.role === "agency" ? "items-end" : "items-start"
                }`}
                style={{ animationDelay: `${80 + i * 40}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-text-primary">
                    {c.author}
                  </span>
                  <span className="text-[11px] text-text-muted">{c.time}</span>
                </div>
                <div
                  className={`
                    max-w-[280px] rounded-xl px-3.5 py-2.5
                    text-[14px] leading-relaxed
                    ${
                      c.role === "agency"
                        ? "bg-accent text-on-accent rounded-br-sm"
                        : "bg-surface-alt text-text-primary rounded-bl-sm"
                    }
                  `}
                >
                  {c.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="border-t border-border px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          setNewComment("");
        }}
      >
        <div className="flex items-center gap-2">
          <label htmlFor={`comment-input-${section}`} className="sr-only">
            Add a comment
          </label>
          <input
            id={`comment-input-${section}`}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave a comment..."
            className="
              flex-1 rounded-lg border border-border bg-surface-alt
              px-3 py-2.5 text-[14px] text-text-primary
              placeholder:text-text-muted
              transition-shadow duration-[120ms] ease-out
              focus-visible:outline-none
              focus-visible:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-accent)]
            "
            style={{ fontSize: "16px" }}
          />
          <button
            type="submit"
            aria-label="Send comment"
            disabled={!newComment.trim()}
            className="
              flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
              bg-accent text-on-accent
              cursor-pointer select-none
              transition-colors duration-[120ms] ease-out
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

export function ClientPortal() {
  const [activeComments, setActiveComments] = useState<SectionKey | null>(null);

  function toggleComments(section: SectionKey) {
    setActiveComments((prev) => (prev === section ? null : section));
  }

  return (
    <>
      {/* ── Backdrop for comment panel ── */}
      {activeComments && (
        <div
          className="comment-backdrop-enter fixed inset-0 z-40 bg-[rgba(26,26,23,0.12)]"
          onClick={() => setActiveComments(null)}
          aria-hidden="true"
          style={{ pointerEvents: "auto" }}
        />
      )}

      {/* ── Comment panel ── */}
      {activeComments && (
        <CommentPanel
          section={activeComments}
          onClose={() => setActiveComments(null)}
        />
      )}

      <div className="min-h-dvh bg-background pb-28">
        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[800px] items-center justify-center px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="font-heading text-[18px] font-bold tracking-tight text-text-primary">
                DealCraft
              </span>
              <span
                className="
                  rounded-full px-2.5 py-0.5
                  text-[11px] font-semibold uppercase tracking-wide
                  select-none
                "
                style={{
                  backgroundColor: "var(--color-accent-subtle)",
                  color: "var(--color-accent-text)",
                }}
              >
                {proposal.status}
              </span>
            </div>
          </div>
        </header>

        {/* ── Proposal Content ── */}
        <main className="mx-auto max-w-[680px] px-6 pt-12">
          {/* Cover Section */}
          <section className="portal-section pb-12 text-center" style={{ animationDelay: "0ms" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
              Proposal
            </p>
            <h1
              className="mt-4 font-heading font-bold text-text-primary"
              style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
            >
              {proposal.title}
            </h1>
            <p className="mt-4 text-[16px] text-text-secondary">
              Prepared for{" "}
              <span className="font-medium text-text-primary">
                {proposal.client}
              </span>
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[14px] text-text-muted">
              <span>{proposal.date}</span>
              <span aria-hidden="true" className="text-border-strong">
                /
              </span>
              <span>{proposal.from}</span>
            </div>

            <div
              className="mx-auto mt-10 h-px w-16"
              style={{ backgroundColor: "var(--color-border-strong)" }}
              aria-hidden="true"
            />
          </section>

          {/* Scope of Work */}
          <section
            className="portal-section relative pb-12"
            style={{ animationDelay: "40ms" }}
          >
            <CommentIndicator
              section="scope"
              count={commentsBySection.scope.length}
              activeSection={activeComments}
              onOpen={toggleComments}
            />
            <h2
              className="font-heading font-semibold text-text-primary"
              style={{ fontSize: "clamp(22px, 3vw, 28px)" }}
            >
              Scope of Work
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">
              The following deliverables are included in this engagement. Each
              phase builds on the previous, ensuring alignment at every step.
            </p>
            <ul className="mt-6 space-y-3">
              {deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-text-primary"
                >
                  <span
                    className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--color-accent)" }}
                    aria-hidden="true"
                  />
                  {d}
                </li>
              ))}
            </ul>
          </section>

          {/* Timeline */}
          <section
            className="portal-section relative pb-12"
            style={{ animationDelay: "80ms" }}
          >
            <CommentIndicator
              section="timeline"
              count={commentsBySection.timeline.length}
              activeSection={activeComments}
              onOpen={toggleComments}
            />
            <h2
              className="font-heading font-semibold text-text-primary"
              style={{ fontSize: "clamp(22px, 3vw, 28px)" }}
            >
              Timeline
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">
              Estimated project duration of 17 weeks from kick-off to launch.
            </p>
            <div className="mt-8 space-y-5">
              {timeline.map((phase, i) => (
                <div key={i} className="timeline-bar" style={{ animationDelay: `${120 + i * 40}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-text-primary">
                      {phase.phase}
                    </span>
                    <span
                      className="text-[12px] text-text-muted"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {phase.start} - {phase.end}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2.5 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "var(--color-surface-alt)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: phase.color,
                        width: `${phase.width}%`,
                        marginLeft: `${phase.offset}%`,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Table */}
          <section
            className="portal-section relative pb-12"
            style={{ animationDelay: "120ms" }}
          >
            <CommentIndicator
              section="pricing"
              count={commentsBySection.pricing.length}
              activeSection={activeComments}
              onOpen={toggleComments}
            />
            <h2
              className="font-heading font-semibold text-text-primary"
              style={{ fontSize: "clamp(22px, 3vw, 28px)" }}
            >
              Pricing
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">
              All prices are in USD. Optional items can be added at any time.
            </p>

            <div
              className="mt-8 overflow-hidden rounded-xl border border-border"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-surface-alt">
                    <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                      Item
                    </th>
                    <th className="hidden px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-text-muted sm:table-cell">
                      Description
                    </th>
                    <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingItems.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        i < pricingItems.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-[14px] font-medium text-text-primary">
                          {row.item}
                        </span>
                        {row.optional && (
                          <span
                            className="ml-2 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: "var(--color-accent-subtle)",
                              color: "var(--color-accent-text)",
                            }}
                          >
                            Optional
                          </span>
                        )}
                        <span className="mt-0.5 block text-[13px] text-text-muted sm:hidden">
                          {row.description}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-[14px] text-text-secondary sm:table-cell">
                        {row.description}
                      </td>
                      <td
                        className="px-5 py-3.5 text-right text-[14px] font-medium text-text-primary"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-border bg-surface-alt px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-text-secondary">
                    Subtotal
                  </span>
                  <span
                    className="text-[14px] font-medium text-text-primary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[14px] text-text-secondary">
                      Tax
                    </span>
                    <span
                      className="text-[14px] text-text-primary"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(tax)}
                    </span>
                  </div>
                )}
                <div
                  className="mt-3 flex items-center justify-between border-t pt-3"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span className="text-[16px] font-semibold text-text-primary">
                    Total
                  </span>
                  <span
                    className="text-[20px] font-bold"
                    style={{
                      color: "var(--color-accent)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Schedule */}
          <section
            className="portal-section relative pb-12"
            style={{ animationDelay: "160ms" }}
          >
            <CommentIndicator
              section="payment"
              count={commentsBySection.payment.length}
              activeSection={activeComments}
              onOpen={toggleComments}
            />
            <h2
              className="font-heading font-semibold text-text-primary"
              style={{ fontSize: "clamp(22px, 3vw, 28px)" }}
            >
              Payment Schedule
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">
              Payments are split across three milestones to align with project
              progress.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {milestones.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={i}
                    className="milestone-card rounded-xl border border-border bg-surface p-5"
                    style={{
                      boxShadow: "var(--shadow-sm)",
                      animationDelay: `${200 + i * 40}ms`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: "var(--color-accent-subtle)",
                        }}
                      >
                        <Icon
                          size={14}
                          strokeWidth={2}
                          style={{ color: "var(--color-accent)" }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                        {m.percent}%
                      </span>
                    </div>
                    <p
                      className="mt-3 text-[22px] font-bold text-text-primary"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(m.amount)}
                    </p>
                    <p className="mt-1 text-[14px] font-medium text-text-primary">
                      {m.label}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[12px] text-text-muted">
                      <Clock size={12} strokeWidth={1.75} aria-hidden="true" />
                      <span>{m.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* E-Signature Section */}
          <section
            className="portal-section pb-12"
            style={{ animationDelay: "200ms" }}
          >
            <div
              className="rounded-xl border border-border bg-surface p-8"
              style={{ boxShadow: "var(--shadow-paper)" }}
            >
              <h2
                className="font-heading font-semibold text-text-primary"
                style={{ fontSize: "clamp(22px, 3vw, 28px)" }}
              >
                Accept This Proposal
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                By signing below, you agree to the scope, timeline, and pricing
                outlined in this proposal.
              </p>

              <form
                className="mt-8 space-y-6"
                onSubmit={(e) => e.preventDefault()}
              >
                {/* Signature */}
                <div>
                  <label
                    htmlFor="sig-name"
                    className="block text-[12px] font-semibold uppercase tracking-wide text-text-muted"
                  >
                    Full Name
                  </label>
                  <input
                    id="sig-name"
                    type="text"
                    placeholder="Sarah Chen"
                    className="
                      mt-2 w-full border-b-2 bg-transparent
                      pb-2 text-[18px] font-heading text-text-primary
                      placeholder:text-text-muted/40
                      transition-shadow duration-[120ms] ease-out
                      focus-visible:outline-none
                      focus-visible:shadow-[0_2px_0_0_var(--color-accent)]
                    "
                    style={{
                      borderColor: "var(--color-border-strong)",
                      fontSize: "18px",
                    }}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sig-email"
                      className="block text-[12px] font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Email
                    </label>
                    <input
                      id="sig-email"
                      type="email"
                      placeholder="sarah@acmecorp.com"
                      className="
                        mt-2 w-full rounded-lg border border-border bg-surface-alt
                        px-3 py-2.5 text-text-primary
                        placeholder:text-text-muted/40
                        transition-shadow duration-[120ms] ease-out
                        focus-visible:outline-none
                        focus-visible:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-accent)]
                      "
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sig-date"
                      className="block text-[12px] font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Date
                    </label>
                    <input
                      id="sig-date"
                      type="text"
                      value="March 15, 2026"
                      readOnly
                      className="
                        mt-2 w-full rounded-lg border border-border bg-surface-alt
                        px-3 py-2.5 text-text-primary
                        cursor-default
                      "
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="sig-terms"
                    type="checkbox"
                    className="
                      mt-0.5 h-4 w-4 shrink-0 rounded
                      border-border accent-accent
                      cursor-pointer
                    "
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                  <label
                    htmlFor="sig-terms"
                    className="text-[14px] leading-relaxed text-text-secondary cursor-pointer select-none"
                  >
                    I have read and agree to the{" "}
                    <span
                      className="font-medium underline underline-offset-2"
                      style={{ color: "var(--color-accent-text)" }}
                    >
                      Terms & Conditions
                    </span>{" "}
                    and authorize Studio Craft to begin work upon receipt of the
                    first milestone payment.
                  </label>
                </div>
              </form>
            </div>
          </section>
        </main>

        {/* ── Sticky Bottom Bar ── */}
        <div
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface"
          style={{ boxShadow: "0 -4px 24px rgba(26,26,23,0.06)" }}
        >
          <div className="mx-auto flex max-w-[800px] items-center justify-between px-6 py-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
                Proposal Total
              </p>
              <p
                className="text-[22px] font-bold text-text-primary"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatCurrency(total)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="
                  rounded-lg border border-border
                  px-5 py-2.5 text-[14px] font-medium text-text-secondary
                  cursor-pointer select-none
                  transition-colors duration-[120ms] ease-out
                "
              >
                Decline
              </button>
              <button
                type="button"
                className="
                  rounded-lg
                  px-6 py-2.5 text-[14px] font-semibold text-on-accent
                  shadow-sm cursor-pointer select-none
                  transition-[background-color,transform] duration-[120ms] ease-out
                "
                style={{
                  backgroundColor: "var(--color-accent)",
                }}
              >
                Accept Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
