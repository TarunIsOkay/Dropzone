"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MousePointer2,
  Circle,
  Route,
  Trash2,
  Save,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Share2,
  Copy,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TacticalCanvas, type Marker, type Route as RouteType, type Layer } from "@/components/tactical/tactical-canvas";
import { RotationPlanner, type TimelineEvent } from "@/components/tactical/rotation-planner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { saveMarkers, saveRoutes, getStrategyById, updateStrategy, createStrategy } from "@/app/actions/strategies";

const maps = [
  { id: "bermuda", name: "Bermuda", image: "/maps/bermuda.jpg" },
  { id: "kalahari", name: "Kalahari", image: "/maps/kalahari.jpg" },
  { id: "purgatory", name: "Purgatory", image: "/maps/purgatory.jpg" },
  { id: "alpine", name: "Alpine", image: "/maps/alpine.jpg" },
  { id: "nextera", name: "Nextera", image: "/maps/nextera.jpg" },
  { id: "solara", name: "Solara", image: "/maps/solara.jpg" },
];

const tools = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "marker", icon: Circle, label: "Marker" },
  { id: "route", icon: Route, label: "Route" },
];

const colors = ["#dc2626", "#06b6d4", "#22c55e", "#f59e0b", "#a855f7", "#ffffff"];

const roles = [
  { id: "igl", label: "IGL", color: "#dc2626" },
  { id: "rusher", label: "Rusher", color: "#f59e0b" },
  { id: "support", label: "Support", color: "#06b6d4" },
  { id: "sniper", label: "Sniper", color: "#22c55e" },
  { id: "enemy", label: "Enemy", color: "#ff4444" },
  { id: "loot", label: "Loot", color: "#a855f7" },
];

