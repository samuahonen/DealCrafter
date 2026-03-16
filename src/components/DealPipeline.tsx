"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, Eye, GripVertical, TrendingUp } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Stage = "draft" | "sent" | "viewed" | "signed" | "expired";

interface Deal {
  id: string;
  client: string;
  title: string;
  value: number;
  daysSinceSent: number;
  viewCount: number;
  stage: Stage;
}

interface StageConfig {
  id: Stage;
  label: string;
  colorVar: string;
  colorHex: string;
}

// ---------------------------------------------------------------------------
// Stage Configuration
// ---------------------------------------------------------------------------

const STAGES: StageConfig[] = [
  { id: "draft", label: "Draft", colorVar: "var(--color-stage-draft)", colorHex: "#6B6B64" },
  { id: "sent", label: "Sent", colorVar: "var(--color-stage-sent)", colorHex: "#2D6A4F" },
  { id: "viewed", label: "Viewed", colorVar: "var(--color-stage-viewed)", colorHex: "#B45309" },
  { id: "signed", label: "Signed", colorVar: "var(--color-stage-signed)", colorHex: "#15803D" },
  { id: "expired", label: "Expired", colorVar: "var(--color-stage-expired)", colorHex: "#DC2626" },
];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const INITIAL_DEALS: Deal[] = [
  // Draft (3)
  { id: "d1", client: "Meridian Studio", title: "Brand identity package", value: 8500, daysSinceSent: 0, viewCount: 0, stage: "draft" },
  { id: "d2", client: "Oakwood Ventures", title: "Investor deck design", value: 3200, daysSinceSent: 0, viewCount: 0, stage: "draft" },
  { id: "d3", client: "Lumen Health", title: "Website redesign proposal", value: 14800, daysSinceSent: 0, viewCount: 0, stage: "draft" },
  // Sent (4)
  { id: "s1", client: "Blackbird Coffee", title: "Packaging & label design", value: 4500, daysSinceSent: 3, viewCount: 0, stage: "sent" },
  { id: "s2", client: "Atlas Freight", title: "Fleet branding rollout", value: 12000, daysSinceSent: 1, viewCount: 0, stage: "sent" },
  { id: "s3", client: "Nora Wellness", title: "App UI/UX design", value: 9200, daysSinceSent: 5, viewCount: 0, stage: "sent" },
  { id: "s4", client: "Pine & Bloom", title: "E-commerce site build", value: 7800, daysSinceSent: 2, viewCount: 0, stage: "sent" },
  // Viewed (3)
  { id: "v1", client: "Riviera Homes", title: "Marketing collateral suite", value: 6200, daysSinceSent: 7, viewCount: 4, stage: "viewed" },
  { id: "v2", client: "Summit Analytics", title: "Dashboard design system", value: 11500, daysSinceSent: 4, viewCount: 2, stage: "viewed" },
  { id: "v3", client: "Cleo Cosmetics", title: "Product launch campaign", value: 5800, daysSinceSent: 6, viewCount: 8, stage: "viewed" },
  // Signed (3)
  { id: "g1", client: "Horizon Labs", title: "SaaS onboarding flow", value: 15200, daysSinceSent: 14, viewCount: 6, stage: "signed" },
  { id: "g2", client: "Ember Studio", title: "Rebrand & style guide", value: 9800, daysSinceSent: 10, viewCount: 3, stage: "signed" },
  { id: "g3", client: "Coastline Realty", title: "Listing presentation kit", value: 2400, daysSinceSent: 21, viewCount: 5, stage: "signed" },
  // Expired (2)
  { id: "e1", client: "Voltera Motors", title: "Showroom experience design", value: 7200, daysSinceSent: 32, viewCount: 1, stage: "expired" },
  { id: "e2", client: "Juniper & Co", title: "Annual report design", value: 3600, daysSinceSent: 45, viewCount: 0, stage: "expired" },
];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Deal Card (Sortable)
// ---------------------------------------------------------------------------

interface DealCardProps {
  deal: Deal;
  isDragOverlay?: boolean;
}

