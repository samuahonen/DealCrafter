"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { TEMPLATE_PRESETS, createProposal, saveProposal, type TemplatePreset } from "@/lib/proposals";

type Category = "All" | "Web Design" | "Consulting" | "Photography" | "Marketing" | "Development";

const categories: Category[] = ["All", "Web Design", "Consulting", "Photography", "Marketing", "Development"];

export function TemplateGallery() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? TEMPLATE_PRESETS
      : TEMPLATE_PRESETS.filter((t) => t.category === activeCategory);

  const handleUseTemplate = (template: TemplatePreset) => {
    const proposal = createProposal({
      title: template.proposal.title ?? template.name,
      client: template.proposal.client ?? "",
      blocks: template.proposal.blocks ? JSON.parse(JSON.stringify(template.proposal.blocks)) : undefined,
      pricingToggles: template.proposal.pricingToggles ?? {},
    });
    saveProposal(proposal);
    router.push(`/proposals/${proposal.id}`);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
        <header className="animate-fade-in-up">
          <h1 className="font-heading text-[clamp(28px,4vw,40px)] font-bold leading-tight text-text-primary">
            Template Gallery
          </h1>
          <p className="mt-2 text-[16px] leading-relaxed text-text-secondary">
            Start with a professionally designed template
          </p>
        </header>

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
                  rounded-full px-4 py-2 text-[14px] font-medium select-none cursor-pointer
                  transition-[background-color,color,box-shadow] duration-[120ms] ease-out
                  ${isActive
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

        <div className="mt-8 grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel">
          {filtered.map((template, index) => (
            <article
              key={template.id}
              className="template-card group animate-fade-in-up flex flex-col overflow-hidden rounded-2xl bg-surface shadow-paper transition-[transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-[2px] hover:shadow-lg"
              style={{ animationDelay: `${120 + index * 40}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden saturate-[0.85] group-hover:saturate-100 transition-[filter] duration-[200ms]" aria-hidden="true">
                <div className="absolute inset-0" style={{ background: template.gradient }} />
                <div className="absolute inset-0" style={{ background: template.pattern }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[60%] space-y-2.5 rounded-lg bg-white/[0.15] p-5 backdrop-blur-[1px]">
                    <div className="h-2.5 w-[70%] rounded-full bg-white/30" />
                    <div className="h-2 w-full rounded-full bg-white/20" />
                    <div className="h-2 w-[85%] rounded-full bg-white/20" />
                    <div className="h-2 w-[60%] rounded-full bg-white/15" />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[20px] font-semibold leading-snug text-text-primary font-body">
                  {template.name}
                </h3>
                <div className="mt-2">
                  <span className="inline-block rounded-full bg-accent-subtle px-2.5 py-0.5 text-[12px] font-medium text-accent-text">
                    {template.category}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-text-secondary line-clamp-2">
                  {template.description}
                </p>
                <button
                  type="button"
                  onClick={() => handleUseTemplate(template)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[14px] font-semibold text-on-accent shadow-sm cursor-pointer select-none transition-[background-color,transform] duration-[120ms] ease-out hover:bg-accent-hover active:scale-[0.97]"
                >
                  <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Use Template</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="animate-fade-in-up flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[16px] font-medium text-text-secondary">No templates in this category yet</p>
            <p className="mt-1 text-[14px] text-text-muted">Try selecting a different category above</p>
          </div>
        )}
      </div>
    </div>
  );
}
