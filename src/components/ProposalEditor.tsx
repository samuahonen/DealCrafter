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
  Trash2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

type BlockType = "cover" | "scope" | "timeline" | "pricing" | "signature";

interface CoverData {
  title: string;
  subtitle: string;
  date: string;
}

interface ScopeData {
  heading: string;
  description: string;
  items: string[];
}

interface TimelineTask {
  name: string;
  start: number;
  duration: number;
  color: string;
}

interface TimelineData {
  heading: string;
  description: string;
  totalWeeks: number;
  tasks: TimelineTask[];
}

interface PricingItem {
  item: string;
  description: string;
  qty: number;
  rate: number;
  required: boolean;
}

interface PricingData {
  heading: string;
  description: string;
  items: PricingItem[];
}

interface SignatureData {
  heading: string;
  description: string;
  providerName: string;
  providerDate: string;
}

type BlockData = CoverData | ScopeData | TimelineData | PricingData | SignatureData;

interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
}

// ─── Default Data Factories ─────────────────────────────────────────

function defaultCoverData(): CoverData {
  return {
    title: "Website Redesign Proposal",
    subtitle: "Acme Corp",
    date: "March 2026 \u00b7 Valid for 30 days",
  };
}

function defaultScopeData(): ScopeData {
  return {
    heading: "Scope of Work",
    description: "The following deliverables are included in this engagement. Each phase builds on the previous, ensuring alignment at every step.",
    items: [
      "Complete redesign of the marketing website with modern, responsive layouts",
      "Custom CMS integration for self-service content management",
      "Performance optimization targeting sub-2s load times on 3G",
      "SEO audit and implementation of technical SEO best practices",
      "Accessibility audit ensuring WCAG 2.1 AA compliance",
      "Analytics setup with custom event tracking and conversion funnels",
    ],
  };
}

function defaultTimelineData(): TimelineData {
  return {
    heading: "Project Timeline",
    description: "Estimated 10-week engagement from kickoff to launch.",
    totalWeeks: 10,
    tasks: [
      { name: "Discovery & Research", start: 0, duration: 2, color: "#2D6A4F" },
      { name: "Wireframes & IA", start: 1, duration: 2, color: "#245A42" },
      { name: "Visual Design", start: 3, duration: 3, color: "#2D6A4F" },
      { name: "Development", start: 4, duration: 4, color: "#1B5E3B" },
      { name: "QA & Testing", start: 7, duration: 2, color: "#15803D" },
      { name: "Launch & Handoff", start: 8, duration: 1, color: "#2D6A4F" },
    ],
  };
}

function defaultPricingData(): PricingData {
  return {
    heading: "Investment",
    description: "Required items are included in every package. Optional add-ons can be toggled.",
    items: [
      { item: "Discovery & Strategy", description: "Stakeholder interviews, competitive analysis", qty: 1, rate: 3200, required: true },
      { item: "UX Design", description: "Wireframes, user flows, prototype", qty: 1, rate: 5600, required: true },
      { item: "Visual Design", description: "UI design for 12 page templates", qty: 12, rate: 480, required: true },
      { item: "Development", description: "Frontend build with CMS integration", qty: 1, rate: 9800, required: true },
      { item: "SEO Package", description: "Technical SEO + content optimization", qty: 1, rate: 2400, required: false },
      { item: "Analytics Setup", description: "GA4 + custom dashboards", qty: 1, rate: 1800, required: false },
    ],
  };
}

function defaultSignatureData(): SignatureData {
  return {
    heading: "Acceptance & Signature",
    description: "By signing below, you agree to the scope, timeline, and investment outlined in this proposal. This agreement is valid for 30 days from the date of issue.",
    providerName: "Sam Designer",
    providerDate: "March 15, 2026",
  };
}

function createBlockData(type: BlockType): BlockData {
  switch (type) {
    case "cover": return defaultCoverData();
    case "scope": return defaultScopeData();
    case "timeline": return defaultTimelineData();
    case "pricing": return defaultPricingData();
    case "signature": return defaultSignatureData();
  }
}

// ─── Initial State ────────────────────────────────────────────────

