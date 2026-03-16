"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FileText, LayoutGrid, Kanban, Plus } from "lucide-react";

const navItems = [
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/templates", label: "Templates", icon: LayoutGrid },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
] as const;

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-surface-alt">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <span className="font-heading text-[20px] font-bold tracking-tight text-text-primary">
            DealCraft
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2" role="navigation">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  nav-link animate-fade-in-up stagger-${index + 1}
                  group flex items-center gap-3 rounded-lg px-3 py-2.5
                  text-[14px] font-medium select-none cursor-pointer
                  transition-[background-color,color,border-color] duration-[120ms]
                  ${
                    isActive
                      ? "border-l-[3px] border-accent bg-accent-subtle pl-[9px] text-accent-text"
                      : "border-l-[3px] border-transparent text-text-secondary hover:bg-accent-surface hover:text-text-primary"
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.75}
                  className={`shrink-0 transition-colors duration-[120ms] ease-out ${
                    isActive ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3">
          <Link href="/proposals" className="block">
            <button
              type="button"
              className="
                flex w-full items-center justify-center gap-2 rounded-lg
                bg-accent px-4 py-2.5
                text-[14px] font-semibold text-on-accent
                shadow-sm select-none
                transition-[background-color,transform] duration-[120ms]
                cursor-pointer
                hover:bg-accent-hover
                active:scale-[0.97]
                focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-accent)]
              "
            >
              <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
              <span>New Proposal</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}
