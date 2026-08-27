"use client";

import { useState } from "react";
import {
  Shield,
  Users,
  Trophy,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Settings,
  FileText,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const stats = [
  { label: "Total Users", value: "12,847", change: "+234 this week", icon: Users, color: "crimson" },
  { label: "Active Tournaments", value: "18", change: "5 live now", icon: Trophy, color: "amber" },
  { label: "Open Reports", value: "7", change: "3 urgent", icon: AlertTriangle, color: "amber" },
  { label: "Messages Today", value: "45.2K", change: "+12%", icon: MessageSquare, color: "cyan" },
];

const reports = [
  { id: "1", reporter: "GhostReaper", target: "ToxicPlayer42", reason: "Toxicity", status: "pending", time: "1h ago" },
  { id: "2", reporter: "BlazeFury", target: "CheaterBot", reason: "Cheating", status: "pending", time: "3h ago" },
  { id: "3", reporter: "ShadowStrike", target: "SpamAccount", reason: "Impersonation", status: "reviewed", time: "5h ago" },
  { id: "4", reporter: "PhantomAce", target: "GriefMaster", reason: "Griefing", status: "resolved", time: "1d ago" },
];

const recentUsers = [
  { name: "NewPlayer01", joined: "2h ago", status: "active" },
  { name: "ProGamer99", joined: "4h ago", status: "active" },
  { name: "TestAccount", joined: "6h ago", status: "suspended" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-dz-crimson/10 border border-dz-crimson/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-dz-crimson-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-dz-text-muted mt-0.5">
            Platform management and moderation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-dz-text-muted uppercase tracking-wider font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-dz-green-400 mt-0.5">
                  {stat.change}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === "crimson"
                    ? "bg-dz-crimson/10"
                    : stat.color === "amber"
                    ? "bg-dz-amber/10"
                    : "bg-dz-cyan/10"
                }`}
              >
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.color === "crimson"
                      ? "text-dz-crimson-400"
                      : stat.color === "amber"
                      ? "text-dz-amber-400"
                      : "text-dz-cyan-400"
                  }`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-dz-border pb-px">
        {[
          { id: "reports", label: "Reports", icon: AlertTriangle },
          { id: "users", label: "Users", icon: Users },
          { id: "tournaments", label: "Tournaments", icon: Trophy },
          { id: "audit", label: "Audit Log", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-dz-crimson-400 border-dz-crimson"
                : "text-dz-text-muted border-transparent hover:text-dz-text"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "reports" && (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id} className="flex items-center gap-4">
              <AlertTriangle
                className={`w-5 h-5 shrink-0 ${
                  report.reason === "Cheating"
                    ? "text-red-400"
                    : report.reason === "Toxicity"
                    ? "text-dz-amber-400"
                    : "text-dz-text-dim"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{report.target}</span>
                  <Badge
                    variant={
                      report.status === "pending"
                        ? "amber"
                        : report.status === "resolved"
                        ? "green"
                        : "default"
                    }
                    size="sm"
                  >
                    {report.status}
                  </Badge>
                </div>
                <p className="text-xs text-dz-text-dim mt-0.5">
                  Reported by {report.reporter} for {report.reason} • {report.time}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <CheckCircle className="w-4 h-4 text-dz-green-400" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Ban className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-2">
          {recentUsers.map((user) => (
            <Card key={user.name} className="flex items-center gap-4">
              <Avatar name={user.name} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge
                    variant={user.status === "active" ? "green" : "crimson"}
                    size="sm"
                  >
                    {user.status}
                  </Badge>
                </div>
                <p className="text-xs text-dz-text-dim">Joined {user.joined}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Ban className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "audit" && (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-dz-text-dim mx-auto mb-3" />
            <p className="text-sm text-dz-text-muted">Audit logs will appear here</p>
          </div>
        </Card>
      )}
    </div>
  );
}
