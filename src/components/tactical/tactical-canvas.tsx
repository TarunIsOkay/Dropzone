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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

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
        const angle = Math.atan2(
          last.y - route.points[route.points.length - 2].y,
          last.x - route.points[route.points.length - 2].x
        );
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
      setImageLoaded(true);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
    };
  }, [mapImage]);

  useEffect(() => {
    if (imageLoaded) draw();
  }, [imageLoaded, draw]);

  useEffect(() => {
    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, [draw]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const pos = toCanvasCoords(e.clientX, e.clientY);

    if (activeTool === "marker") {
      const markerType = activeRole === "enemy" ? "enemy" : activeRole === "loot" ? "loot" : "player";
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
        setOffset({ x: hit.x - pos.x, y: hit.y - pos.y });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const pos = toCanvasCoords(e.clientX, e.clientY);

    if (dragging) {
      onMarkerMove(dragging, pos.x + offset.x, pos.y + offset.y);
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
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto bg-dz-bg"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "cursor-crosshair",
          activeTool === "select" && "cursor-grab",
          dragging && "cursor-grabbing"
        )}
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />
    </div>
  );
}
