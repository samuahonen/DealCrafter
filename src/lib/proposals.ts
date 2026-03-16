import LZString from "lz-string";

// ─── Types ─────────────────────────────────────────────────────────

export type BlockType = "cover" | "scope" | "timeline" | "pricing" | "signature";

export interface CoverData {
  title: string;
  subtitle: string;
  date: string;
}

export interface ScopeData {
  heading: string;
  description: string;
  items: string[];
}

export interface TimelineTask {
  name: string;
  start: number;
  duration: number;
  color: string;
}

export interface TimelineData {
  heading: string;
  description: string;
  totalWeeks: number;
  tasks: TimelineTask[];
}

export interface PricingItem {
  item: string;
  description: string;
  qty: number;
  rate: number;
  required: boolean;
}

export interface PricingData {
  heading: string;
  description: string;
  items: PricingItem[];
}

export interface SignatureData {
  heading: string;
  description: string;
  providerName: string;
  providerDate: string;
}

export type BlockData = CoverData | ScopeData | TimelineData | PricingData | SignatureData;

export interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
}

export interface Proposal {
  id: string;
  title: string;
  client: string;
  blocks: Block[];
  pricingToggles: Record<number, boolean>;
  createdAt: string;
  updatedAt: string;
}

// ─── Default Data ─────────────────────────────────────────────────

export function defaultCoverData(): CoverData {
  return {
    title: "Website Redesign Proposal",
    subtitle: "Acme Corp",
    date: "March 2026 \u00b7 Valid for 30 days",
  };
}

