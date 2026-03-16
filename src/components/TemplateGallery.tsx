"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

/* ─── Data ────────────────────────────────────────────────────────────── */

type Category =
  | "All"
  | "Web Design"
  | "Consulting"
  | "Photography"
  | "Marketing"
  | "Development";

const categories: Category[] = [
  "All",
  "Web Design",
  "Consulting",
  "Photography",
  "Marketing",
  "Development",
];

interface Template {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  description: string;
  gradient: string;
  pattern: string;
}

const templates: Template[] = [
  {
    id: "web-design-proposal",
    name: "Web Design Proposal",
    category: "Web Design",
    description:
      "A clean, visual-first layout for presenting website redesigns and new builds.",
    gradient: "linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #74C69D 100%)",
    pattern:
      "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)",
  },
  {
    id: "brand-strategy",
    name: "Brand Strategy",
    category: "Consulting",
    description:
      "Strategic framework for brand positioning, messaging, and identity guidelines.",
    gradient: "linear-gradient(135deg, #1A1A17 0%, #3D3D36 50%, #5C5C56 100%)",
    pattern:
      "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.06) 0%, transparent 40%)",
  },
  {
    id: "wedding-photography",
    name: "Wedding Photography",
    category: "Photography",
    description:
      "Elegant proposal template with gallery sections and tiered pricing packages.",
    gradient: "linear-gradient(135deg, #B45309 0%, #D97706 50%, #FBBF24 100%)",
    pattern:
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.08) 0%, transparent 30%)",
  },
  {
    id: "seo-audit-report",
    name: "SEO Audit Report",
    category: "Marketing",
    description:
      "Data-driven layout with charts, metrics, and actionable recommendations.",
    gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #93C5FD 100%)",
    pattern:
      "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)",
  },
  {
    id: "mobile-app-development",
    name: "Mobile App Development",
    category: "Development",
    description:
      "Technical proposal with timeline milestones, stack overview, and sprint phases.",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #C4B5FD 100%)",
    pattern:
      "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.06) 0%, transparent 30%)",
  },
  {
    id: "ecommerce-redesign",
    name: "E-commerce Redesign",
    category: "Web Design",
    description:
      "Conversion-focused proposal with before/after comparisons and revenue projections.",
    gradient: "linear-gradient(135deg, #065F46 0%, #10B981 50%, #6EE7B7 100%)",
    pattern:
      "radial-gradient(circle at 30% 60%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 40%)",
  },
  {
    id: "business-consulting",
    name: "Business Consulting",
    category: "Consulting",
    description:
      "Executive-friendly proposal for management consulting and advisory engagements.",
    gradient: "linear-gradient(135deg, #44403C 0%, #78716C 50%, #A8A29E 100%)",
    pattern:
      "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.06) 0%, transparent 40%)",
  },
  {
    id: "product-photography",
    name: "Product Photography",
    category: "Photography",
    description:
      "Showcase-ready template for product shoots with mood boards and deliverables.",
    gradient: "linear-gradient(135deg, #92400E 0%, #D97706 50%, #FDE68A 100%)",
    pattern:
      "radial-gradient(circle at 40% 70%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 30%)",
  },
  {
    id: "content-strategy",
    name: "Content Strategy",
    category: "Marketing",
    description:
      "Editorial-style proposal for content plans, calendars, and audience research.",
    gradient: "linear-gradient(135deg, #0E7490 0%, #06B6D4 50%, #67E8F9 100%)",
    pattern:
      "radial-gradient(circle at 20% 40%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.08) 0%, transparent 40%)",
  },
];

/* ─── Component ───────────────────────────────────────────────────────── */

export function TemplateGallery() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="animate-fade-in-up">
          <h1 className="font-heading text-[clamp(28px,4vw,40px)] font-bold leading-tight text-text-primary">
            Template Gallery
          </h1>
          <p className="mt-2 text-[16px] leading-relaxed text-text-secondary">
            Start with a professionally designed template
          </p>
        </header>

        {/* ── Category pills ──────────────────────────────────────── */}
        <nav
          className="animate-fade-in-up mt-8 flex flex-wrap gap-2"
          style={{ animationDelay: "60ms" }}
          role="tablist"
          aria-label="Filter templates by category"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`
                  rounded-full px-4 py-2 text-[14px] font-medium
                  select-none cursor-pointer
                  transition-[background-color,color,box-shadow] duration-[120ms] ease-out
                  focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-accent)]
                  ${
                    isActive
                      ? "bg-accent text-on-accent shadow-sm"
                      : "bg-surface-alt text-text-secondary hover:bg-[rgba(45,106,79,0.08)] hover:text-accent-text"
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* ── Grid ────────────────────────────────────────────────── */}
        <div
          className="mt-8 grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-3"
          role="tabpanel"
        >
          {filtered.map((template, index) => (
            <article
              key={template.id}
              className="
                template-card group
                animate-fade-in-up
                flex flex-col overflow-hidden rounded-2xl
                bg-surface shadow-paper
                transition-[transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)]
                hover:-translate-y-[2px] hover:shadow-lg
              "
              style={{
                animationDelay: `${120 + index * 40}ms`,
              }}
            >
              {/* Thumbnail */}
              <div
                className="
                  relative aspect-[16/10] overflow-hidden
                  transition-[filter] duration-[200ms] ease-out
                  saturate-[0.85] group-hover:saturate-100
                "
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0"
                  style={{ background: template.gradient }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: template.pattern }}
                />
                {/* Decorative document lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[60%] space-y-2.5 rounded-lg bg-white/[0.15] p-5 backdrop-blur-[1px]">
                    <div className="h-2.5 w-[70%] rounded-full bg-white/30" />
                    <div className="h-2 w-full rounded-full bg-white/20" />
                    <div className="h-2 w-[85%] rounded-full bg-white/20" />
                    <div className="h-2 w-[60%] rounded-full bg-white/15" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[20px] font-semibold leading-snug text-text-primary font-body">
                    {template.name}
                  </h3>
                </div>

                {/* Category badge */}
                <div className="mt-2">
                  <span className="inline-block rounded-full bg-accent-subtle px-2.5 py-0.5 text-[12px] font-medium text-accent-text">
                    {template.category}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-text-secondary line-clamp-2">
                  {template.description}
                </p>

                {/* CTA */}
                <button
                  type="button"
                  className="
                    mt-5 flex w-full items-center justify-center gap-2
                    rounded-lg bg-accent px-4 py-2.5
                    text-[14px] font-semibold text-on-accent
                    shadow-sm select-none cursor-pointer
                    transition-[background-color,transform] duration-[120ms] ease-out
                    hover:bg-accent-hover
                    active:scale-[0.97]
                    focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-accent)]
                  "
                >
                  <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Use Template</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* ── Empty state ─────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[16px] font-medium text-text-secondary">
              No templates in this category yet
            </p>
            <p className="mt-1 text-[14px] text-text-muted">
              Try selecting a different category above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
