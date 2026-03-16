"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Send,
  Plus,
  FileText,
  List,
  BarChart3,
  Table,
  PenTool,
  Check,
  ChevronDown,
  X,
  ImageIcon,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

type BlockType = "cover" | "scope" | "timeline" | "pricing" | "signature";

interface Block {
  id: string;
  type: BlockType;
}

interface TimelineTask {
  name: string;
  start: number;
  duration: number;
  color: string;
}

interface PricingItem {
  item: string;
  description: string;
  qty: number;
  rate: number;
  required: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────

const INITIAL_BLOCKS: Block[] = [
  { id: "block-cover", type: "cover" },
  { id: "block-scope", type: "scope" },
  { id: "block-timeline", type: "timeline" },
  { id: "block-pricing", type: "pricing" },
  { id: "block-signature", type: "signature" },
];

const SCOPE_ITEMS = [
  "Complete redesign of the marketing website with modern, responsive layouts",
  "Custom CMS integration for self-service content management",
  "Performance optimization targeting sub-2s load times on 3G",
  "SEO audit and implementation of technical SEO best practices",
  "Accessibility audit ensuring WCAG 2.1 AA compliance",
  "Analytics setup with custom event tracking and conversion funnels",
];

const TIMELINE_TASKS: TimelineTask[] = [
  { name: "Discovery & Research", start: 0, duration: 2, color: "#2D6A4F" },
  { name: "Wireframes & IA", start: 1, duration: 2, color: "#245A42" },
  { name: "Visual Design", start: 3, duration: 3, color: "#2D6A4F" },
  { name: "Development", start: 4, duration: 4, color: "#1B5E3B" },
  { name: "QA & Testing", start: 7, duration: 2, color: "#15803D" },
  { name: "Launch & Handoff", start: 8, duration: 1, color: "#2D6A4F" },
];

const PRICING_ITEMS: PricingItem[] = [
  { item: "Discovery & Strategy", description: "Stakeholder interviews, competitive analysis", qty: 1, rate: 3200, required: true },
  { item: "UX Design", description: "Wireframes, user flows, prototype", qty: 1, rate: 5600, required: true },
  { item: "Visual Design", description: "UI design for 12 page templates", qty: 12, rate: 480, required: true },
  { item: "Development", description: "Frontend build with CMS integration", qty: 1, rate: 9800, required: true },
  { item: "SEO Package", description: "Technical SEO + content optimization", qty: 1, rate: 2400, required: false },
  { item: "Analytics Setup", description: "GA4 + custom dashboards", qty: 1, rate: 1800, required: false },
];

const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string; icon: typeof FileText }[] = [
  { type: "cover", label: "Cover Page", icon: ImageIcon },
  { type: "scope", label: "Scope of Work", icon: List },
  { type: "timeline", label: "Timeline", icon: BarChart3 },
  { type: "pricing", label: "Pricing Table", icon: Table },
  { type: "signature", label: "E-Signature", icon: PenTool },
];

// ─── Formatting ────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Toggle Switch ─────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  size = "default",
  ariaLabel,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  size?: "default" | "small";
  ariaLabel: string;
}) {
  const w = size === "small" ? "w-[36px]" : "w-[44px]";
  const h = size === "small" ? "h-[20px]" : "h-[24px]";
  const dot = size === "small" ? "h-[16px] w-[16px]" : "h-[20px] w-[20px]";
  const translate = size === "small" ? "translate-x-[16px]" : "translate-x-[20px]";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`
        ${w} ${h} relative inline-flex shrink-0 cursor-pointer items-center
        rounded-full border-2 border-transparent
        transition-colors duration-[120ms] ease-out
        select-none
        ${checked ? "bg-accent" : "bg-[rgba(26,26,23,0.15)]"}
      `}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <span
        className={`
          ${dot} inline-block rounded-full bg-white shadow-sm
          transition-transform duration-[120ms] ease-out
          ${checked ? translate : "translate-x-0"}
        `}
        style={{ marginLeft: "2px" }}
      />
    </button>
  );
}

// ─── Block Content Renderers ───────────────────────────────────────

function CoverBlock({ preview }: { preview?: boolean }) {
  return (
    <div className={`${preview ? "py-12 px-8" : "py-10 px-6"} text-center`}>
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(45,106,79,0.08)" }}
      >
        <span className="font-heading text-[28px] font-bold text-accent">A</span>
      </div>
      <h2
        className="font-heading font-bold text-text-primary"
        style={{ fontSize: preview ? "clamp(28px,4vw,40px)" : "clamp(22px,3vw,28px)" }}
      >
        Website Redesign Proposal
      </h2>
      <p className="mt-3 text-[16px] text-text-secondary">
        Prepared for <span className="font-medium text-text-primary">Acme Corp</span>
      </p>
      <p className="mt-1 text-[14px] text-text-muted">
        March 2026 &middot; Valid for 30 days
      </p>
    </div>
  );
}

