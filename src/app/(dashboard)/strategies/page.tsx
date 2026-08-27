"use client";

import { useState, useCallback } from "react";
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
  RotateCcw,
  ChevronUp,
  ChevronDown,
  X,
  MapPin,
  Palette,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TacticalCanvas,
  type Marker,
  type Route as RouteType,
  type Layer,
} from "@/components/tactical/tactical-canvas";
import { RotationPlanner, type TimelineEvent } from "@/components/tactical/rotation-planner";
import { cn } from "@/lib/utils";
import {
  saveMarkers,
  saveRoutes,
  createStrategy,
  updateStrategy,
} from "@/app/actions/strategies";

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
  { id: "rusher", label: "Rush", color: "#f59e0b" },
  { id: "support", label: "Supp", color: "#06b6d4" },
  { id: "sniper", label: "Snp", color: "#22c55e" },
  { id: "enemy", label: "Enemy", color: "#ff4444" },
  { id: "loot", label: "Loot", color: "#a855f7" },
];

type MobileSheet = "layers" | "colors" | "roles" | "maps" | "markers" | null;

export default function TacticalEditorPage() {
  const [selectedMap, setSelectedMap] = useState(maps[0]);
  const [activeTool, setActiveTool] = useState("select");
  const [activeColor, setActiveColor] = useState(colors[0]);
  const [activeRole, setActiveRole] = useState("igl");
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "players", name: "Players", visible: true, locked: false },
    { id: "enemies", name: "Enemies", visible: true, locked: false },
    { id: "routes", name: "Routes", visible: true, locked: false },
    { id: "zones", name: "Zones", visible: true, locked: false },
  ]);
  const [activeLayer, setActiveLayer] = useState("players");
  const [showDesktopLayers, setShowDesktopLayers] = useState(true);
  const [showRotation, setShowRotation] = useState(false);
  const [strategyName, setStrategyName] = useState("Untitled Strategy");
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [strategyId, setStrategyId] = useState<string | null>(null);

  // Mobile state
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleMarkerAdd = useCallback((marker: Omit<Marker, "id">) => {
    setMarkers((prev) => [...prev, { ...marker, id: `m-${Date.now()}-${Math.random()}` }]);
  }, []);

  const handleMarkerMove = useCallback((id: string, x: number, y: number) => {
    setMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, x, y } : m)));
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
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let id = strategyId;
      if (!id) {
        const result = await createStrategy({ name: strategyName, map: selectedMap.id, visibility: "private" });
        id = result.id;
        setStrategyId(id);
      } else {
        await updateStrategy(id, { name: strategyName });
      }
      if (id) {
        await Promise.all([
          saveMarkers(id, markers.map(({ id: _id, ...rest }) => ({ ...rest, layer_id: activeLayer }))),
          saveRoutes(id, routes.map(({ id: _id, ...rest }) => ({ ...rest, layer_id: activeLayer, type: "route" }))),
        ]);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleTimelinePlay = (time: number) => {};
  const handleTimelinePause = () => {};
  const handleTimelineReset = () => {};

  const activeToolObj = tools.find((t) => t.id === activeTool);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>
      {/* ============ DESKTOP LAYOUT (lg+) ============ */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-12 bg-dz-surface border-r border-dz-border flex flex-col items-center gap-1 p-1.5 shrink-0">
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

          <div className="w-full h-px bg-dz-border my-1" />

          <div className="flex flex-col items-center gap-1">
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

          <div className="w-full h-px bg-dz-border my-1" />

          <div className="flex flex-col items-center gap-1">
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
              <Button variant="ghost" size="sm" onClick={() => setShowDesktopLayers(!showDesktopLayers)}>
                <Layers className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowRotation(!showRotation)}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-dz-border" />
              <Button variant="ghost" size="sm" onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
          </div>

          {/* Canvas */}
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
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Badge variant="default" size="sm">{markers.length} markers</Badge>
              <Badge variant="default" size="sm">{routes.length} routes</Badge>
            </div>
          </div>

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

        {/* Right Panel */}
        {showDesktopLayers && (
          <div className="w-56 bg-dz-surface border-l border-dz-border shrink-0 overflow-y-auto">
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
                    activeLayer === layer.id ? "bg-dz-elevated text-dz-text" : "text-dz-text-muted hover:bg-dz-elevated/50"
                  )}
                >
                  <button onClick={(e) => { e.stopPropagation(); toggleLayer(layer.id); }} className="shrink-0">
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-dz-text-dim" />}
                  </button>
                  <span className="text-xs flex-1 truncate">{layer.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, locked: !l.locked } : l)); }}>
                    {layer.locked ? <Lock className="w-3 h-3 text-dz-text-dim" /> : <Unlock className="w-3 h-3 text-dz-text-dim" />}
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-dz-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-dz-text-muted mb-2">Markers ({markers.length})</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {markers.map((marker) => (
                  <div key={marker.id} className="flex items-center gap-2 px-2 py-1 text-xs text-dz-text-muted hover:bg-dz-elevated rounded">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: marker.color }} />
                    <span className="flex-1 truncate">{marker.label || marker.type}</span>
                    <button onClick={() => handleMarkerDelete(marker.id)} className="text-dz-text-dim hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ MOBILE LAYOUT ============ */}
      <div className="flex lg:hidden flex-1 flex-col relative overflow-hidden">
        {/* Full-screen canvas */}
        <div className="flex-1 relative">
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

          {/* Floating top bar */}
          <div className="absolute top-0 left-0 right-0 h-11 bg-dz-surface/95 backdrop-blur-sm border-b border-dz-border flex items-center justify-between px-3 z-20">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-dz-elevated text-xs font-medium text-dz-text shrink-0"
              >
                <MapPin className="w-3 h-3" />
                {selectedMap.name}
                <ChevronDown className="w-3 h-3" />
              </button>
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                className="bg-transparent text-xs font-medium text-dz-text outline-none min-w-0 w-28 truncate"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="default" size="sm" className="text-[10px]">{markers.length}M</Badge>
              <Badge variant="default" size="sm" className="text-[10px]">{routes.length}R</Badge>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-8 h-8 rounded-lg bg-dz-crimson text-white flex items-center justify-center"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Map picker dropdown */}
          {showMapPicker && (
            <div className="absolute top-11 left-0 right-0 bg-dz-surface border-b border-dz-border p-2 z-20">
              <div className="grid grid-cols-3 gap-2">
                {maps.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMap(m); setShowMapPicker(false); }}
                    className={cn(
                      "rounded-lg overflow-hidden border-2 aspect-video relative",
                      selectedMap.id === m.id ? "border-dz-crimson" : "border-dz-border"
                    )}
                  >
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] font-medium text-white bg-black/60 text-center py-0.5">
                      {m.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active tool indicator */}
          <div className="absolute top-14 left-3 z-20">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-dz-surface/90 backdrop-blur-sm border border-dz-border text-[10px] text-dz-text-muted">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColor }} />
              {activeToolObj?.label} · {roles.find((r) => r.id === activeRole)?.label}
            </div>
          </div>
        </div>

        {/* Mobile bottom sheet */}
        {mobileSheet && (
          <div className="absolute inset-0 z-30 flex flex-col justify-end" onClick={() => setMobileSheet(null)}>
            <div className="bg-dz-surface border-t border-dz-border rounded-t-2xl max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-dz-border sticky top-0 bg-dz-surface">
                <div className="w-8 h-1 rounded-full bg-dz-border mx-auto" />
                <button onClick={() => setMobileSheet(null)} className="text-dz-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {mobileSheet === "layers" && (
                <div className="p-3 space-y-1">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                        activeLayer === layer.id ? "bg-dz-elevated text-dz-text" : "text-dz-text-muted"
                      )}
                    >
                      <button onClick={(e) => { e.stopPropagation(); toggleLayer(layer.id); }}>
                        {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-dz-text-dim" />}
                      </button>
                      <span className="text-sm flex-1">{layer.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, locked: !l.locked } : l)); }}>
                        {layer.locked ? <Lock className="w-4 h-4 text-dz-text-dim" /> : <Unlock className="w-4 h-4 text-dz-text-dim" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {mobileSheet === "colors" && (
                <div className="p-4">
                  <div className="grid grid-cols-6 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => { setActiveColor(color); setMobileSheet(null); }}
                        className={cn(
                          "w-10 h-10 rounded-full border-3 transition-transform mx-auto",
                          activeColor === color ? "border-white scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {mobileSheet === "roles" && (
                <div className="p-3 space-y-1">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => { setActiveRole(role.id); setMobileSheet(null); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                        activeRole === role.id ? "bg-dz-elevated text-dz-text" : "text-dz-text-muted"
                      )}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                      <span className="text-sm">{role.label}</span>
                      {activeRole === role.id && <span className="ml-auto text-[10px] text-dz-crimson">Active</span>}
                    </button>
                  ))}
                </div>
              )}

              {mobileSheet === "markers" && (
                <div className="p-3 space-y-1">
                  {markers.length === 0 ? (
                    <p className="text-xs text-dz-text-dim text-center py-6">No markers yet. Select Marker tool and tap the map.</p>
                  ) : (
                    markers.map((marker) => (
                      <div key={marker.id} className="flex items-center gap-3 px-3 py-2 rounded-xl">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: marker.color }} />
                        <span className="text-sm flex-1 text-dz-text-muted">{marker.label || marker.type}</span>
                        <button onClick={() => handleMarkerDelete(marker.id)} className="text-dz-text-dim">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom toolbar */}
        <div className="bg-dz-surface border-t border-dz-border shrink-0 safe-area-bottom">
          {/* Tool + options row */}
          <div className="flex items-center gap-1 px-2 py-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  "flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all",
                  activeTool === tool.id
                    ? "bg-dz-crimson/15 text-dz-crimson-400 border border-dz-crimson/25"
                    : "bg-dz-elevated text-dz-text-dim"
                )}
              >
                <tool.icon className="w-4 h-4" />
                {tool.label}
              </button>
            ))}
          </div>

          {/* Options row */}
          <div className="flex items-center gap-2 px-3 pb-2">
            <button
              onClick={() => setMobileSheet(mobileSheet === "colors" ? null : "colors")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dz-elevated text-xs"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColor }} />
              <Palette className="w-3 h-3 text-dz-text-dim" />
            </button>
            <button
              onClick={() => setMobileSheet(mobileSheet === "roles" ? null : "roles")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dz-elevated text-xs"
            >
              <Shield className="w-3 h-3 text-dz-text-dim" />
              {roles.find((r) => r.id === activeRole)?.label}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setMobileSheet(mobileSheet === "layers" ? null : "layers")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dz-elevated text-xs"
            >
              <Layers className="w-3 h-3 text-dz-text-dim" />
              Layers
            </button>
            <button
              onClick={() => setMobileSheet(mobileSheet === "markers" ? null : "markers")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dz-elevated text-xs"
            >
              <Circle className="w-3 h-3 text-dz-text-dim" />
              {markers.length}
            </button>
            <button
              onClick={() => setShowRotation(!showRotation)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs",
                showRotation ? "bg-dz-crimson/15 text-dz-crimson-400" : "bg-dz-elevated"
              )}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Rotation planner (slides up above bottom bar on mobile) */}
        {showRotation && (
          <div className="border-t border-dz-border bg-dz-surface shrink-0">
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
    </div>
  );
}
