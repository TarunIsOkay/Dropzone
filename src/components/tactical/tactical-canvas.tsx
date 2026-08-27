"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface Marker {
  id: string;
  type: "player" | "enemy" | "loot" | "objective" | "danger" | "custom";
  x: number;
  y: number;
  label?: string;
  color: string;
  role?: string;
}

export interface Route {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  label?: string;
  animated: boolean;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

interface TacticalCanvasProps {
  mapImage: string;
  markers: Marker[];
  routes: Route[];
  layers: Layer[];
  activeTool: string;
  activeLayer: string;
  activeColor: string;
  activeRole: string;
  onMarkerAdd: (marker: Omit<Marker, "id">) => void;
  onMarkerMove: (id: string, x: number, y: number) => void;
  onMarkerDelete: (id: string) => void;
  onRouteAdd: (route: Omit<Route, "id">) => void;
  onRouteDelete: (id: string) => void;
}

export function TacticalCanvas({
  mapImage,
  markers,
  routes,
  layers,
  activeTool,
  activeLayer,
  activeColor,
  activeRole,
  onMarkerAdd,
  onMarkerMove,
  onMarkerDelete,
  onRouteAdd,
  onRouteDelete,
}: TacticalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawingRoute, setDrawingRoute] = useState<Array<{ x: number; y: number }>>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.5);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
      };
    },
    [scale]
  );

  const fitToContainer = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const s = Math.min(cw / iw, ch / ih, 1);
    setScale(s);
    setOffset({ x: 0, y: 0 });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    const visibleLayers = layers.filter((l) => l.visible).map((l) => l.id);

    routes.forEach((route) => {
      if (route.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = route.color;
      ctx.lineWidth = 3;
      ctx.setLineDash(route.animated ? [10, 5] : []);
      ctx.moveTo(route.points[0].x, route.points[0].y);
      for (let i = 1; i < route.points.length; i++) {
        ctx.lineTo(route.points[i].x, route.points[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (route.points.length > 0) {
        const last = route.points[route.points.length - 1];
        const prev = route.points[route.points.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        ctx.beginPath();
        ctx.fillStyle = route.color;
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(
          last.x - 12 * Math.cos(angle - Math.PI / 6),
          last.y - 12 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          last.x - 12 * Math.cos(angle + Math.PI / 6),
          last.y - 12 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    });

    markers.forEach((marker) => {
      const size = marker.type === "player" || marker.type === "enemy" ? 16 : 12;
      ctx.beginPath();
      ctx.fillStyle = marker.color;
      ctx.globalAlpha = 0.3;
      ctx.arc(marker.x, marker.y, size + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (marker.label) {
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(marker.label, marker.x, marker.y + size + 14);
      }
    });

    if (drawingRoute.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(drawingRoute[0].x, drawingRoute[0].y);
      for (let i = 1; i < drawingRoute.length; i++) {
        ctx.lineTo(drawingRoute[i].x, drawingRoute[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [markers, routes, layers, drawingRoute, activeColor, activeRole]);

  useEffect(() => {
    const img = new Image();
    img.src = mapImage;
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImageLoaded(true);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      setTimeout(fitToContainer, 50);
    };
  }, [mapImage, fitToContainer]);

  useEffect(() => {
    if (imageLoaded) draw();
  }, [imageLoaded, draw]);

  useEffect(() => {
    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [draw]);

  useEffect(() => {
    const handleResize = () => fitToContainer();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitToContainer]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }

    const pos = toCanvasCoords(e.clientX, e.clientY);

    if (activeTool === "marker") {
      const markerType =
        activeRole === "enemy"
          ? "enemy"
          : activeRole === "loot"
          ? "loot"
          : "player";
      onMarkerAdd({
        type: markerType,
        x: pos.x,
        y: pos.y,
        color: activeColor,
        role: activeRole,
      });
    } else if (activeTool === "route") {
      setDrawingRoute([pos]);
    } else if (activeTool === "select") {
      const hit = markers.find(
        (m) => Math.hypot(m.x - pos.x, m.y - pos.y) < 20
      );
      if (hit) {
        setDragging(hit.id);
        setDragOffset({ x: hit.x - pos.x, y: hit.y - pos.y });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (panning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const pos = toCanvasCoords(e.clientX, e.clientY);

    if (dragging) {
      onMarkerMove(dragging, pos.x + dragOffset.x, pos.y + dragOffset.y);
    }

    if (activeTool === "route" && drawingRoute.length > 0) {
      setDrawingRoute((prev) => {
        const last = prev[prev.length - 1];
        if (Math.hypot(pos.x - last.x, pos.y - last.y) > 10) {
          return [...prev, pos];
        }
        return prev;
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setPanning(false);
    if (dragging) setDragging(null);

    if (activeTool === "route" && drawingRoute.length > 1) {
      onRouteAdd({
        points: drawingRoute,
        color: activeColor,
        animated: false,
      });
      setDrawingRoute([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (dragging) {
        onMarkerDelete(dragging);
        setDragging(null);
      }
    }
    if (e.key === "+" || e.key === "=") {
      setScale((prev) => Math.min(prev * 1.2, 5));
    }
    if (e.key === "-") {
      setScale((prev) => Math.max(prev * 0.8, 0.1));
    }
    if (e.key === "0") {
      fitToContainer();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-dz-bg"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "cursor-crosshair",
            activeTool === "select" && "cursor-grab",
            dragging && "cursor-grabbing",
            panning && "cursor-grabbing"
          )}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-dz-surface/90 backdrop-blur-sm border border-dz-border rounded-lg p-1">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.2, 5))}
          className="w-8 h-8 rounded flex items-center justify-center text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
          title="Zoom in (+)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="7" y1="5" x2="7" y2="9"/></svg>
        </button>
        <span className="text-[10px] text-dz-text-dim w-10 text-center font-mono">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.1))}
          className="w-8 h-8 rounded flex items-center justify-center text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
          title="Zoom out (-)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/><line x1="5" y1="7" x2="9" y2="7"/></svg>
        </button>
        <div className="w-px h-5 bg-dz-border" />
        <button
          onClick={fitToContainer}
          className="w-8 h-8 rounded flex items-center justify-center text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated transition-colors"
          title="Fit to view (0)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1"/><polyline points="5,2 2,2 2,5"/><polyline points="11,14 14,14 14,11"/><polyline points="14,5 14,2 11,2"/><polyline points="2,11 2,14 5,14"/></svg>
        </button>
      </div>

      {/* Help hint */}
      <div className="absolute top-4 left-4 text-[10px] text-dz-text-dim/50 pointer-events-none select-none">
        Scroll to zoom · Alt+drag to pan · Delete to remove marker
      </div>
    </div>
  );
}
