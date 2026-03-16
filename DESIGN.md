# DealCraft Design System

> Warm, editorial, paper-textured — a Notion-meets-Qwilr aesthetic for freelance proposals and contracts

## Stack
- Framework: Next.js with App Router
- CSS: Tailwind CSS v4
- Component library: custom components with Radix primitives
- Language: TypeScript
- Icons: Lucide React
- Drag: @dnd-kit

## Colors

### Light Mode
| Role | Value | Usage |
|------|-------|-------|
| Background | `#FAFAF8` | Page background, warm off-white |
| Surface | `#FFFFFF` | Cards, panels, proposal blocks |
| Surface Alt | `#F4F4F0` | Sidebar, template gallery bg, input bg |
| Border | `rgba(26,26,23,0.10)` | All borders |
| Border Strong | `rgba(26,26,23,0.20)` | Focused inputs, dividers |
| Text Primary | `#1A1A17` | Headings, primary content |
| Text Secondary | `#5C5C56` | Descriptions, secondary copy |
| Text Muted | `#6B6B64` | Captions, metadata, timestamps |
| Accent | `#2D6A4F` | Primary CTAs, links, active states |
| Accent Hover | `#245A42` | Button hover |
| Accent Text | `#1B5E3B` | Green text on light backgrounds |
| Accent Subtle | `rgba(45,106,79,0.08)` | Hover states, selected blocks, badges |
| Accent Surface | `rgba(45,106,79,0.04)` | Active sidebar items, light tint |
| On Accent | `#FFFFFF` | Text on accent buttons |
| Destructive | `#DC2626` | Errors, delete actions |
| Warning | `#B45309` | Warnings, pending states |
| Success | `#15803D` | Confirmations, sent status |
| Dot Grid | `rgba(26,26,23,0.06)` | Editor dotted grid pattern |

### Pipeline Deal Stages
| Stage | Color | Usage |
|-------|-------|-------|
| Draft | `#6B6B64` | Gray, not yet sent |
| Sent | `#2D6A4F` | Green accent, awaiting response |
| Viewed | `#B45309` | Amber, client has opened |
| Signed | `#15803D` | Green, deal won |
| Expired | `#DC2626` | Red, deal expired |

## Typography

- **Heading font:** `'Playfair Display', Georgia, 'Times New Roman', serif`
- **Body font:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Level | Size | Weight | Font | Usage |
|-------|------|--------|------|-------|
| Display | `clamp(36px, 5vw, 56px)` | 700 | Playfair Display | Proposal titles, hero |
| H1 | `clamp(28px, 4vw, 40px)` | 700 | Playfair Display | Page titles |
| H2 | `clamp(22px, 3vw, 28px)` | 600 | Playfair Display | Section headings |
| H3 | `20px` | 600 | Inter | Card headings, block titles |
| H4 | `16px` | 600 | Inter | Sub-sections |
| Body | `16px` | 400 | Inter | Default text |
| Body Small | `14px` | 400 | Inter | Secondary text, sidebar |
| Caption | `12px` | 500 | Inter | Labels, metadata, badges |
| Overline | `11px` | 600 | Inter | Uppercase labels, stage tags |

## Shadows

| Level | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 3px rgba(26,26,23,0.06), 0 1px 2px rgba(26,26,23,0.04)` | Subtle lift |
| md | `0 4px 12px rgba(26,26,23,0.07), 0 1px 4px rgba(26,26,23,0.04)` | Cards |
| lg | `0 8px 24px rgba(26,26,23,0.08), 0 2px 8px rgba(26,26,23,0.04)` | Dropdowns |
| paper | `0 1px 4px rgba(26,26,23,0.06), 0 8px 16px rgba(26,26,23,0.04), 0 0 0 1px rgba(26,26,23,0.03)` | Proposal cards |

## Motion
- Micro: 120ms ease-out (hover, press)
- Transition: 200ms cubic-bezier(0.32, 0.72, 0, 1) (dropdowns)
- Enter: 250ms ease (modals, panels)
- Stagger: 40ms per element, max 400ms

## Component Patterns

### Editor Blocks
- Dotted grid: `radial-gradient(circle, var(--dot-grid) 1px, transparent 1px)` at 24px
- Selected block: accent subtle bg + accent left border (3px)
- Drag handle on hover (left gutter)

### Template Gallery Cards
- 3-col grid desktop, 2 tablet, 1 mobile
- Paper shadow, 16:10 thumbnails
- Category filter pills at top

### Kanban Board
- Horizontal scroll, 320px columns
- Stage color left border (4px)
- Deal cards with client name, value, days, view count

### Client Portal
- Centered, max-width 680px
- Sticky bottom bar with Accept/Decline
- Clean typographic content

### Buttons
| Variant | Background | Text |
|---------|-----------|------|
| Primary | `#2D6A4F` | `#FFFFFF` |
| Secondary | `#FFFFFF` | `#1A1A17` |
| Ghost | transparent | `#5C5C56` |
| Destructive | `#DC2626` | `#FFFFFF` |