function DealCardContent({ deal, isDragOverlay }: DealCardProps) {
  return (
    <div
      className={`
        group relative rounded-lg border border-border bg-surface
        transition-[box-shadow,transform] duration-[120ms]
        ${isDragOverlay
          ? "shadow-lg rotate-[1.5deg] scale-[1.02]"
          : "shadow-md"
        }
      `}
      style={{
        cursor: isDragOverlay ? "grabbing" : undefined,
      }}
    >
      <div className="p-4">
        {/* Drag handle — visible on hover */}
        <div
          className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-[120ms] group-hover:opacity-40 pointer-events-none"
          aria-hidden="true"
        >
          <GripVertical size={14} className="text-text-muted" />
        </div>

        {/* Client name */}
        <h4 className="text-[16px] font-semibold leading-snug text-text-primary select-none">
          {deal.client}
        </h4>

        {/* Proposal title */}
        <p className="mt-0.5 text-[14px] leading-snug text-text-secondary select-none">
          {deal.title}
        </p>

        {/* Value */}
        <p className="mt-3 text-[18px] font-semibold text-accent-text select-none" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(deal.value)}
        </p>

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-3">
          {/* Days since sent */}
          {deal.daysSinceSent > 0 && (
            <span className="flex items-center gap-1 text-[12px] font-medium text-text-muted select-none" style={{ fontVariantNumeric: "tabular-nums" }}>
              <Clock size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
              {deal.daysSinceSent}d ago
            </span>
          )}

          {/* View count */}
          {deal.viewCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium select-none"
              style={{
                background: "rgba(45,106,79,0.08)",
                color: "var(--color-accent-text)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Eye size={11} strokeWidth={2} aria-hidden="true" className="shrink-0" />
              {deal.viewCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableDealCard({ deal }: { deal: Deal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="deal-card-wrapper cursor-grab active:cursor-grabbing"
    >
      <DealCardContent deal={deal} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

interface ColumnProps {
  stage: StageConfig;
  deals: Deal[];
}

function Column({ stage, deals }: ColumnProps) {
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const dealIds = deals.map((d) => d.id);

  return (
    <div
      className="flex w-[320px] shrink-0 flex-col rounded-xl bg-surface-alt/60"
      style={{
        borderLeft: `4px solid ${stage.colorVar}`,
        minHeight: 200,
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[14px] font-semibold text-text-primary select-none">
            {stage.label}
          </h3>
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold select-none"
            style={{
              background: `${stage.colorHex}14`,
              color: stage.colorHex,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {deals.length}
          </span>
        </div>
        <span
          className="text-[13px] font-semibold text-text-muted select-none"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatCurrency(totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <SortableDealCard deal={deal} />
            </div>
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-[13px] text-text-muted/60 select-none">
              No deals yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DealPipeline() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<Stage, Deal[]> = {
      draft: [],
      sent: [],
      viewed: [],
      signed: [],
      expired: [],
    };
    for (const deal of deals) {
      grouped[deal.stage].push(deal);
    }
    return grouped;
  }, [deals]);

  // Total pipeline value
  const totalValue = useMemo(
    () => deals.reduce((sum, d) => sum + d.value, 0),
    [deals]
  );

  const activeDeal = activeDealId
    ? deals.find((d) => d.id === activeDealId) ?? null
    : null;

  // --- DnD Handlers ---

  function handleDragStart(event: DragStartEvent) {
    setActiveDealId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which stage the active deal is in
    const activeDeal = deals.find((d) => d.id === activeId);
    if (!activeDeal) return;

    // Determine target stage: either the over item's stage, or if over is a column droppable
    let targetStage: Stage | null = null;

    // Check if hovering over another deal
    const overDeal = deals.find((d) => d.id === overId);
    if (overDeal) {
      targetStage = overDeal.stage;
    } else {
      // Check if hovering over a column ID (stage name)
      const stageIds = STAGES.map((s) => s.id);
      if (stageIds.includes(overId as Stage)) {
        targetStage = overId as Stage;
      }
    }

    if (targetStage && activeDeal.stage !== targetStage) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === activeId ? { ...d, stage: targetStage as Stage } : d
        )
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDealId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Reorder within the same column
    const activeDeal = deals.find((d) => d.id === activeId);
    const overDeal = deals.find((d) => d.id === overId);

    if (activeDeal && overDeal && activeDeal.stage === overDeal.stage) {
      setDeals((prev) => {
        const stageDeals = prev.filter((d) => d.stage === activeDeal.stage);
        const otherDeals = prev.filter((d) => d.stage !== activeDeal.stage);
        const oldIndex = stageDeals.findIndex((d) => d.id === activeId);
        const newIndex = stageDeals.findIndex((d) => d.id === overId);

        const reordered = [...stageDeals];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        return [...otherDeals, ...reordered];
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page header */}
      <header className="flex items-end justify-between border-b border-border px-8 pt-8 pb-6">
        <div className="animate-fade-in-up">
          <h1 className="font-heading text-[clamp(28px,4vw,40px)] font-bold leading-tight text-text-primary">
            Deal Pipeline
          </h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            Track your proposals from draft to signed
          </p>
        </div>
        <div className="animate-fade-in-up flex items-center gap-2.5" style={{ animationDelay: "80ms" }}>
          <TrendingUp size={18} strokeWidth={2} className="text-accent" aria-hidden="true" />
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted select-none">
              Pipeline Value
            </p>
            <p
              className="text-[24px] font-bold leading-tight text-text-primary"
              style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-body)" }}
            >
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>
      </header>

      {/* Kanban board */}
      <div className="flex flex-1 overflow-x-auto overflow-y-hidden px-8 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5">
            {STAGES.map((stage) => (
              <SortableContext
                key={stage.id}
                items={dealsByStage[stage.id].map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column
                  stage={stage}
                  deals={dealsByStage[stage.id]}
                />
              </SortableContext>
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDeal ? (
              <div style={{ width: 320 }}>
                <DealCardContent deal={activeDeal} isDragOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
