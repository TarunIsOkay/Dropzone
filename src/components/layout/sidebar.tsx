"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Swords,
  MessageSquare,
  Map,
  Search,
  Trophy,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: Users },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/strategies", label: "Strategies", icon: Map },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
];

const bottomItems = [
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen bg-dz-surface border-r border-dz-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-dz-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-dz-crimson flex items-center justify-center">
              <span className="text-white font-bold text-sm">DZ</span>
            </div>
            <span className="font-bold text-sm tracking-tight">DROPZONE</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-dz-crimson flex items-center justify-center">
              <span className="text-white font-bold text-sm">DZ</span>
            </div>
          </Link>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-dz-crimson/10 text-dz-crimson-400"
                  : "text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-dz-border py-3 px-2 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-dz-crimson/10 text-dz-crimson-400"
                  : "text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-dz-text-dim hover:text-dz-text-muted hover:bg-dz-elevated w-full",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
