"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  phase: string;
  label: string;
  time_seconds: number;
  duration_seconds: number;
  order: number;
}

interface RotationPlannerProps {
  events: TimelineEvent[];
  onEventsChange: (events: TimelineEvent[]) => void;
  onPlay: (time: number) => void;
  onPause: () => void;
  onReset: () => void;
}

const phases = [
  { value: "drop", label: "Drop", color: "bg-dz-crimson" },
  { value: "loot", label: "Loot", color: "bg-dz-amber" },
  { value: "scout", label: "Scout", color: "bg-dz-cyan" },
  { value: "rotate", label: "Rotate", color: "bg-dz-green" },
  { value: "hold", label: "Hold", color: "bg-purple-500" },
  { value: "final", label: "Final Zone", color: "bg-dz-crimson-400" },
];

const phaseColors: Record<string, string> = {
  drop: "#dc2626",
  loot: "#f59e0b",
  scout: "#06b6d4",
  rotate: "#22c55e",
  hold: "#a855f7",
  final: "#ff6b6b",
};

export function RotationPlanner({
  events,
  onEventsChange,
  onPlay,
  onPause,
  onReset,
}: RotationPlannerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = events.length > 0
    ? Math.max(...events.map((e) => e.time_seconds + e.duration_seconds))
    : 60;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalTime) {
            setPlaying(false);
            return totalTime;
          }
          return prev + speed;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed, totalTime]);

  useEffect(() => {
    if (playing) onPlay(currentTime);
  }, [currentTime, playing, onPlay]);

  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
      onPause();
    } else {
      if (currentTime >= totalTime) setCurrentTime(0);
      setPlaying(true);
    }
  };

  const handleReset = () => {
    setPlaying(false);
    setCurrentTime(0);
    onReset();
  };

  const addEvent = () => {
    const lastEvent = events[events.length - 1];
    const startTime = lastEvent ? lastEvent.time_seconds + lastEvent.duration_seconds : 0;

    onEventsChange([
      ...events,
      {
        id: `evt-${Date.now()}`,
        phase: "loot",
        label: `Phase ${events.length + 1}`,
        time_seconds: startTime,
        duration_seconds: 15,
        order: events.length,
      },
    ]);
  };

  const removeEvent = (id: string) => {
    onEventsChange(events.filter((e) => e.id !== id));
  };

  const updateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    onEventsChange(
      events.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-dz-surface border border-dz-border rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-dz-border">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handlePlayPause}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-dz-text-muted font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(totalTime)}</span>
        </div>

        <div className="flex-1" />

        <Select
          value={speed.toString()}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          options={[
            { value: "0.5", label: "0.5x" },
            { value: "1", label: "1x" },
            { value: "2", label: "2x" },
            { value: "4", label: "4x" },
          ]}
          className="w-20"
        />
      </div>

      {/* Timeline */}
      <div className="px-4 py-3">
        <div className="relative h-8 bg-dz-elevated rounded-lg overflow-hidden">
          {events.map((event) => {
            const left = (event.time_seconds / totalTime) * 100;
            const width = (event.duration_seconds / totalTime) * 100;
            return (
              <div
                key={event.id}
                className="absolute top-1 bottom-1 rounded flex items-center justify-center text-[9px] font-medium text-white/80 cursor-pointer hover:opacity-80"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: phaseColors[event.phase] || "#666",
                }}
                title={`${event.label} (${formatTime(event.time_seconds)})`}
              >
                {width > 8 && event.label}
              </div>
            );
          })}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
            style={{ left: `${(currentTime / totalTime) * 100}%` }}
          />
        </div>
      </div>

      {/* Events List */}
      <div className="px-4 pb-3 space-y-2 max-h-48 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-2 p-2 rounded-lg bg-dz-elevated border border-dz-border"
          >
            <GripVertical className="w-4 h-4 text-dz-text-dim cursor-grab shrink-0" />
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: phaseColors[event.phase] || "#666" }}
            />
            <input
              type="text"
              value={event.label}
              onChange={(e) => updateEvent(event.id, { label: e.target.value })}
              className="flex-1 bg-transparent text-xs text-dz-text outline-none min-w-0"
            />
            <select
              value={event.phase}
              onChange={(e) => updateEvent(event.id, { phase: e.target.value })}
              className="bg-dz-bg border border-dz-border rounded px-2 py-0.5 text-[10px] text-dz-text outline-none"
            >
              {phases.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className="text-[10px] text-dz-text-dim font-mono w-8">
              {event.duration_seconds}s
            </span>
            <button
              onClick={() => removeEvent(event.id)}
              className="p-0.5 text-dz-text-dim hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addEvent} className="w-full">
          <Plus className="w-3.5 h-3.5" />
          Add Phase
        </Button>
      </div>
    </div>
  );
}
