"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Trophy,
  MessageSquare,
  Map,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/tournaments", label: "Events", icon: Trophy },
  { href: "/strategies", label: "Maps", icon: Map },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 w-72 bg-dz-surface border-r border-dz-border z-50 lg:hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-14 border-b border-dz-border">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-dz-crimson flex items-center justify-center">
              <span className="text-white font-bold text-sm">DZ</span>
            </div>
            <span className="font-bold text-sm tracking-tight">DROPZONE</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {mobileNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-dz-crimson/10 text-dz-crimson-400"
                    : "text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
