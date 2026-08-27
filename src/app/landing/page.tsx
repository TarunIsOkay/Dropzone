"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Swords,
  Users,
  Trophy,
  Map,
  BarChart3,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Zap,
  Shield,
  Target,
  Star,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Users,
    title: "Find Your Squad",
    description:
      "Advanced player discovery with role, region, and rating filters. Build the team you need.",
    color: "crimson",
  },
  {
    icon: Trophy,
    title: "Compete & Win",
    description:
      "Full tournament engine with registration, check-in, live matches, and results tracking.",
    color: "amber",
  },
  {
    icon: Map,
    title: "Master the Map",
    description:
      "Advanced tactical map editor with markers, routes, layers, and rotation planning.",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Track Performance",
    description:
      "Professional analytics with K/D, placement, win rate, and competitive ratings.",
    color: "green",
  },
  {
    icon: MessageSquare,
    title: "Stay Connected",
    description:
      "Realtime team and tournament chat with channels, mentions, and notifications.",
    color: "crimson",
  },
  {
    icon: Shield,
    title: "Compete Fair",
    description:
      "Anti-cheat, dispute resolution, evidence uploads, and professional moderation.",
    color: "amber",
  },
];

const stats = [
  { label: "Active Players", value: "12.5K+" },
  { label: "Teams Formed", value: "2,800+" },
  { label: "Tournaments Held", value: "450+" },
  { label: "Matches Played", value: "28K+" },
];

const maps = [
  { name: "Bermuda", image: "/maps/bermuda.jpg" },
  { name: "Kalahari", image: "/maps/kalahari.jpg" },
  { name: "Purgatory", image: "/maps/purgatory.jpg" },
  { name: "Alpine", image: "/maps/alpine.jpg" },
  { name: "Nextera", image: "/maps/nextera.jpg" },
  { name: "Solara", image: "/maps/solara.jpg" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dz-bg">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-dz-bg/80 backdrop-blur-xl border-b border-dz-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-dz-crimson flex items-center justify-center">
                <span className="text-white font-bold text-sm">DZ</span>
              </div>
              <span className="font-bold text-lg tracking-tight">
                DROPZONE
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-dz-text-muted hover:text-dz-text transition-colors"
              >
                Features
              </a>
              <a
                href="#maps"
                className="text-sm text-dz-text-muted hover:text-dz-text transition-colors"
              >
                Maps
              </a>
              <a
                href="#stats"
                className="text-sm text-dz-text-muted hover:text-dz-text transition-colors"
              >
                Community
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm">
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-dz-text-muted hover:text-dz-text"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dz-border bg-dz-surface">
            <div className="px-4 py-3 space-y-2">
              <a
                href="#features"
                className="block px-3 py-2 text-sm text-dz-text-muted hover:text-dz-text"
              >
                Features
              </a>
              <a
                href="#maps"
                className="block px-3 py-2 text-sm text-dz-text-muted hover:text-dz-text"
              >
                Maps
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/auth/login">
                  <Button variant="secondary" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="crimson" className="mb-6 inline-flex">
            <Zap className="w-3 h-3" />
            Competitive Esports Platform
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="text-dz-text">BUILD YOUR</span>
            <br />
            <span className="text-gradient">SQUAD.</span>
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="text-dz-text">MASTER THE</span>
            <br />
            <span className="text-gradient-cyan">MAP.</span>
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none mb-8">
            <span className="text-dz-text">DOMINATE THE</span>
            <br />
            <span className="text-dz-text">COMPETITION.</span>
          </h1>

          <p className="text-lg text-dz-text-muted max-w-2xl mx-auto mb-10 text-balance">
            The premier competitive platform for Free Fire esports. Form teams,
            compete in tournaments, master tactical strategies, and climb the
            rankings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                Start Competing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/landing#features">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 border-y border-dz-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-black text-dz-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-dz-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="cyan" className="mb-4 inline-flex">
              Platform Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Compete
            </h2>
            <p className="text-dz-text-muted max-w-2xl mx-auto">
              From finding teammates to winning championships — DropZone is your
              complete competitive toolkit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-dz-surface border border-dz-border rounded-xl p-6 hover:border-dz-border-light transition-all duration-300"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
                    feature.color === "crimson" && "bg-dz-crimson/10",
                    feature.color === "cyan" && "bg-dz-cyan/10",
                    feature.color === "green" && "bg-dz-green/10",
                    feature.color === "amber" && "bg-dz-amber/10"
                  )}
                >
                  <feature.icon
                    className={cn(
                      "w-5 h-5",
                      feature.color === "crimson" && "text-dz-crimson-400",
                      feature.color === "cyan" && "text-dz-cyan-400",
                      feature.color === "green" && "text-dz-green-400",
                      feature.color === "amber" && "text-dz-amber-400"
                    )}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-dz-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maps */}
      <section id="maps" className="py-20 lg:py-28 border-t border-dz-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="amber" className="mb-4 inline-flex">
              Supported Maps
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Master Every Battlefield
            </h2>
            <p className="text-dz-text-muted max-w-2xl mx-auto">
              Create tactical strategies for every Free Fire map with our
              advanced map editor.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {maps.map((map) => (
              <div
                key={map.name}
                className="group relative aspect-[16/10] rounded-xl overflow-hidden border border-dz-border cursor-pointer"
              >
                <img
                  src={map.image}
                  alt={map.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-lg">{map.name}</h3>
                  <p className="text-xs text-dz-text-muted mt-0.5">
                    Free Fire
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-dz-surface border border-dz-border rounded-2xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient opacity-50" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Dominate?
              </h2>
              <p className="text-dz-text-muted mb-8 max-w-xl mx-auto">
                Join thousands of competitive players already on DropZone. Build
                your squad and start winning today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup">
                  <Button
                    variant="primary"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dz-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-dz-crimson flex items-center justify-center">
                <span className="text-white font-bold text-xs">DZ</span>
              </div>
              <span className="font-bold text-sm">DROPZONE</span>
            </div>
            <p className="text-xs text-dz-text-dim">
              Not affiliated with Garena. Free Fire is a trademark of Garena
              International.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-xs text-dz-text-muted hover:text-dz-text transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-xs text-dz-text-muted hover:text-dz-text transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-xs text-dz-text-muted hover:text-dz-text transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