function ScopeBlock({ preview }: { preview?: boolean }) {
  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      <h3
        className={`font-heading font-semibold text-text-primary ${
          preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"
        }`}
      >
        Scope of Work
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-text-secondary" style={{ maxWidth: "65ch" }}>
        The following deliverables are included in this engagement. Each phase builds
        on the previous, ensuring alignment at every step.
      </p>
      <ul className="mt-4 space-y-2.5">
        {SCOPE_ITEMS.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[15px] leading-relaxed text-text-primary"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span
              className="mt-[7px] block h-[6px] w-[6px] shrink-0 rounded-full bg-accent"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineBlock({ preview }: { preview?: boolean }) {
  const totalWeeks = 10;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      <h3
        className={`font-heading font-semibold text-text-primary ${
          preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"
        }`}
      >
        Project Timeline
      </h3>
      <p className="mt-2 text-[14px] text-text-secondary">
        Estimated 10-week engagement from kickoff to launch.
      </p>

      <div className="mt-5 overflow-x-auto">
        <div style={{ minWidth: "540px" }}>
          {/* Week headers */}
          <div className="flex items-center">
            <div className="w-[160px] shrink-0" />
            <div className="flex flex-1">
              {weeks.map((w) => (
                <div
                  key={w}
                  className="flex-1 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted"
                >
                  W{w}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="mt-2 space-y-2">
            {TIMELINE_TASKS.map((task, i) => (
              <div key={i} className="flex items-center">
                <div className="w-[160px] shrink-0 pr-3 text-[13px] font-medium text-text-primary">
                  {task.name}
                </div>
                <div className="relative flex flex-1">
                  {weeks.map((w) => (
                    <div
                      key={w}
                      className="flex-1 border-l"
                      style={{
                        borderColor: "rgba(26,26,23,0.06)",
                        height: "28px",
                      }}
                    />
                  ))}
                  {/* Bar */}
                  <div
                    className="absolute top-[4px] rounded-[4px]"
                    style={{
                      left: `${(task.start / totalWeeks) * 100}%`,
                      width: `${(task.duration / totalWeeks) * 100}%`,
                      height: "20px",
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
    </div>
  );
}

function PricingBlock({
  preview,
  pricingToggles,
  onToggle,
}: {
  preview?: boolean;
  pricingToggles: Record<number, boolean>;
  onToggle?: (index: number) => void;
}) {
  const requiredTotal = PRICING_ITEMS.filter((p) => p.required).reduce(
    (sum, p) => sum + p.qty * p.rate,
    0
  );
  const optionalTotal = PRICING_ITEMS.filter((p, i) => !p.required && pricingToggles[i]).reduce(
    (sum, p) => sum + p.qty * p.rate,
    0
  );
  const total = requiredTotal + optionalTotal;

  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      <h3
        className={`font-heading font-semibold text-text-primary ${
          preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"
        }`}
      >
        Investment
      </h3>
      <p className="mt-2 text-[14px] text-text-secondary">
        Required items are included in every package. Optional add-ons can be toggled.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left" style={{ minWidth: "520px" }}>
          <thead>
            <tr
              className="border-b text-[11px] font-semibold uppercase tracking-wide text-text-muted"
              style={{ borderColor: "rgba(26,26,23,0.10)" }}
            >
              <th className="pb-2.5 pr-3">Item</th>
              <th className="pb-2.5 pr-3 hidden sm:table-cell">Description</th>
              <th className="pb-2.5 pr-3 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                Qty
              </th>
              <th className="pb-2.5 pr-3 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                Rate
              </th>
              <th className="pb-2.5 pr-3 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                Total
              </th>
              <th className="pb-2.5 text-center" style={{ width: "72px" }}>
                Include
              </th>
            </tr>
          </thead>
          <tbody>
            {PRICING_ITEMS.map((row, i) => {
              const included = row.required || pricingToggles[i];
              return (
                <tr
                  key={i}
                  className="editor-table-row border-b transition-colors duration-[120ms] ease-out"
                  style={{
                    borderColor: "rgba(26,26,23,0.06)",
                    opacity: included ? 1 : 0.5,
                  }}
                >
                  <td className="py-3 pr-3 text-[14px] font-medium text-text-primary">
                    {row.item}
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-text-secondary hidden sm:table-cell">
                    {row.description}
                  </td>
                  <td
                    className="py-3 pr-3 text-right text-[14px] text-text-primary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {row.qty}
                  </td>
                  <td
                    className="py-3 pr-3 text-right text-[14px] text-text-secondary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatCurrency(row.rate)}
                  </td>
                  <td
                    className="py-3 pr-3 text-right text-[14px] font-medium text-text-primary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatCurrency(row.qty * row.rate)}
                  </td>
                  <td className="py-3 text-center">
                    {row.required ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-text">
                        <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                        Req
                      </span>
                    ) : preview ? (
                      <span
                        className={`inline-block text-[12px] font-medium ${
                          pricingToggles[i] ? "text-accent" : "text-text-muted"
                        }`}
                      >
                        {pricingToggles[i] ? "Included" : "Optional"}
                      </span>
                    ) : (
                      <ToggleSwitch
                        checked={!!pricingToggles[i]}
                        onChange={() => onToggle?.(i)}
                        size="small"
                        ariaLabel={`Include ${row.item}`}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div
        className="mt-4 flex flex-col items-end gap-1 border-t pt-4"
        style={{ borderColor: "rgba(26,26,23,0.10)" }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-text-secondary">Subtotal (required)</span>
          <span
            className="text-[14px] font-medium text-text-primary"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatCurrency(requiredTotal)}
          </span>
        </div>
        {optionalTotal > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-text-secondary">Add-ons</span>
            <span
              className="text-[14px] font-medium text-text-primary"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              +{formatCurrency(optionalTotal)}
            </span>
          </div>
        )}
        <div className="mt-1 flex items-center gap-4">
          <span className="text-[14px] font-semibold text-text-primary">Total</span>
          <span
            className="text-[20px] font-bold text-accent"
            style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-heading)" }}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SignatureBlock({ preview }: { preview?: boolean }) {
  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      <h3
        className={`font-heading font-semibold text-text-primary ${
          preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"
        }`}
      >
        Acceptance & Signature
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-text-secondary" style={{ maxWidth: "65ch" }}>
        By signing below, you agree to the scope, timeline, and investment outlined in this proposal.
        This agreement is valid for 30 days from the date of issue.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Client signature */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Client Signature
          </p>
          <div
            className="mt-2 flex h-[80px] items-end rounded-lg border-b-2 px-4 pb-3"
            style={{
              borderColor: "rgba(26,26,23,0.20)",
              background: "rgba(45,106,79,0.02)",
            }}
          >
            <span className="text-[14px] italic text-text-muted">Sign here</span>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 space-y-2">
            <div>
              <label
                htmlFor="sig-name"
                className="block text-[12px] font-medium text-text-muted"
              >
                Full Name
              </label>
              <input
                id="sig-name"
                type="text"
                placeholder="Jane Smith"
                spellCheck={false}
                className="editor-input mt-1 w-full rounded-lg border bg-surface-alt px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 transition-[box-shadow,border-color] duration-[120ms] ease-out"
                style={{
                  borderColor: "rgba(26,26,23,0.10)",
                  fontSize: "16px",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="sig-date"
                className="block text-[12px] font-medium text-text-muted"
              >
                Date
              </label>
              <input
                id="sig-date"
                type="date"
                className="editor-input mt-1 w-full rounded-lg border bg-surface-alt px-3 py-2 text-[14px] text-text-primary transition-[box-shadow,border-color] duration-[120ms] ease-out"
                style={{
                  borderColor: "rgba(26,26,23,0.10)",
                  fontSize: "16px",
                }}
              />
            </div>
          </form>
        </div>

        {/* Provider signature */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Provider Signature
          </p>
          <div
            className="mt-2 flex h-[80px] items-end rounded-lg border-b-2 px-4 pb-3"
            style={{
              borderColor: "rgba(26,26,23,0.20)",
              background: "rgba(45,106,79,0.02)",
            }}
          >
            <span
              className="text-[22px] text-accent"
              style={{ fontFamily: "var(--font-heading)", fontStyle: "italic" }}
            >
              Sam D.
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-[12px] font-medium text-text-muted">Full Name</p>
              <p className="mt-1 text-[14px] text-text-primary">Sam Designer</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-text-muted">Date</p>
              <p className="mt-1 text-[14px] text-text-primary">March 15, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Block Wrapper ────────────────────────────────────────

function SortableBlock({
  block,
  isSelected,
  onSelect,
  children,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative
        transition-opacity duration-[120ms] ease-out
      `}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="
          absolute -left-10 top-4 z-10
          flex h-8 w-8 items-center justify-center
          rounded-md
          opacity-0 group-hover:opacity-100
          transition-opacity duration-[120ms] ease-out
          cursor-grab active:cursor-grabbing
          select-none
        "
        style={{
          background: "rgba(26,26,23,0.04)",
          color: "var(--color-text-muted)",
        }}
        aria-label={`Drag to reorder ${block.type} block`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} strokeWidth={1.75} />
      </button>

      {/* Block card */}
      <div
        className={`
          rounded-xl bg-surface overflow-hidden
          transition-[border-color,background-color,box-shadow] duration-[120ms] ease-out
          ${isSelected
            ? "border-l-[3px] border-l-accent border-t border-r border-b bg-accent-surface"
            : "border border-border"
          }
        `}
        style={{
          boxShadow: isDragging
            ? "var(--shadow-lg)"
            : isSelected
              ? "var(--shadow-md)"
              : "var(--shadow-paper)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Add Block Dropdown ────────────────────────────────────────────

function AddBlockDropdown({
  onAdd,
}: {
  onAdd: (type: BlockType) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="
          editor-add-block
          inline-flex items-center gap-2 rounded-lg
          border px-4 py-2.5
          text-[13px] font-medium text-text-secondary
          transition-colors duration-[120ms] ease-out
          cursor-pointer select-none
        "
        style={{
          borderColor: "rgba(26,26,23,0.10)",
          background: open ? "rgba(45,106,79,0.04)" : "var(--color-surface)",
        }}
      >
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
        Add Block
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className="transition-transform duration-[120ms] ease-out"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute left-0 top-full z-50 mt-2
            w-[220px] rounded-xl border bg-surface p-1.5
            animate-fade-in-up
          "
          style={{
            borderColor: "rgba(26,26,23,0.10)",
            boxShadow: "var(--shadow-lg)",
          }}
          role="menu"
        >
          {BLOCK_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                type="button"
                role="menuitem"
                onClick={() => {
                  onAdd(opt.type);
                  setOpen(false);
                }}
                className="
                  editor-block-option
                  flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                  text-[13px] font-medium text-text-secondary
                  transition-colors duration-[120ms] ease-out
                  cursor-pointer select-none
                "
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" className="text-text-muted" />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Live Preview Panel ────────────────────────────────────────────

function PreviewPanel({
  blocks,
  pricingToggles,
}: {
  blocks: Block[];
  pricingToggles: Record<number, boolean>;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-surface-alt">
      <div className="mx-auto w-full max-w-[680px] py-10">
        <div className="space-y-0">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="bg-surface border-b"
              style={{ borderColor: "rgba(26,26,23,0.06)" }}
            >
              {block.type === "cover" && <CoverBlock preview />}
              {block.type === "scope" && <ScopeBlock preview />}
              {block.type === "timeline" && <TimelineBlock preview />}
              {block.type === "pricing" && (
                <PricingBlock preview pricingToggles={pricingToggles} />
              )}
              {block.type === "signature" && <SignatureBlock preview />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor Component ─────────────────────────────────────────

export function ProposalEditor() {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [livePreview, setLivePreview] = useState(false);
  const [title, setTitle] = useState("Website Redesign Proposal");
  const [client, setClient] = useState("Acme Corp");
  const [pricingToggles, setPricingToggles] = useState<Record<number, boolean>>({
    4: false,
    5: false,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setBlocks((prev) => {
          const oldIndex = prev.findIndex((b) => b.id === active.id);
          const newIndex = prev.findIndex((b) => b.id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    },
    []
  );

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock: Block = {
      id: `block-${type}-${Date.now()}`,
      type,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const handleTogglePricing = useCallback((index: number) => {
    setPricingToggles((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handleSend = useCallback(() => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    }, 1500);
  }, []);

  // Click outside blocks to deselect
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setSelectedBlockId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderBlockContent = (block: Block) => {
    switch (block.type) {
      case "cover":
        return <CoverBlock />;
      case "scope":
        return <ScopeBlock />;
      case "timeline":
        return <TimelineBlock />;
      case "pricing":
        return (
          <PricingBlock
            pricingToggles={pricingToggles}
            onToggle={handleTogglePricing}
          />
        );
      case "signature":
        return <SignatureBlock />;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Top Toolbar ─── */}
      <header
        className="
          flex shrink-0 items-center gap-4 border-b px-6 py-3
          transition-colors duration-[150ms] ease-out
        "
        style={{
          borderColor: "rgba(26,26,23,0.10)",
          background: "var(--color-surface)",
        }}
      >
        {/* Title + Client */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <form onSubmit={(e) => e.preventDefault()} className="flex min-w-0 items-center gap-3">
            <label htmlFor="proposal-title" className="sr-only">
              Proposal title
            </label>
            <input
              id="proposal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              spellCheck={false}
              className="
                min-w-0 flex-1 truncate border-0 bg-transparent
                font-heading text-[20px] font-bold text-text-primary
                placeholder:text-text-muted/40
                focus-visible:outline-none
              "
              style={{ fontSize: "20px" }}
              placeholder="Proposal title"
            />
            <span
              className="text-[14px] text-text-muted"
              style={{ userSelect: "none" }}
              aria-hidden="true"
            >
              for
            </span>
            <label htmlFor="client-name" className="sr-only">
              Client name
            </label>
            <input
              id="client-name"
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              spellCheck={false}
              className="
                w-[140px] truncate rounded-md border bg-surface-alt
                px-2.5 py-1 text-[14px] font-medium text-text-primary
                placeholder:text-text-muted/40
                transition-[box-shadow,border-color] duration-[120ms] ease-out
                focus-visible:border-accent focus-visible:outline-none
              "
              style={{
                borderColor: "rgba(26,26,23,0.10)",
                fontSize: "16px",
              }}
              placeholder="Client name"
            />
          </form>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Live Preview Toggle */}
          <div className="flex items-center gap-2">
            {livePreview ? (
              <Eye size={16} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
            ) : (
              <EyeOff size={16} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />
            )}
            <span className="text-[13px] font-medium text-text-secondary select-none">
              Preview
            </span>
            <ToggleSwitch
              checked={livePreview}
              onChange={setLivePreview}
              ariaLabel="Toggle live preview"
            />
          </div>

          {/* Divider */}
          <div
            className="h-6 w-px"
            style={{ background: "rgba(26,26,23,0.10)" }}
            aria-hidden="true"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || sent}
            className="
              editor-send-btn
              inline-flex items-center gap-2 rounded-lg
              px-5 py-2.5
              text-[14px] font-semibold text-on-accent
              shadow-sm select-none
              transition-[background-color,transform,opacity] duration-[120ms] ease-out
              cursor-pointer
              disabled:cursor-not-allowed disabled:opacity-70
            "
            style={{
              background: sent
                ? "var(--color-success)"
                : "var(--color-accent)",
            }}
          >
            {sending ? (
              <>
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent"
                  aria-hidden="true"
                />
                Sending...
              </>
            ) : sent ? (
              <>
                <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                Sent
              </>
            ) : (
              <>
                <Send size={16} strokeWidth={2} aria-hidden="true" />
                Send Proposal
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── Body: Editor + optional Preview ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div
          className={`
            flex flex-col overflow-y-auto dot-grid
            transition-[flex] duration-[200ms] cubic-bezier(0.32, 0.72, 0, 1)
            ${livePreview ? "flex-1" : "flex-1"}
          `}
          style={{ minWidth: 0 }}
        >
          <div
            ref={editorRef}
            className={`
              mx-auto w-full py-8 px-4
              ${livePreview ? "max-w-[720px]" : "max-w-[800px]"}
            `}
            style={{ paddingLeft: "56px" }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-5">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <SortableBlock
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                      >
                        {renderBlockContent(block)}
                      </SortableBlock>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add block area */}
            <div className="mt-6 flex justify-center">
              <AddBlockDropdown onAdd={handleAddBlock} />
            </div>
          </div>
        </div>

        {/* Preview panel */}
        {livePreview && (
          <div
            className="flex w-[480px] shrink-0 flex-col border-l animate-fade-in-up overflow-hidden"
            style={{
              borderColor: "rgba(26,26,23,0.10)",
            }}
          >
            {/* Preview header */}
            <div
              className="flex shrink-0 items-center justify-between border-b px-4 py-2.5"
              style={{
                borderColor: "rgba(26,26,23,0.10)",
                background: "var(--color-surface)",
              }}
            >
              <span className="text-[12px] font-semibold uppercase tracking-wide text-text-muted select-none">
                Client Preview
              </span>
              <button
                type="button"
                onClick={() => setLivePreview(false)}
                aria-label="Close preview"
                className="
                  editor-close-btn
                  flex h-7 w-7 items-center justify-center rounded-md
                  text-text-muted
                  transition-colors duration-[120ms] ease-out
                  cursor-pointer select-none
                "
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            <PreviewPanel blocks={blocks} pricingToggles={pricingToggles} />
          </div>
        )}
      </div>
    </div>
  );
}