export default function TacticalEditorPage() {
  const [selectedMap, setSelectedMap] = useState(maps[0]);
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState(colors[0]);
  const [activeRole, setActiveRole] = useState("igl");
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "players", name: "Player Positions", visible: true, locked: false },
    { id: "enemies", name: "Enemy Positions", visible: true, locked: false },
    { id: "routes", name: "Routes", visible: true, locked: false },
    { id: "zones", name: "Zones", visible: true, locked: false },
  ]);
  const [activeLayer, setActiveLayer] = useState("players");
  const [showLayers, setShowLayers] = useState(true);
  const [showRotation, setShowRotation] = useState(false);
  const [strategyName, setStrategyName] = useState("Untitled Strategy");
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleMarkerAdd = useCallback((marker: Omit<Marker, "id">) => {
    setMarkers((prev) => [...prev, { ...marker, id: `m-${Date.now()}-${Math.random()}` }]);
  }, []);

  const handleMarkerMove = useCallback((id: string, x: number, y: number) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, x, y } : m))
    );
  }, []);

  const handleMarkerDelete = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleRouteAdd = useCallback((route: Omit<RouteType, "id">) => {
    setRoutes((prev) => [...prev, { ...route, id: `r-${Date.now()}-${Math.random()}` }]);
  }, []);

  const handleRouteDelete = useCallback((id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (strategyId) {
        await updateStrategy(strategyId, { name: strategyName });
      } else {
        const result = await createStrategy({
          name: strategyName,
          map: selectedMap.id,
          visibility: "private",
        });
        setStrategyId(result.id);
      }

      if (strategyId) {
        await Promise.all([
          saveMarkers(strategyId, markers.map(({ id, ...rest }) => ({ ...rest, layer_id: activeLayer }))),
          saveRoutes(strategyId, routes.map(({ id, ...rest }) => ({ ...rest, layer_id: activeLayer, type: "route" }))),
        ]);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
    setShowSaveModal(false);
  };

  const handleTimelinePlay = (time: number) => {};
  const handleTimelinePause = () => {};
  const handleTimelineReset = () => {};

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-0 -m-4 lg:-m-6 overflow-hidden">
      {/* Left Toolbar */}
      <div className="w-full lg:w-12 bg-dz-surface border-b lg:border-b-0 lg:border-r border-dz-border flex lg:flex-col items-center gap-1 p-1.5 shrink-0">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
              activeTool === tool.id
                ? "bg-dz-crimson/10 text-dz-crimson-400 border border-dz-crimson/20"
                : "text-dz-text-dim hover:text-dz-text hover:bg-dz-elevated"
            )}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-full h-px bg-dz-border my-1 hidden lg:block" />

        <div className="hidden lg:flex flex-col items-center gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-transform",
                activeColor === color ? "border-white scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="w-full h-px bg-dz-border my-1 hidden lg:block" />

        <div className="hidden lg:flex flex-col items-center gap-1">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors",
                activeRole === role.id
                  ? "bg-dz-elevated text-dz-text border border-dz-border"
                  : "text-dz-text-dim hover:text-dz-text"
              )}
              title={role.label}
            >
              {role.label.slice(0, 2)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-10 bg-dz-surface border-b border-dz-border flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-2">
            <Select
              value={selectedMap.id}
              onChange={(e) => setSelectedMap(maps.find((m) => m.id === e.target.value) || maps[0])}
              options={maps.map((m) => ({ value: m.id, label: m.name }))}
              className="w-32 h-7 text-xs"
            />
            <div className="w-px h-5 bg-dz-border" />
            <input
              type="text"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="bg-transparent text-sm font-medium text-dz-text outline-none max-w-[200px]"
            />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)}>
              <Layers className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowRotation(!showRotation)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="w-px h-5 bg-dz-border" />
            <Button variant="ghost" size="sm" onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <TacticalCanvas
            mapImage={selectedMap.image}
            markers={markers}
            routes={routes}
            layers={layers}
            activeTool={activeTool}
            activeLayer={activeLayer}
            activeColor={activeColor}
            activeRole={activeRole}
            onMarkerAdd={handleMarkerAdd}
            onMarkerMove={handleMarkerMove}
            onMarkerDelete={handleMarkerDelete}
            onRouteAdd={handleRouteAdd}
            onRouteDelete={handleRouteDelete}
          />

          {/* Map selector overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            {maps.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMap(m)}
                className={cn(
                  "w-16 h-10 rounded border-2 overflow-hidden transition-all",
                  selectedMap.id === m.id
                    ? "border-dz-crimson ring-1 ring-dz-crimson/50"
                    : "border-dz-border opacity-60 hover:opacity-100"
                )}
              >
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Marker count */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="default" size="sm">
              {markers.length} markers
            </Badge>
            <Badge variant="default" size="sm">
              {routes.length} routes
            </Badge>
          </div>
        </div>

        {/* Rotation Planner */}
        {showRotation && (
          <div className="border-t border-dz-border">
            <RotationPlanner
              events={timelineEvents}
              onEventsChange={setTimelineEvents}
              onPlay={handleTimelinePlay}
              onPause={handleTimelinePause}
              onReset={handleTimelineReset}
            />
          </div>
        )}
      </div>

      {/* Right Panel - Layers */}
      {showLayers && (
        <div className="w-full lg:w-56 bg-dz-surface border-t lg:border-t-0 lg:border-l border-dz-border shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-dz-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dz-text-muted">Layers</h3>
          </div>
          <div className="p-2 space-y-0.5">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                  activeLayer === layer.id
                    ? "bg-dz-elevated text-dz-text"
                    : "text-dz-text-muted hover:bg-dz-elevated/50"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayer(layer.id);
                  }}
                  className="shrink-0"
                >
                  {layer.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-dz-text-dim" />
                  )}
                </button>
                <span className="text-xs flex-1 truncate">{layer.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayers((prev) =>
                      prev.map((l) => (l.id === layer.id ? { ...l, locked: !l.locked } : l))
                    );
                  }}
                >
                  {layer.locked ? (
                    <Lock className="w-3 h-3 text-dz-text-dim" />
                  ) : (
                    <Unlock className="w-3 h-3 text-dz-text-dim" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-dz-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-dz-text-muted mb-2">
              Markers ({markers.length})
            </h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-center gap-2 px-2 py-1 text-xs text-dz-text-muted hover:bg-dz-elevated rounded"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: marker.color }}
                  />
                  <span className="flex-1 truncate">{marker.label || marker.type}</span>
                  <button
                    onClick={() => handleMarkerDelete(marker.id)}
                    className="text-dz-text-dim hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