const INITIAL_BLOCKS: Block[] = [
  { id: "block-cover", type: "cover", data: defaultCoverData() },
  { id: "block-scope", type: "scope", data: defaultScopeData() },
  { id: "block-timeline", type: "timeline", data: defaultTimelineData() },
  { id: "block-pricing", type: "pricing", data: defaultPricingData() },
  { id: "block-signature", type: "signature", data: defaultSignatureData() },
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

// ─── Shared Inline Input ──────────────────────────────────────────

function InlineInput({
  value,
  onChange,
  className = "",
  placeholder = "",
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`w-full resize-none border-0 bg-transparent focus-visible:outline-none ${className}`}
        style={{ fontSize: "inherit" }}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      className={`w-full border-0 bg-transparent focus-visible:outline-none ${className}`}
      style={{ fontSize: "inherit" }}
    />
  );
}

function InlineNumber({
  value,
  onChange,
  className = "",
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={`w-full border-0 bg-transparent text-right focus-visible:outline-none ${className}`}
      style={{ fontSize: "inherit", fontVariantNumeric: "tabular-nums" }}
    />
  );
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

function CoverBlock({
  data,
  editing,
  onChange,
  proposalTitle,
  clientName,
}: {
  data: CoverData;
  editing: boolean;
  onChange: (d: CoverData) => void;
  proposalTitle: string;
  clientName: string;
}) {
  return (
    <div className="py-10 px-6 text-center">
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(45,106,79,0.08)" }}
      >
        <span className="font-heading text-[28px] font-bold text-accent">
          {clientName.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
      {editing ? (
        <>
          <InlineInput
            value={data.title}
            onChange={(v) => onChange({ ...data, title: v })}
            placeholder="Proposal title"
            className="font-heading font-bold text-text-primary text-center"
          />
          <div className="mt-3 flex items-center justify-center gap-1 text-[16px] text-text-secondary">
            Prepared for{" "}
            <InlineInput
              value={data.subtitle}
              onChange={(v) => onChange({ ...data, subtitle: v })}
              placeholder="Client name"
              className="font-medium text-text-primary text-center w-auto inline-block max-w-[200px]"
            />
          </div>
          <InlineInput
            value={data.date}
            onChange={(v) => onChange({ ...data, date: v })}
            placeholder="Date info"
            className="mt-1 text-[14px] text-text-muted text-center"
          />
        </>
      ) : (
        <>
          <h2
            className="font-heading font-bold text-text-primary"
            style={{ fontSize: "clamp(22px,3vw,28px)" }}
          >
            {data.title || proposalTitle}
          </h2>
          <p className="mt-3 text-[16px] text-text-secondary">
            Prepared for <span className="font-medium text-text-primary">{data.subtitle || clientName}</span>
          </p>
          <p className="mt-1 text-[14px] text-text-muted">{data.date}</p>
        </>
      )}
    </div>
  );
}

function ScopeBlock({
  data,
  editing,
  onChange,
  preview,
}: {
  data: ScopeData;
  editing: boolean;
  onChange: (d: ScopeData) => void;
  preview?: boolean;
}) {
  const addItem = () => onChange({ ...data, items: [...data.items, ""] });
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, v: string) => {
    const items = [...data.items];
    items[i] = v;
    onChange({ ...data, items });
  };

  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      {editing ? (
        <InlineInput
          value={data.heading}
          onChange={(v) => onChange({ ...data, heading: v })}
          placeholder="Section heading"
          className="font-heading text-[20px] font-semibold text-text-primary"
        />
      ) : (
        <h3 className={`font-heading font-semibold text-text-primary ${preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"}`}>
          {data.heading}
        </h3>
      )}

      {editing ? (
        <InlineInput
          value={data.description}
          onChange={(v) => onChange({ ...data, description: v })}
          placeholder="Section description"
          multiline
          className="mt-2 text-[14px] leading-relaxed text-text-secondary"
        />
      ) : (
        <p className="mt-2 text-[14px] leading-relaxed text-text-secondary" style={{ maxWidth: "65ch" }}>
          {data.description}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {data.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-text-primary">
            <span className="mt-[7px] block h-[6px] w-[6px] shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {editing ? (
              <div className="flex flex-1 items-start gap-1">
                <InlineInput
                  value={item}
                  onChange={(v) => updateItem(i, v)}
                  placeholder="Deliverable item"
                  className="flex-1 text-[15px]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="mt-0.5 shrink-0 rounded p-1 text-text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove item"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <span>{item}</span>
            )}
          </li>
        ))}
      </ul>

      {editing && (
        <button
          type="button"
          onClick={addItem}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-accent-text transition-colors hover:bg-accent-subtle"
        >
          <Plus size={14} strokeWidth={2} />
          Add item
        </button>
      )}
    </div>
  );
}

