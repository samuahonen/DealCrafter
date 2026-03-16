"use client";

import { useState, useEffect } from "react";
import { FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  decodeProposalFromShare,
  formatCurrency,
  type Proposal,
  type CoverData,
  type ScopeData,
  type TimelineData,
  type PricingData,
  type SignatureData,
} from "@/lib/proposals";

export default function SharePage() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setError(true);
      setLoaded(true);
      return;
    }
    const decoded = decodeProposalFromShare(hash);
    if (decoded) {
      setProposal(decoded);
    } else {
      setError(true);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (error || !proposal) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6">
        <div className="text-center">
          <AlertCircle size={40} strokeWidth={1.5} className="mx-auto text-text-muted" />
          <h1 className="mt-4 font-heading text-[24px] font-bold text-text-primary">
            Invalid or expired link
          </h1>
          <p className="mt-2 text-[15px] text-text-secondary">
            This proposal link may be broken or no longer available.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover"
          >
            Go to DealCraft
          </Link>
        </div>
      </div>
    );
  }

  const pricingBlock = proposal.blocks.find((b) => b.type === "pricing");
  const pricingData = pricingBlock?.data as PricingData | undefined;
  let total = 0;
  if (pricingData) {
    for (let i = 0; i < pricingData.items.length; i++) {
      const row = pricingData.items[i];
      if (row.required || proposal.pricingToggles[i]) {
        total += row.qty * row.rate;
      }
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-28 print:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-[800px] items-center justify-center px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="font-heading text-[18px] font-bold tracking-tight text-text-primary">
              DealCraft
            </span>
            <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-text select-none">
              Proposal
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[680px] px-6 pt-12">
        {proposal.blocks.map((block, i) => (
          <section key={block.id} className="portal-section pb-10" style={{ animationDelay: `${i * 40}ms` }}>
            {block.type === "cover" && (() => {
              const d = block.data as CoverData;
              return (
                <div className="pb-8 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">Proposal</p>
                  <h1 className="mt-4 font-heading font-bold text-text-primary" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
                    {d.title}
                  </h1>
                  <p className="mt-4 text-[16px] text-text-secondary">
                    Prepared for <span className="font-medium text-text-primary">{d.subtitle || proposal.client}</span>
                  </p>
                  <p className="mt-2 text-[14px] text-text-muted">{d.date}</p>
                  <div className="mx-auto mt-10 h-px w-16" style={{ backgroundColor: "var(--color-border-strong)" }} />
                </div>
              );
            })()}

            {block.type === "scope" && (() => {
              const d = block.data as ScopeData;
              return (
                <>
                  <h2 className="font-heading font-semibold text-text-primary" style={{ fontSize: "clamp(22px, 3vw, 28px)" }}>
                    {d.heading}
                  </h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">{d.description}</p>
                  <ul className="mt-6 space-y-3">
                    {d.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed text-text-primary">
                        <span className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              );
            })()}

            {block.type === "timeline" && (() => {
              const d = block.data as TimelineData;
              const weeks = Array.from({ length: d.totalWeeks }, (_, i) => i);
              return (
                <>
                  <h2 className="font-heading font-semibold text-text-primary" style={{ fontSize: "clamp(22px, 3vw, 28px)" }}>
                    {d.heading}
                  </h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">{d.description}</p>
                  <div className="mt-6 overflow-x-auto">
                    <div style={{ minWidth: "480px" }}>
                      <div className="flex items-center">
                        <div className="w-[140px] shrink-0" />
                        <div className="flex flex-1">
                          {weeks.map((w) => (
                            <div key={w} className="flex-1 text-center text-[10px] font-medium uppercase tracking-wide text-text-muted">W{w + 1}</div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {d.tasks.map((task, j) => (
                          <div key={j} className="flex items-center">
                            <div className="w-[140px] shrink-0 pr-3 text-[13px] font-medium text-text-primary">{task.name}</div>
                            <div className="relative flex flex-1">
                              {weeks.map((w) => (
                                <div key={w} className="flex-1 border-l" style={{ borderColor: "rgba(26,26,23,0.06)", height: "24px" }} />
                              ))}
                              <div
                                className="absolute top-[3px] rounded-[3px]"
                                style={{
                                  left: `${(task.start / d.totalWeeks) * 100}%`,
                                  width: `${(task.duration / d.totalWeeks) * 100}%`,
                                  height: "18px",
                                  background: task.color,
                                  opacity: 0.85,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {block.type === "pricing" && (() => {
              const d = block.data as PricingData;
              return (
                <>
                  <h2 className="font-heading font-semibold text-text-primary" style={{ fontSize: "clamp(22px, 3vw, 28px)" }}>
                    {d.heading}
                  </h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-text-secondary">{d.description}</p>
                  <div className="mt-6 overflow-hidden rounded-xl border border-border" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border bg-surface-alt">
                          <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Item</th>
                          <th className="hidden px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-text-muted sm:table-cell">Description</th>
                          <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-text-muted">Qty</th>
                          <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-text-muted">Rate</th>
                          <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-text-muted">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.items.map((row, j) => (
                          <tr key={j} className={j < d.items.length - 1 ? "border-b border-border" : ""}>
                            <td className="px-5 py-3.5">
                              <span className="text-[14px] font-medium text-text-primary">{row.item}</span>
                              {!row.required && (
                                <span className="ml-2 inline-block rounded-md bg-accent-subtle px-1.5 py-0.5 text-[11px] font-medium text-accent-text">Optional</span>
                              )}
                            </td>
                            <td className="hidden px-5 py-3.5 text-[14px] text-text-secondary sm:table-cell">{row.description}</td>
                            <td className="px-5 py-3.5 text-right text-[14px] text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>{row.qty}</td>
                            <td className="px-5 py-3.5 text-right text-[14px] text-text-secondary" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(row.rate)}</td>
                            <td className="px-5 py-3.5 text-right text-[14px] font-medium text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(row.qty * row.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-border bg-surface-alt px-5 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] font-semibold text-text-primary">Total</span>
                        <span className="text-[20px] font-bold text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {block.type === "signature" && (() => {
              const d = block.data as SignatureData;
              return (
                <div className="rounded-xl border border-border bg-surface p-8" style={{ boxShadow: "var(--shadow-paper)" }}>
                  <h2 className="font-heading font-semibold text-text-primary" style={{ fontSize: "clamp(22px, 3vw, 28px)" }}>
                    {d.heading}
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{d.description}</p>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-semibold uppercase tracking-wide text-text-muted">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="mt-2 w-full border-b-2 bg-transparent pb-2 text-[18px] font-heading text-text-primary placeholder:text-text-muted/40 focus-visible:outline-none"
                        style={{ borderColor: "var(--color-border-strong)", fontSize: "18px" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold uppercase tracking-wide text-text-muted">Date</label>
                      <input
                        type="text"
                        value={new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        readOnly
                        className="mt-2 w-full rounded-lg border border-border bg-surface-alt px-3 py-2.5 text-text-primary cursor-default"
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        ))}
      </main>

      {/* Sticky bottom bar */}
      {total > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface print:hidden"
          style={{ boxShadow: "0 -4px 24px rgba(26,26,23,0.06)" }}
        >
          <div className="mx-auto flex max-w-[800px] items-center justify-between px-6 py-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Proposal Total</p>
              <p className="text-[22px] font-bold text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(total)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-lg border border-border px-5 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-surface-alt"
              >
                Create Your Own
              </Link>
              <button
                type="button"
                className="rounded-lg bg-accent px-6 py-2.5 text-[14px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover"
              >
                Accept Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
