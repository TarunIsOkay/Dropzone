"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Search, Menu, X, LogOut, User, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMobileMenuToggle?: () => void;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

export function Topbar({ onMobileMenuToggle, user }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-14 bg-dz-surface/80 backdrop-blur-xl border-b border-dz-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-dz-elevated border border-dz-border rounded-lg px-3 py-1.5 w-64">
            <Search className="w-4 h-4 text-dz-text-dim" />
            <input
              type="text"
              placeholder="Search players, teams, tournaments..."
              className="bg-transparent text-sm text-dz-text placeholder:text-dz-text-dim outline-none w-full"
            />
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-dz-text-dim bg-dz-bg border border-dz-border rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-dz-crimson rounded-full" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-dz-surface border border-dz-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-dz-border">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <Badge variant="crimson" size="sm">3 new</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-dz-elevated transition-colors border-b border-dz-border/50">
                      <p className="text-sm font-medium">Tournament Registration Open</p>
                      <p className="text-xs text-dz-text-muted mt-0.5">Free Fire Friday Cup registration is now open</p>
                      <p className="text-[10px] text-dz-text-dim mt-1">2 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-dz-elevated transition-colors border-b border-dz-border/50">
                      <p className="text-sm font-medium">Team Invitation</p>
                      <p className="text-xs text-dz-text-muted mt-0.5">Phantom squad invited you to join</p>
                      <p className="text-[10px] text-dz-text-dim mt-1">5 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-dz-elevated transition-colors">
                      <p className="text-sm font-medium">Match Starting Soon</p>
                      <p className="text-xs text-dz-text-muted mt-0.5">Your match starts in 15 minutes</p>
                      <p className="text-[10px] text-dz-text-dim mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-dz-border">
                    <button className="text-xs text-dz-crimson-400 hover:text-dz-crimson-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dz-elevated transition-colors"
            >
              <Avatar name={user?.name || "User"} src={user?.avatar} size="sm" />
              <span className="hidden md:block text-sm font-medium text-dz-text-muted">
                {user?.name || "User"}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-dz-surface border border-dz-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-dz-border p-2">
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