const TIMELINE_COLORS = [
  { value: "#2D6A4F", label: "Forest" },
  { value: "#245A42", label: "Pine" },
  { value: "#1B5E3B", label: "Emerald" },
  { value: "#15803D", label: "Green" },
  { value: "#B45309", label: "Amber" },
  { value: "#6B6B64", label: "Gray" },
];

function TimelineBlock({
  data,
  editing,
  onChange,
  preview,
}: {
  data: TimelineData;
  editing: boolean;
  onChange: (d: TimelineData) => void;
  preview?: boolean;
}) {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<"paint" | "erase" | null>(null);
  const weeks = Array.from({ length: data.totalWeeks }, (_, i) => i);

  const updateTask = (i: number, patch: Partial<TimelineTask>) => {
    const tasks = data.tasks.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    onChange({ ...data, tasks });
  };
  const addTask = () => {
    onChange({
      ...data,
      tasks: [...data.tasks, { name: "New Phase", start: 0, duration: 1, color: "#2D6A4F" }],
    });
  };
  const removeTask = (i: number) => {
    onChange({ ...data, tasks: data.tasks.filter((_, idx) => idx !== i) });
    if (activeRow === i) setActiveRow(null);
    else if (activeRow !== null && activeRow > i) setActiveRow(activeRow - 1);
  };

  // Click a cell to paint/erase the bar
  const handleCellMouseDown = (taskIndex: number, weekIndex: number) => {
    if (!editing) return;
    const task = data.tasks[taskIndex];
    const end = task.start + task.duration;
    const isInBar = weekIndex >= task.start && weekIndex < end;

    if (isInBar) {
      // Erase: shrink from whichever end is closer
      setDragMode("erase");
      const distToStart = weekIndex - task.start;
      const distToEnd = end - 1 - weekIndex;
      if (distToStart <= distToEnd) {
        updateTask(taskIndex, { start: weekIndex + 1, duration: Math.max(1, end - weekIndex - 1) });
      } else {
        updateTask(taskIndex, { duration: Math.max(1, weekIndex - task.start) });
      }
    } else {
      // Paint: extend bar to include this cell
      setDragMode("paint");
      const newStart = Math.min(task.start, weekIndex);
      const newEnd = Math.max(end, weekIndex + 1);
      updateTask(taskIndex, { start: newStart, duration: newEnd - newStart });
    }
    setActiveRow(taskIndex);
  };

  const handleCellMouseEnter = (taskIndex: number, weekIndex: number) => {
    if (!editing || dragMode === null || taskIndex !== activeRow) return;
    const task = data.tasks[taskIndex];
    const end = task.start + task.duration;

    if (dragMode === "paint") {
      const newStart = Math.min(task.start, weekIndex);
      const newEnd = Math.max(end, weekIndex + 1);
      updateTask(taskIndex, { start: newStart, duration: newEnd - newStart });
    } else {
      const isInBar = weekIndex >= task.start && weekIndex < end;
      if (isInBar) {
        const distToStart = weekIndex - task.start;
        const distToEnd = end - 1 - weekIndex;
        if (distToStart <= distToEnd) {
          updateTask(taskIndex, { start: weekIndex + 1, duration: Math.max(1, end - weekIndex - 1) });
        } else {
          updateTask(taskIndex, { duration: Math.max(1, weekIndex - task.start) });
        }
      }
    }
  };

  useEffect(() => {
    if (!editing) return;
    const handleUp = () => setDragMode(null);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, [editing]);

  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      {editing ? (
        <InlineInput
          value={data.heading}
          onChange={(v) => onChange({ ...data, heading: v })}
          placeholder="Section heading"
          className="font-heading text-[20px] font-semibold text-text-primary"
        />
      ) : (
        <h3 className={`font-heading font-semibold text-text-primary ${preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"}`}>
          {data.heading}
        </h3>
      )}

      {editing ? (
        <div className="mt-2 flex items-center gap-3">
          <InlineInput
            value={data.description}
            onChange={(v) => onChange({ ...data, description: v })}
            placeholder="Description"
            className="flex-1 text-[14px] text-text-secondary"
          />
          <div className="flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1" style={{ borderColor: "rgba(26,26,23,0.10)" }}>
            <button
              type="button"
              onClick={() => data.totalWeeks > 1 && onChange({ ...data, totalWeeks: data.totalWeeks - 1 })}
              className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text"
            >
              <span className="text-[14px] font-medium leading-none">&minus;</span>
            </button>
            <span className="min-w-[48px] text-center text-[12px] font-medium text-text-primary select-none">
              {data.totalWeeks} wks
            </span>
            <button
              type="button"
              onClick={() => data.totalWeeks < 52 && onChange({ ...data, totalWeeks: data.totalWeeks + 1 })}
              className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[14px] text-text-secondary">{data.description}</p>
      )}

      {editing && (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(45,106,79,0.03)", border: "1px dashed rgba(45,106,79,0.15)" }}
        >
          <span className="text-[11px] font-medium text-accent-text select-none">
            Click & drag on the grid to paint bars. Click filled cells to erase.
          </span>
        </div>
      )}

      <div className="mt-4 overflow-x-auto select-none">
        <div style={{ minWidth: "540px" }}>
          {/* Week headers */}
          <div className="flex items-center">
            <div className="w-[160px] shrink-0" />
            <div className="flex flex-1">
              {weeks.map((w) => (
                <div key={w} className="flex-1 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted">
                  W{w + 1}
                </div>
              ))}
            </div>
            {editing && <div className="w-[30px] shrink-0" />}
          </div>

          {/* Task rows */}
          <div className="mt-2 space-y-1">
            {data.tasks.map((task, i) => {
              const isActive = editing && activeRow === i;
              return (
                <div
                  key={i}
                  className="group/row flex items-center rounded-lg transition-colors duration-[100ms]"
                  style={{ background: isActive ? "rgba(45,106,79,0.04)" : undefined }}
                  onClick={() => editing && setActiveRow(i)}
                >
                  <div className="w-[160px] shrink-0 pr-3 py-1">
                    {editing ? (
                      <InlineInput
                        value={task.name}
                        onChange={(v) => updateTask(i, { name: v })}
                        placeholder="Phase name"
                        className="text-[13px] font-medium text-text-primary"
                      />
                    ) : (
                      <span className="text-[13px] font-medium text-text-primary">{task.name}</span>
                    )}
                  </div>
                  <div className="relative flex flex-1">
                    {weeks.map((w) => {
                      const isInBar = w >= task.start && w < task.start + task.duration;
                      const isBarStart = w === task.start;
                      const isBarEnd = w === task.start + task.duration - 1;
                      return (
                        <div
                          key={w}
                          className={`flex-1 border-l ${editing ? "cursor-pointer" : ""}`}
                          style={{
                            borderColor: "rgba(26,26,23,0.06)",
                            height: "32px",
                            position: "relative",
                          }}
                          onMouseDown={() => handleCellMouseDown(i, w)}
                          onMouseEnter={() => handleCellMouseEnter(i, w)}
                        >
                          {isInBar && (
                            <div
                              className="absolute inset-x-0 top-[5px] bottom-[5px] transition-opacity duration-[80ms]"
                              style={{
                                background: task.color,
                                opacity: isActive ? 1 : 0.8,
                                borderRadius: `${isBarStart ? "4px" : "0"} ${isBarEnd ? "4px" : "0"} ${isBarEnd ? "4px" : "0"} ${isBarStart ? "4px" : "0"}`,
                              }}
                            />
                          )}
                          {editing && !isInBar && (
                            <div
                              className="absolute inset-x-[2px] top-[6px] bottom-[6px] rounded-[3px] opacity-0 transition-opacity duration-[80ms] group-hover/row:opacity-100"
                              style={{ background: "rgba(45,106,79,0.06)" }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {editing && (
                    <div className="flex w-[30px] shrink-0 justify-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTask(i); }}
                        className="rounded p-1 text-text-muted opacity-0 transition-all group-hover/row:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove phase"
                      >
                        <X size={12} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active row color picker */}
          {editing && activeRow !== null && data.tasks[activeRow] && (
            <div
              className="mt-2 flex items-center gap-3 rounded-lg border px-3 py-2 animate-fade-in-up"
              style={{ borderColor: "rgba(26,26,23,0.08)", background: "var(--color-surface)" }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted select-none">
                {data.tasks[activeRow].name}
              </span>
              <div className="h-3 w-px" style={{ background: "rgba(26,26,23,0.10)" }} />
              <div className="flex items-center gap-1">
                {TIMELINE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => updateTask(activeRow, { color: c.value })}
                    className="flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c.value,
                      boxShadow: data.tasks[activeRow].color === c.value
                        ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${c.value}`
                        : undefined,
                    }}
                    aria-label={`Set color to ${c.label}`}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="h-3 w-px" style={{ background: "rgba(26,26,23,0.10)" }} />
              <span className="text-[11px] text-text-muted select-none">
                W{data.tasks[activeRow].start + 1} &ndash; W{data.tasks[activeRow].start + data.tasks[activeRow].duration}
                <span className="ml-1 text-text-muted/60">({data.tasks[activeRow].duration}w)</span>
              </span>
            </div>
          )}

          {editing && (
            <button
              type="button"
              onClick={addTask}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-accent-text transition-colors hover:bg-accent-subtle"
            >
              <Plus size={14} strokeWidth={2} />
              Add phase
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingBlock({
  data,
  editing,
  onChange,
  preview,
  pricingToggles,
  onToggle,
}: {
  data: PricingData;
  editing: boolean;
  onChange: (d: PricingData) => void;
  preview?: boolean;
  pricingToggles: Record<number, boolean>;
  onToggle?: (index: number) => void;
}) {
  const updateRow = (i: number, patch: Partial<PricingItem>) => {
    const items = data.items.map((row, idx) => (idx === i ? { ...row, ...patch } : row));
    onChange({ ...data, items });
  };
  const addRow = () => {
    onChange({
      ...data,
      items: [...data.items, { item: "", description: "", qty: 1, rate: 0, required: false }],
    });
  };
  const removeRow = (i: number) => {
    onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  };

  const requiredTotal = data.items.filter((p) => p.required).reduce((sum, p) => sum + p.qty * p.rate, 0);
  const optionalTotal = data.items
    .filter((p, i) => !p.required && pricingToggles[i])
    .reduce((sum, p) => sum + p.qty * p.rate, 0);
  const total = requiredTotal + optionalTotal;

  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      {editing ? (
        <InlineInput
          value={data.heading}
          onChange={(v) => onChange({ ...data, heading: v })}
          placeholder="Section heading"
          className="font-heading text-[20px] font-semibold text-text-primary"
        />
      ) : (
        <h3 className={`font-heading font-semibold text-text-primary ${preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"}`}>
          {data.heading}
        </h3>
      )}

      {editing ? (
        <InlineInput
          value={data.description}
          onChange={(v) => onChange({ ...data, description: v })}
          placeholder="Description"
          className="mt-2 text-[14px] text-text-secondary"
        />
      ) : (
        <p className="mt-2 text-[14px] text-text-secondary">{data.description}</p>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left" style={{ minWidth: "520px" }}>
          <thead>
            <tr
              className="border-b text-[11px] font-semibold uppercase tracking-wide text-text-muted"
              style={{ borderColor: "rgba(26,26,23,0.10)" }}
            >
              <th className="pb-2.5 pr-3">Item</th>
              <th className="pb-2.5 pr-3 hidden sm:table-cell">Description</th>
              <th className="pb-2.5 pr-3 text-right">Qty</th>
              <th className="pb-2.5 pr-3 text-right">Rate</th>
              <th className="pb-2.5 pr-3 text-right">Total</th>
              <th className="pb-2.5 text-center" style={{ width: "72px" }}>Include</th>
              {editing && <th className="pb-2.5" style={{ width: "32px" }} />}
            </tr>
          </thead>
          <tbody>
            {data.items.map((row, i) => {
              const included = row.required || pricingToggles[i];
              return (
                <tr
                  key={i}
                  className="editor-table-row border-b transition-colors duration-[120ms] ease-out"
                  style={{ borderColor: "rgba(26,26,23,0.06)", opacity: included ? 1 : 0.5 }}
                >
                  <td className="py-3 pr-3 text-[14px] font-medium text-text-primary">
                    {editing ? (
                      <InlineInput value={row.item} onChange={(v) => updateRow(i, { item: v })} placeholder="Line item" className="text-[14px] font-medium" />
                    ) : row.item}
                  </td>
                  <td className="py-3 pr-3 text-[13px] text-text-secondary hidden sm:table-cell">
                    {editing ? (
                      <InlineInput value={row.description} onChange={(v) => updateRow(i, { description: v })} placeholder="Description" className="text-[13px] text-text-secondary" />
                    ) : row.description}
                  </td>
                  <td className="py-3 pr-3 text-right text-[14px] text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {editing ? (
                      <InlineNumber value={row.qty} onChange={(v) => updateRow(i, { qty: v })} min={1} className="text-[14px]" />
                    ) : row.qty}
                  </td>
                  <td className="py-3 pr-3 text-right text-[14px] text-text-secondary" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {editing ? (
                      <InlineNumber value={row.rate} onChange={(v) => updateRow(i, { rate: v })} className="text-[14px]" />
                    ) : formatCurrency(row.rate)}
                  </td>
                  <td className="py-3 pr-3 text-right text-[14px] font-medium text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(row.qty * row.rate)}
                  </td>
                  <td className="py-3 text-center">
                    {editing ? (
                      <ToggleSwitch
                        checked={row.required}
                        onChange={(v) => updateRow(i, { required: v })}
                        size="small"
                        ariaLabel={`Mark ${row.item} as required`}
                      />
                    ) : row.required ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-text">
                        <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                        Req
                      </span>
                    ) : preview ? (
                      <span className={`inline-block text-[12px] font-medium ${pricingToggles[i] ? "text-accent" : "text-text-muted"}`}>
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
                  {editing && (
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="rounded p-1 text-text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove row"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <button
          type="button"
          onClick={addRow}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-accent-text transition-colors hover:bg-accent-subtle"
        >
          <Plus size={14} strokeWidth={2} />
          Add line item
        </button>
      )}

      {/* Totals */}
      <div className="mt-4 flex flex-col items-end gap-1 border-t pt-4" style={{ borderColor: "rgba(26,26,23,0.10)" }}>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-text-secondary">Subtotal (required)</span>
          <span className="text-[14px] font-medium text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(requiredTotal)}
          </span>
        </div>
        {optionalTotal > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-text-secondary">Add-ons</span>
            <span className="text-[14px] font-medium text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
              +{formatCurrency(optionalTotal)}
            </span>
          </div>
        )}
        <div className="mt-1 flex items-center gap-4">
          <span className="text-[14px] font-semibold text-text-primary">Total</span>
          <span className="text-[20px] font-bold text-accent" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-heading)" }}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SignatureBlock({
  data,
  editing,
  onChange,
  preview,
}: {
  data: SignatureData;
  editing: boolean;
  onChange: (d: SignatureData) => void;
  preview?: boolean;
}) {
  return (
    <div className={preview ? "px-8 py-6" : "px-6 py-5"}>
      {editing ? (
        <InlineInput
          value={data.heading}
          onChange={(v) => onChange({ ...data, heading: v })}
          placeholder="Section heading"
          className="font-heading text-[20px] font-semibold text-text-primary"
        />
      ) : (
        <h3 className={`font-heading font-semibold text-text-primary ${preview ? "text-[clamp(22px,3vw,28px)]" : "text-[20px]"}`}>
          {data.heading}
        </h3>
      )}

      {editing ? (
        <InlineInput
          value={data.description}
          onChange={(v) => onChange({ ...data, description: v })}
          placeholder="Description"
          multiline
          className="mt-2 text-[14px] leading-relaxed text-text-secondary"
        />
      ) : (
        <p className="mt-2 text-[14px] leading-relaxed text-text-secondary" style={{ maxWidth: "65ch" }}>
          {data.description}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Client signature */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Client Signature</p>
          <div
            className="mt-2 flex h-[80px] items-end rounded-lg border-b-2 px-4 pb-3"
            style={{ borderColor: "rgba(26,26,23,0.20)", background: "rgba(45,106,79,0.02)" }}
          >
            <span className="text-[14px] italic text-text-muted">Sign here</span>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 space-y-2">
            <div>
              <label htmlFor="sig-name" className="block text-[12px] font-medium text-text-muted">Full Name</label>
              <input
                id="sig-name"
                type="text"
                placeholder="Jane Smith"
                spellCheck={false}
                className="editor-input mt-1 w-full rounded-lg border bg-surface-alt px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 transition-[box-shadow,border-color] duration-[120ms] ease-out"
                style={{ borderColor: "rgba(26,26,23,0.10)", fontSize: "16px" }}
              />
            </div>
            <div>
              <label htmlFor="sig-date" className="block text-[12px] font-medium text-text-muted">Date</label>
              <input
                id="sig-date"
                type="date"
                className="editor-input mt-1 w-full rounded-lg border bg-surface-alt px-3 py-2 text-[14px] text-text-primary transition-[box-shadow,border-color] duration-[120ms] ease-out"
                style={{ borderColor: "rgba(26,26,23,0.10)", fontSize: "16px" }}
              />
            </div>
          </form>
        </div>

        {/* Provider signature */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Provider Signature</p>
          <div
            className="mt-2 flex h-[80px] items-end rounded-lg border-b-2 px-4 pb-3"
            style={{ borderColor: "rgba(26,26,23,0.20)", background: "rgba(45,106,79,0.02)" }}
          >
            <span className="text-[22px] text-accent" style={{ fontFamily: "var(--font-heading)", fontStyle: "italic" }}>
              {data.providerName.split(" ").map((n) => n.charAt(0)).join("") + "."}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-[12px] font-medium text-text-muted">Full Name</p>
              {editing ? (
                <InlineInput
                  value={data.providerName}
                  onChange={(v) => onChange({ ...data, providerName: v })}
                  placeholder="Your name"
                  className="mt-1 text-[14px] text-text-primary"
                />
              ) : (
                <p className="mt-1 text-[14px] text-text-primary">{data.providerName}</p>
              )}
            </div>
            <div>
              <p className="text-[12px] font-medium text-text-muted">Date</p>
              {editing ? (
                <InlineInput
                  value={data.providerDate}
                  onChange={(v) => onChange({ ...data, providerDate: v })}
                  placeholder="Date"
                  className="mt-1 text-[14px] text-text-primary"
                />
              ) : (
                <p className="mt-1 text-[14px] text-text-primary">{data.providerDate}</p>
              )}
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
  onDelete,
  children,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
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
      className="group relative transition-opacity duration-[120ms] ease-out"
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="
          absolute -left-10 top-4 z-10
          flex h-8 w-8 items-center justify-center rounded-md
          opacity-0 group-hover:opacity-100
          transition-opacity duration-[120ms] ease-out
          cursor-grab active:cursor-grabbing select-none
        "
        style={{ background: "rgba(26,26,23,0.04)", color: "var(--color-text-muted)" }}
        aria-label={`Drag to reorder ${block.type} block`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} strokeWidth={1.75} />
      </button>

      {/* Delete button */}
      {isSelected && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="
            absolute -right-10 top-4 z-10
            flex h-8 w-8 items-center justify-center rounded-md
            text-text-muted transition-colors
            hover:bg-destructive/10 hover:text-destructive
            animate-fade-in-up
          "
          aria-label={`Delete ${block.type} block`}
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </button>
      )}

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
        {/* Edit hint */}
        {isSelected && (
          <div
            className="flex items-center gap-2 border-b px-4 py-1.5 animate-fade-in-up"
            style={{ borderColor: "rgba(26,26,23,0.06)", background: "rgba(45,106,79,0.03)" }}
          >
            <PenTool size={12} strokeWidth={2} className="text-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-text select-none">
              Editing {block.type === "cover" ? "Cover Page" : block.type === "scope" ? "Scope" : block.type === "timeline" ? "Timeline" : block.type === "pricing" ? "Pricing" : "Signature"}
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Add Block Dropdown ────────────────────────────────────────────

function AddBlockDropdown({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
        className="editor-add-block inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-[120ms] ease-out cursor-pointer select-none"
        style={{ borderColor: "rgba(26,26,23,0.10)", background: open ? "rgba(45,106,79,0.04)" : "var(--color-surface)" }}
      >
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
        Add Block
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" className="transition-transform duration-[120ms] ease-out" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-[220px] rounded-xl border bg-surface p-1.5 animate-fade-in-up"
          style={{ borderColor: "rgba(26,26,23,0.10)", boxShadow: "var(--shadow-lg)" }}
          role="menu"
        >
          {BLOCK_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                type="button"
                role="menuitem"
                onClick={() => { onAdd(opt.type); setOpen(false); }}
                className="editor-block-option flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-[120ms] ease-out cursor-pointer select-none"
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
  const noop = () => {};
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-surface-alt">
      <div className="mx-auto w-full max-w-[680px] py-10">
        <div className="space-y-0">
          {blocks.map((block) => (
            <div key={block.id} className="bg-surface border-b" style={{ borderColor: "rgba(26,26,23,0.06)" }}>
              {block.type === "cover" && <CoverBlock data={block.data as CoverData} editing={false} onChange={noop} proposalTitle="" clientName="" />}
              {block.type === "scope" && <ScopeBlock data={block.data as ScopeData} editing={false} onChange={noop} preview />}
              {block.type === "timeline" && <TimelineBlock data={block.data as TimelineData} editing={false} onChange={noop} preview />}
              {block.type === "pricing" && <PricingBlock data={block.data as PricingData} editing={false} onChange={noop} preview pricingToggles={pricingToggles} />}
              {block.type === "signature" && <SignatureBlock data={block.data as SignatureData} editing={false} onChange={noop} preview />}
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
  const [pricingToggles, setPricingToggles] = useState<Record<number, boolean>>({ 4: false, 5: false });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock: Block = { id: `block-${type}-${Date.now()}`, type, data: createBlockData(type) };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlockId(null);
  }, []);

  const handleUpdateBlockData = useCallback((id: string, data: BlockData) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data } : b)));
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
    const isEditing = selectedBlockId === block.id;
    const onChange = (data: BlockData) => handleUpdateBlockData(block.id, data);

    switch (block.type) {
      case "cover":
        return <CoverBlock data={block.data as CoverData} editing={isEditing} onChange={onChange} proposalTitle={title} clientName={client} />;
      case "scope":
        return <ScopeBlock data={block.data as ScopeData} editing={isEditing} onChange={onChange} />;
      case "timeline":
        return <TimelineBlock data={block.data as TimelineData} editing={isEditing} onChange={onChange} />;
      case "pricing":
        return <PricingBlock data={block.data as PricingData} editing={isEditing} onChange={onChange} pricingToggles={pricingToggles} onToggle={handleTogglePricing} />;
      case "signature":
        return <SignatureBlock data={block.data as SignatureData} editing={isEditing} onChange={onChange} />;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Top Toolbar ─── */}
      <header
        className="flex shrink-0 items-center gap-4 border-b px-6 py-3 transition-colors duration-[150ms] ease-out"
        style={{ borderColor: "rgba(26,26,23,0.10)", background: "var(--color-surface)" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <form onSubmit={(e) => e.preventDefault()} className="flex min-w-0 items-center gap-3">
            <label htmlFor="proposal-title" className="sr-only">Proposal title</label>
            <input
              id="proposal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              spellCheck={false}
              className="min-w-0 flex-1 truncate border-0 bg-transparent font-heading text-[20px] font-bold text-text-primary placeholder:text-text-muted/40 focus-visible:outline-none"
              style={{ fontSize: "20px" }}
              placeholder="Proposal title"
            />
            <span className="text-[14px] text-text-muted select-none" aria-hidden="true">for</span>
            <label htmlFor="client-name" className="sr-only">Client name</label>
            <input
              id="client-name"
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              spellCheck={false}
              className="w-[140px] truncate rounded-md border bg-surface-alt px-2.5 py-1 text-[14px] font-medium text-text-primary placeholder:text-text-muted/40 transition-[box-shadow,border-color] duration-[120ms] ease-out focus-visible:border-accent focus-visible:outline-none"
              style={{ borderColor: "rgba(26,26,23,0.10)", fontSize: "16px" }}
              placeholder="Client name"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {livePreview ? (
              <Eye size={16} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
            ) : (
              <EyeOff size={16} strokeWidth={1.75} className="text-text-muted" aria-hidden="true" />
            )}
            <span className="text-[13px] font-medium text-text-secondary select-none">Preview</span>
            <ToggleSwitch checked={livePreview} onChange={setLivePreview} ariaLabel="Toggle live preview" />
          </div>

          <div className="h-6 w-px" style={{ background: "rgba(26,26,23,0.10)" }} aria-hidden="true" />

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || sent}
            className="editor-send-btn inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold text-on-accent shadow-sm select-none transition-[background-color,transform,opacity] duration-[120ms] ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: sent ? "var(--color-success)" : "var(--color-accent)" }}
          >
            {sending ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent" aria-hidden="true" />
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

      {/* ─── Body ─── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto dot-grid" style={{ minWidth: 0 }}>
          <div
            ref={editorRef}
            className={`mx-auto w-full py-8 px-4 ${livePreview ? "max-w-[720px]" : "max-w-[800px]"}`}
            style={{ paddingLeft: "56px", paddingRight: "56px" }}
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-5">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
                      <SortableBlock
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onDelete={() => handleDeleteBlock(block.id)}
                      >
                        {renderBlockContent(block)}
                      </SortableBlock>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-6 flex justify-center">
              <AddBlockDropdown onAdd={handleAddBlock} />
            </div>
          </div>
        </div>

        {livePreview && (
          <div className="flex w-[480px] shrink-0 flex-col border-l animate-fade-in-up overflow-hidden" style={{ borderColor: "rgba(26,26,23,0.10)" }}>
            <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "rgba(26,26,23,0.10)", background: "var(--color-surface)" }}>
              <span className="text-[12px] font-semibold uppercase tracking-wide text-text-muted select-none">Client Preview</span>
              <button
                type="button"
                onClick={() => setLivePreview(false)}
                aria-label="Close preview"
                className="editor-close-btn flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors duration-[120ms] ease-out cursor-pointer select-none"
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