export function defaultScopeData(): ScopeData {
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

export function defaultTimelineData(): TimelineData {
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

export function defaultPricingData(): PricingData {
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

export function defaultSignatureData(): SignatureData {
  return {
    heading: "Acceptance & Signature",
    description: "By signing below, you agree to the scope, timeline, and investment outlined in this proposal. This agreement is valid for 30 days from the date of issue.",
    providerName: "Your Name",
    providerDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  };
}

export function createBlockData(type: BlockType): BlockData {
  switch (type) {
    case "cover": return defaultCoverData();
    case "scope": return defaultScopeData();
    case "timeline": return defaultTimelineData();
    case "pricing": return defaultPricingData();
    case "signature": return defaultSignatureData();
  }
}

export function createDefaultBlocks(): Block[] {
  return [
    { id: "block-cover", type: "cover", data: defaultCoverData() },
    { id: "block-scope", type: "scope", data: defaultScopeData() },
    { id: "block-timeline", type: "timeline", data: defaultTimelineData() },
    { id: "block-pricing", type: "pricing", data: defaultPricingData() },
    { id: "block-signature", type: "signature", data: defaultSignatureData() },
  ];
}

export function createProposal(overrides?: Partial<Proposal>): Proposal {
  const now = new Date().toISOString();
  return {
    id: `proposal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "Untitled Proposal",
    client: "",
    blocks: createDefaultBlocks(),
    pricingToggles: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ─── localStorage CRUD ────────────────────────────────────────────

const STORAGE_KEY = "dealcraft_proposals";

export function getProposals(): Proposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getProposal(id: string): Proposal | null {
  return getProposals().find((p) => p.id === id) ?? null;
}

export function saveProposal(proposal: Proposal): void {
  const proposals = getProposals();
  const index = proposals.findIndex((p) => p.id === proposal.id);
  const updated = { ...proposal, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    proposals[index] = updated;
  } else {
    proposals.unshift(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

export function deleteProposal(id: string): void {
  const proposals = getProposals().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

export function duplicateProposal(id: string): Proposal | null {
  const original = getProposal(id);
  if (!original) return null;
  const copy = createProposal({
    title: `${original.title} (Copy)`,
    client: original.client,
    blocks: JSON.parse(JSON.stringify(original.blocks)),
    pricingToggles: { ...original.pricingToggles },
  });
  saveProposal(copy);
  return copy;
}

// ─── Share Link Encoding ──────────────────────────────────────────

export function encodeProposalForShare(proposal: Proposal): string {
  const payload = {
    t: proposal.title,
    c: proposal.client,
    b: proposal.blocks,
    p: proposal.pricingToggles,
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeProposalFromShare(encoded: string): Proposal | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const payload = JSON.parse(json);
    return createProposal({
      title: payload.t,
      client: payload.c,
      blocks: payload.b,
      pricingToggles: payload.p,
    });
  } catch {
    return null;
  }
}

// ─── Formatting ───────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Template Presets ─────────────────────────────────────────────

export interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  gradient: string;
  pattern: string;
  proposal: Partial<Proposal>;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "web-design-proposal",
    name: "Web Design Proposal",
    category: "Web Design",
    description: "A clean, visual-first layout for presenting website redesigns and new builds.",
    gradient: "linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #74C69D 100%)",
    pattern: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12) 0%, transparent 50%)",
    proposal: {
      title: "Website Redesign Proposal",
      client: "",
      blocks: createDefaultBlocks(),
    },
  },
  {
    id: "brand-strategy",
    name: "Brand Strategy",
    category: "Consulting",
    description: "Strategic framework for brand positioning, messaging, and identity guidelines.",
    gradient: "linear-gradient(135deg, #1A1A17 0%, #3D3D36 50%, #5C5C56 100%)",
    pattern: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
    proposal: {
      title: "Brand Strategy Proposal",
      blocks: [
        { id: "block-cover", type: "cover", data: { title: "Brand Strategy Proposal", subtitle: "", date: `${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} \u00b7 Valid for 30 days` } },
        { id: "block-scope", type: "scope", data: { heading: "Engagement Scope", description: "A comprehensive brand strategy engagement covering research, positioning, and creative direction.", items: ["Brand audit and competitive landscape analysis", "Stakeholder interviews and brand workshop", "Brand positioning and messaging framework", "Visual identity direction (moodboards, color, typography)", "Brand guidelines document", "Internal rollout presentation"] } },
        { id: "block-timeline", type: "timeline", data: { heading: "Project Timeline", description: "Estimated 8-week engagement.", totalWeeks: 8, tasks: [{ name: "Discovery", start: 0, duration: 2, color: "#1A1A17" }, { name: "Strategy", start: 2, duration: 2, color: "#3D3D36" }, { name: "Creative Direction", start: 4, duration: 2, color: "#5C5C56" }, { name: "Guidelines", start: 6, duration: 2, color: "#1A1A17" }] } },
        { id: "block-pricing", type: "pricing", data: { heading: "Investment", description: "Fixed-fee engagement with milestone billing.", items: [{ item: "Brand Audit", description: "Research and competitive analysis", qty: 1, rate: 4000, required: true }, { item: "Strategy Workshop", description: "Full-day facilitated session", qty: 1, rate: 3500, required: true }, { item: "Positioning Framework", description: "Messaging and positioning docs", qty: 1, rate: 5000, required: true }, { item: "Visual Identity", description: "Creative direction package", qty: 1, rate: 6000, required: true }, { item: "Brand Guidelines", description: "Comprehensive brand book", qty: 1, rate: 3000, required: false }] } },
        { id: "block-signature", type: "signature", data: defaultSignatureData() },
      ],
    },
  },
  {
    id: "mobile-app-development",
    name: "Mobile App Development",
    category: "Development",
    description: "Technical proposal with timeline milestones, stack overview, and sprint phases.",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #C4B5FD 100%)",
    pattern: "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.12) 0%, transparent 50%)",
    proposal: {
      title: "Mobile App Development Proposal",
      blocks: [
        { id: "block-cover", type: "cover", data: { title: "Mobile App Development Proposal", subtitle: "", date: `${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} \u00b7 Valid for 30 days` } },
        { id: "block-scope", type: "scope", data: { heading: "Scope of Work", description: "End-to-end mobile application development for iOS and Android.", items: ["Product requirements and technical architecture", "UI/UX design (Figma) for all screens", "React Native development (iOS + Android)", "API integration and backend services", "Push notifications and analytics", "App Store and Play Store submission", "30-day post-launch support"] } },
        { id: "block-timeline", type: "timeline", data: { heading: "Sprint Timeline", description: "Estimated 16-week engagement in 2-week sprints.", totalWeeks: 16, tasks: [{ name: "Discovery & Architecture", start: 0, duration: 2, color: "#6D28D9" }, { name: "UI/UX Design", start: 2, duration: 3, color: "#8B5CF6" }, { name: "Sprint 1-3: Core Features", start: 4, duration: 6, color: "#6D28D9" }, { name: "Sprint 4-5: Polish", start: 10, duration: 4, color: "#8B5CF6" }, { name: "QA & Submission", start: 14, duration: 2, color: "#C4B5FD" }] } },
        { id: "block-pricing", type: "pricing", data: { heading: "Investment", description: "Billed per sprint with upfront discovery.", items: [{ item: "Discovery & Architecture", description: "Requirements, tech spec, architecture", qty: 1, rate: 8000, required: true }, { item: "UI/UX Design", description: "All screens, components, prototype", qty: 1, rate: 12000, required: true }, { item: "Development Sprints", description: "2-week sprints, cross-platform", qty: 5, rate: 9000, required: true }, { item: "QA & App Store", description: "Testing, submission, launch", qty: 1, rate: 5000, required: true }, { item: "Post-Launch Support", description: "30-day bug fixes and monitoring", qty: 1, rate: 3000, required: false }] } },
        { id: "block-signature", type: "signature", data: defaultSignatureData() },
      ],
    },
  },
  {
    id: "seo-audit-report",
    name: "SEO Audit & Strategy",
    category: "Marketing",
    description: "Data-driven layout with actionable recommendations and implementation plan.",
    gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #93C5FD 100%)",
    pattern: "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
    proposal: {
      title: "SEO Audit & Strategy Proposal",
      blocks: [
        { id: "block-cover", type: "cover", data: { title: "SEO Audit & Strategy Proposal", subtitle: "", date: `${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} \u00b7 Valid for 30 days` } },
        { id: "block-scope", type: "scope", data: { heading: "Audit Scope", description: "Comprehensive technical and content SEO audit with actionable roadmap.", items: ["Technical SEO audit (crawlability, indexation, Core Web Vitals)", "On-page SEO analysis across all key pages", "Keyword gap analysis and opportunity mapping", "Competitor backlink and content analysis", "Content strategy and editorial calendar", "Monthly reporting and rank tracking setup"] } },
        { id: "block-timeline", type: "timeline", data: { heading: "Engagement Timeline", description: "6-week audit and strategy delivery.", totalWeeks: 6, tasks: [{ name: "Technical Audit", start: 0, duration: 2, color: "#1E40AF" }, { name: "Content Analysis", start: 1, duration: 2, color: "#3B82F6" }, { name: "Strategy & Roadmap", start: 3, duration: 2, color: "#1E40AF" }, { name: "Implementation Plan", start: 5, duration: 1, color: "#93C5FD" }] } },
        { id: "block-pricing", type: "pricing", data: { heading: "Investment", description: "One-time audit fee with optional ongoing retainer.", items: [{ item: "Technical SEO Audit", description: "Full crawl analysis and fixes", qty: 1, rate: 3500, required: true }, { item: "Content & Keyword Audit", description: "Gap analysis and opportunity map", qty: 1, rate: 2500, required: true }, { item: "Strategy Document", description: "Prioritized roadmap and calendar", qty: 1, rate: 2000, required: true }, { item: "Monthly Retainer", description: "Ongoing optimization and reporting", qty: 3, rate: 1500, required: false }] } },
        { id: "block-signature", type: "signature", data: defaultSignatureData() },
      ],
    },
  },
  {
    id: "photography-package",
    name: "Photography Package",
    category: "Photography",
    description: "Elegant proposal with tiered pricing packages and deliverables.",
    gradient: "linear-gradient(135deg, #B45309 0%, #D97706 50%, #FBBF24 100%)",
    pattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)",
    proposal: {
      title: "Photography Package Proposal",
      blocks: [
        { id: "block-cover", type: "cover", data: { title: "Photography Package Proposal", subtitle: "", date: `${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} \u00b7 Valid for 30 days` } },
        { id: "block-scope", type: "scope", data: { heading: "What's Included", description: "A tailored photography package for your project.", items: ["Pre-shoot consultation and creative direction", "Full-day on-location photo shoot (8 hours)", "Professional lighting and equipment", "Image selection and retouching (50 finals)", "High-resolution files with commercial usage rights", "Online gallery for sharing and downloading"] } },
        { id: "block-pricing", type: "pricing", data: { heading: "Investment", description: "Package pricing with optional add-ons.", items: [{ item: "Full-Day Shoot", description: "8 hours on location", qty: 1, rate: 3500, required: true }, { item: "Retouching", description: "50 final edited images", qty: 50, rate: 25, required: true }, { item: "Rush Delivery", description: "48-hour turnaround", qty: 1, rate: 500, required: false }, { item: "Additional Hour", description: "Extended shoot time", qty: 2, rate: 350, required: false }] } },
        { id: "block-signature", type: "signature", data: defaultSignatureData() },
      ],
    },
  },
  {
    id: "ecommerce-redesign",
    name: "E-commerce Redesign",
    category: "Web Design",
    description: "Conversion-focused proposal with revenue projections and phased rollout.",
    gradient: "linear-gradient(135deg, #065F46 0%, #10B981 50%, #6EE7B7 100%)",
    pattern: "radial-gradient(circle at 30% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)",
    proposal: {
      title: "E-commerce Redesign Proposal",
      blocks: [
        { id: "block-cover", type: "cover", data: { title: "E-commerce Redesign Proposal", subtitle: "", date: `${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} \u00b7 Valid for 30 days` } },
        { id: "block-scope", type: "scope", data: { heading: "Scope of Work", description: "Full e-commerce platform redesign focused on conversion optimization.", items: ["Conversion audit and UX research", "Information architecture and user flows", "Product page and checkout redesign", "Mobile-first responsive design", "Shopify/WooCommerce theme development", "A/B testing setup for key pages", "Performance optimization and launch"] } },
        { id: "block-timeline", type: "timeline", data: { heading: "Project Timeline", description: "Estimated 12-week phased rollout.", totalWeeks: 12, tasks: [{ name: "Research & Audit", start: 0, duration: 2, color: "#065F46" }, { name: "UX Design", start: 2, duration: 3, color: "#10B981" }, { name: "UI Design", start: 4, duration: 3, color: "#065F46" }, { name: "Development", start: 6, duration: 4, color: "#10B981" }, { name: "Testing & Launch", start: 10, duration: 2, color: "#6EE7B7" }] } },
        { id: "block-pricing", type: "pricing", data: { heading: "Investment", description: "Phased billing aligned with milestones.", items: [{ item: "Research & Strategy", description: "Conversion audit, user research", qty: 1, rate: 4500, required: true }, { item: "UX/UI Design", description: "All pages and components", qty: 1, rate: 8000, required: true }, { item: "Development", description: "Theme build and integrations", qty: 1, rate: 12000, required: true }, { item: "A/B Testing", description: "Setup and first round of tests", qty: 1, rate: 2000, required: false }] } },
        { id: "block-signature", type: "signature", data: defaultSignatureData() },
      ],
    },
  },
];
