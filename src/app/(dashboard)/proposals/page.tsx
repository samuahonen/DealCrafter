"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Trash2,
  Copy,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import {
  getProposals,
  deleteProposal,
  duplicateProposal,
  createProposal,
  saveProposal,
  formatCurrency,
  type Proposal,
  type PricingData,
} from "@/lib/proposals";

function getProposalTotal(proposal: Proposal): number {
  let total = 0;
  for (const block of proposal.blocks) {
    if (block.type === "pricing") {
      const data = block.data as PricingData;
      for (let i = 0; i < data.items.length; i++) {
        const row = data.items[i];
        if (row.required || proposal.pricingToggles[i]) {
          total += row.qty * row.rate;
        }
      }
    }
  }
  return total;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProposals(getProposals());
    setLoaded(true);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  const handleNew = () => {
    const p = createProposal();
    saveProposal(p);
    router.push(`/proposals/${p.id}`);
  };

  const handleDelete = (id: string) => {
    deleteProposal(id);
    setProposals(getProposals());
    setOpenMenu(null);
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateProposal(id);
    if (copy) {
      setProposals(getProposals());
      router.push(`/proposals/${copy.id}`);
    }
    setOpenMenu(null);
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-[900px] px-8 py-10">
        {/* Header */}
        <div className="animate-fade-in-up flex items-end justify-between">
          <div>
            <h1 className="font-heading text-[clamp(28px,4vw,40px)] font-bold leading-tight text-text-primary">
              My Proposals
            </h1>
            <p className="mt-1 text-[16px] text-text-secondary">
              {proposals.length === 0
                ? "Create your first proposal to get started"
                : `${proposals.length} proposal${proposals.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNew}
            className="animate-fade-in-up inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover"
            style={{ animationDelay: "60ms" }}
          >
            <Plus size={16} strokeWidth={2} />
            New Proposal
          </button>
        </div>

        {/* Empty state */}
        {proposals.length === 0 && (
          <div className="animate-fade-in-up mt-20 flex flex-col items-center text-center" style={{ animationDelay: "100ms" }}>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "rgba(45,106,79,0.08)" }}
            >
              <FileText size={28} strokeWidth={1.5} className="text-accent" />
            </div>
            <h2 className="mt-5 text-[20px] font-semibold text-text-primary">
              No proposals yet
            </h2>
            <p className="mt-2 max-w-[400px] text-[15px] text-text-secondary">
              Create a new proposal from scratch or pick a template to get started quickly.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleNew}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover"
              >
                <Plus size={16} strokeWidth={2} />
                New Proposal
              </button>
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-surface-alt"
                style={{ borderColor: "rgba(26,26,23,0.12)" }}
              >
                Browse Templates
              </Link>
            </div>
          </div>
        )}

        {/* Proposal list */}
        {proposals.length > 0 && (
          <div className="mt-8 space-y-3">
            {proposals.map((p, i) => {
              const total = getProposalTotal(p);
              return (
                <div
                  key={p.id}
                  className="animate-fade-in-up group relative flex items-center gap-4 rounded-xl border bg-surface p-5 transition-[box-shadow,border-color] duration-[120ms] hover:shadow-md"
                  style={{
                    borderColor: "rgba(26,26,23,0.08)",
                    boxShadow: "var(--shadow-paper)",
                    animationDelay: `${80 + i * 40}ms`,
                  }}
                >
                  <Link href={`/proposals/${p.id}`} className="absolute inset-0 z-0 rounded-xl" />

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(45,106,79,0.06)" }}
                  >
                    <FileText size={18} strokeWidth={1.75} className="text-accent" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[16px] font-semibold text-text-primary">
                      {p.title || "Untitled Proposal"}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-[13px] text-text-muted">
                      {p.client && <span>{p.client}</span>}
                      {p.client && <span aria-hidden="true">&middot;</span>}
                      <span className="flex items-center gap-1">
                        <Clock size={12} strokeWidth={1.75} />
                        {timeAgo(p.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {total > 0 && (
                    <span
                      className="shrink-0 text-[16px] font-semibold text-accent-text"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(total)}
                    </span>
                  )}

                  <div className="relative z-10" ref={openMenu === p.id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenu(openMenu === p.id ? null : p.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-surface-alt"
                    >
                      <MoreHorizontal size={16} strokeWidth={1.75} />
                    </button>

                    {openMenu === p.id && (
                      <div
                        className="absolute right-0 top-full z-50 mt-1 w-[160px] rounded-xl border bg-surface p-1 shadow-lg animate-fade-in-up"
                        style={{ borderColor: "rgba(26,26,23,0.10)" }}
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDuplicate(p.id); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
                        >
                          <Copy size={14} strokeWidth={1.75} />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p.id); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/5"
                        >
                          <Trash2 size={14} strokeWidth={1.75} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
