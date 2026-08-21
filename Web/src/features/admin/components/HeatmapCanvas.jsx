import React, { useRef, useEffect, useState, useCallback } from "react";
import { ZONES, GATES } from "../../../Map/data/venueConfig";
import { ZoomIn, ZoomOut, RotateCcw, Eye, Sparkles } from "lucide-react";

/**
 * Maps 3D venue coordinates (x, z) to 2D canvas coordinates (px, py)
 * Venue X range: approx -35 to +35 (width 70)
 * Venue Z range: approx -25 to +35 (depth 60)
 */
function worldToCanvas(x, z, canvasWidth, canvasHeight, pan, zoom) {
  const margin = 60;
  const usableWidth = canvasWidth - margin * 2;
  const usableHeight = canvasHeight - margin * 2;

  // Normalized coords in [0, 1]
  const normX = (x + 35) / 70;
  const normZ = (z + 25) / 60;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const basePx = margin + normX * usableWidth;
  const basePy = margin + normZ * usableHeight;

  // Apply zoom and pan relative to canvas center
  const px = centerX + (basePx - centerX) * zoom + pan.x;
  const py = centerY + (basePy - centerY) * zoom + pan.y;

  return { px, py };
}

// Convert canvas coords back to 3D world (approx for hover hit test)
function canvasToWorld(px, py, canvasWidth, canvasHeight, pan, zoom) {
  const margin = 60;
  const usableWidth = canvasWidth - margin * 2;
  const usableHeight = canvasHeight - margin * 2;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const basePx = (px - pan.x - centerX) / zoom + centerX;
  const basePy = (py - pan.y - centerY) / zoom + centerY;

  const normX = (basePx - margin) / usableWidth;
  const normZ = (basePy - margin) / usableHeight;

  const x = normX * 70 - 35;
  const z = normZ * 60 - 25;

  return { x, z };
}

export default function HeatmapCanvas({
  zoneMetricsMap = {},
  activeZoneId,
  onSelectZone,
  showParticles = true,
  heatIntensity = 1.0,
  heatRadius = 1.0,
  minDensityThreshold = 0,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredZone, setHoveredZone] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Animated particles simulation
  const particlesRef = useRef([]);

  // Initialize background particles inside zones
  useEffect(() => {
    const particles = [];
    const zoneList = Object.values(ZONES);

    zoneList.forEach((zone) => {
      const numParticles = 25;
      const [cx, , cz] = zone.center;
      const [w, d] = zone.size;

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          zoneId: zone.id,
          relX: (Math.random() - 0.5) * w * 0.8,
          relZ: (Math.random() - 0.5) * d * 0.8,
          vx: (Math.random() - 0.5) * 0.08,
          vz: (Math.random() - 0.5) * 0.08,
          size: 1.5 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.5,
        });
      }
    });
    particlesRef.current = particles;
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.min(Math.max(z * factor, 0.6), 3));
  };

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Hover hit testing for zones
    if (rect) {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { x: wx, z: wz } = canvasToWorld(mx, my, rect.width, rect.height, pan, zoom);

      let foundZone = null;
      for (const zone of Object.values(ZONES)) {
        const [cx, , cz] = zone.center;
        const [w, d] = zone.size;
        if (
          wx >= cx - w / 2 &&
          wx <= cx + w / 2 &&
          wz >= cz - d / 2 &&
          wz <= cz + d / 2
        ) {
          foundZone = zone.id;
          break;
        }
      }
      setHoveredZone(foundZone);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = (e) => {
    if (hoveredZone && onSelectZone) {
      onSelectZone(hoveredZone);
    }
  };

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#0B1220";
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Architectural Grid Lines
    ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40 * zoom;
    const offsetX = (pan.x % gridSize + gridSize) % gridSize;
    const offsetY = (pan.y % gridSize + gridSize) % gridSize;

    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Gates & Entry Pathways
    Object.values(GATES).forEach((gate) => {
      const { px, py } = worldToCanvas(gate.location[0], gate.location[2], width, height, pan, zoom);
      ctx.save();

      // Pulsing indicator for gates
      ctx.fillStyle = gate.color || "#06b6d4";
      ctx.shadowColor = gate.color || "#06b6d4";
      ctx.shadowBlur = 12 * zoom;

      ctx.beginPath();
      ctx.arc(px, py, 7 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Gate text label
      ctx.shadowBlur = 0;
      ctx.font = `600 ${Math.max(10, 11 * zoom)}px sans-serif`;
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(gate.shortName || gate.name, px, py + 18 * zoom);

      ctx.restore();
    });

    // 3. Render Zone Radial Heatmap Overlay
    Object.values(ZONES).forEach((zone) => {
      const metric = zoneMetricsMap[zone.id] || {};
      const people = metric.people_count ?? 0;
      const density = metric.density ?? (people / (zone.size[0] * zone.size[1]));
      const capacityRatio = zone.capacity ? people / zone.capacity : 0;

      // Filter out zones with 0 people/density or below min density threshold
      if (people <= 0 || density <= 0 || density < minDensityThreshold) return;

      const [cx, , cz] = zone.center;
      const { px, py } = worldToCanvas(cx, cz, width, height, pan, zoom);

      const [w, d] = zone.size;
      const baseRadius = Math.max(w, d) * 1.5 * zoom * heatRadius;

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Radial Heat Gradient based on density/capacity
      const grad = ctx.createRadialGradient(px, py, 0, px, py, baseRadius);

      // Dynamic color interpolation
      let coreColor, midColor, outerColor;

      if (capacityRatio > 0.85 || metric.surge_detected || metric.risk_level === "CRITICAL") {
        // Severe Heat: Crimson / Deep Red / Orange
        coreColor = `rgba(239, 68, 68, ${0.75 * heatIntensity})`;
        midColor = `rgba(249, 115, 22, ${0.45 * heatIntensity})`;
        outerColor = "rgba(239, 68, 68, 0)";
      } else if (capacityRatio > 0.6 || metric.risk_level === "HIGH") {
        // High Heat: Warm Amber / Orange / Yellow
        coreColor = `rgba(245, 158, 11, ${0.7 * heatIntensity})`;
        midColor = `rgba(234, 179, 8, ${0.4 * heatIntensity})`;
        outerColor = "rgba(245, 158, 11, 0)";
      } else if (capacityRatio > 0.35 || metric.risk_level === "WARNING") {
        // Moderate Heat: Yellow / Soft Green
        coreColor = `rgba(234, 179, 8, ${0.6 * heatIntensity})`;
        midColor = `rgba(34, 197, 94, ${0.35 * heatIntensity})`;
        outerColor = "rgba(234, 179, 8, 0)";
      } else {
        // Normal / Safe Heat: Cyan / Emerald
        coreColor = `rgba(6, 182, 212, ${0.5 * heatIntensity})`;
        midColor = `rgba(59, 130, 246, ${0.25 * heatIntensity})`;
        outerColor = "rgba(6, 182, 212, 0)";
      }

      grad.addColorStop(0, coreColor);
      grad.addColorStop(0.4, midColor);
      grad.addColorStop(1, outerColor);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 4. Render Zone Boundaries & Architectural Layout
    Object.values(ZONES).forEach((zone) => {
      const [cx, , cz] = zone.center;
      const [w, d] = zone.size;

      const topLeftWorld = { x: cx - w / 2, z: cz - d / 2 };
      const bottomRightWorld = { x: cx + w / 2, z: cz + d / 2 };

      const p1 = worldToCanvas(topLeftWorld.x, topLeftWorld.z, width, height, pan, zoom);
      const p2 = worldToCanvas(bottomRightWorld.x, bottomRightWorld.z, width, height, pan, zoom);

      const zoneWidth = p2.px - p1.px;
      const zoneHeight = p2.py - p1.py;

      const isSelected = activeZoneId === zone.id;
      const isHovered = hoveredZone === zone.id;
      const metric = zoneMetricsMap[zone.id] || {};
      const people = metric.people_count ?? 0;
      const capacityRatio = people / zone.capacity;

      ctx.save();

      // Zone Floor fill
      let fillColor = "rgba(15, 23, 42, 0.4)";
      if (isSelected) fillColor = "rgba(6, 182, 212, 0.18)";
      else if (isHovered) fillColor = "rgba(255, 255, 255, 0.06)";

      ctx.fillStyle = fillColor;
      ctx.fillRect(p1.px, p1.py, zoneWidth, zoneHeight);

      // Zone Border stroke
      let strokeColor = zone.color || "#3b82f6";
      let lineWidth = 1.5;

      if (isSelected) {
        strokeColor = "#22d3ee";
        lineWidth = 3;
      } else if (isHovered) {
        strokeColor = "#ffffff";
        lineWidth = 2;
      } else if (capacityRatio > 0.85) {
        strokeColor = "#ef4444";
        lineWidth = 2.5;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(p1.px, p1.py, zoneWidth, zoneHeight);

      // Corner accent markers
      const cornerLen = Math.min(12 * zoom, 16);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      // Top-Left corner
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py + cornerLen);
      ctx.lineTo(p1.px, p1.py);
      ctx.lineTo(p1.px + cornerLen, p1.py);
      ctx.stroke();

      // Bottom-Right corner
      ctx.beginPath();
      ctx.moveTo(p2.px - cornerLen, p2.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.lineTo(p2.px, p2.py - cornerLen);
      ctx.stroke();

      // Zone Title Header
      ctx.font = `700 ${Math.max(11, 13 * zoom)}px sans-serif`;
      ctx.fillStyle = isSelected || isHovered ? "#ffffff" : "#cbd5e1";
      ctx.textAlign = "center";
      ctx.fillText(zone.name, p1.px + zoneWidth / 2, p1.py + 18 * zoom);

      // Zone Role Subtitle
      ctx.font = `400 ${Math.max(9, 10 * zoom)}px sans-serif`;
      ctx.fillStyle = "#64748b";
      ctx.fillText(zone.role, p1.px + zoneWidth / 2, p1.py + 32 * zoom);

      // Capacity & Count Tag
      const occupancyPct = Math.round(capacityRatio * 100);
      let tagBg = "rgba(15, 23, 42, 0.8)";
      let tagText = "#38bdf8";

      if (occupancyPct >= 85) {
        tagBg = "rgba(239, 68, 68, 0.9)";
        tagText = "#ffffff";
      } else if (occupancyPct >= 65) {
        tagBg = "rgba(245, 158, 11, 0.9)";
        tagText = "#ffffff";
      }

      const tagY = p2.py - 16 * zoom;
      ctx.fillStyle = tagBg;
      ctx.beginPath();
      ctx.roundRect(p1.px + zoneWidth / 2 - 45 * zoom, tagY - 10 * zoom, 90 * zoom, 18 * zoom, 4);
      ctx.fill();

      ctx.font = `600 ${Math.max(9, 10 * zoom)}px sans-serif`;
      ctx.fillStyle = tagText;
      ctx.fillText(`${people} / ${zone.capacity} (${occupancyPct}%)`, p1.px + zoneWidth / 2, tagY + 2 * zoom);

      ctx.restore();
    });

    // 5. Render Dynamic Particle Crowd (if enabled)
    if (showParticles) {
      const particles = particlesRef.current;
      ctx.save();

      particles.forEach((p) => {
        const zone = ZONES[p.zoneId];
        if (!zone) return;

        const metric = zoneMetricsMap[p.zoneId] || {};
        const people = metric.people_count ?? 0;
        if (people <= 0) return;
        const capacityRatio = zone.capacity ? people / zone.capacity : 0;

        // Speed up particles in dense / surge zones
        const speedMult = capacityRatio > 0.8 ? 2.2 : 1.0;
        p.relX += p.vx * speedMult;
        p.relZ += p.vz * speedMult;

        // Keep inside zone boundary
        const [w, d] = zone.size;
        if (Math.abs(p.relX) > w * 0.45) p.vx *= -1;
        if (Math.abs(p.relZ) > d * 0.45) p.vz *= -1;

        const [cx, , cz] = zone.center;
        const { px, py } = worldToCanvas(cx + p.relX, cz + p.relZ, width, height, pan, zoom);

        // Particle color based on zone density
        let pColor = "rgba(56, 189, 248, ";
        if (capacityRatio > 0.8) pColor = "rgba(239, 68, 68, ";
        else if (capacityRatio > 0.5) pColor = "rgba(245, 158, 11, ";

        ctx.fillStyle = pColor + `${p.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * zoom * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // Request next animation frame for continuous smooth particle motion
    animFrameRef.current = requestAnimationFrame(renderCanvas);
  }, [
    zoneMetricsMap,
    activeZoneId,
    hoveredZone,
    zoom,
    pan,
    showParticles,
    heatIntensity,
    heatRadius,
    minDensityThreshold,
  ]);

  // Handle Resize and Canvas Loop setup
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    animFrameRef.current = requestAnimationFrame(renderCanvas);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderCanvas]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[450px] bg-[#0B1220] overflow-hidden rounded-2xl border border-white/10 select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      {/* HTML5 CANVAS RENDERER */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* FLOATING CONTROLS TOOLBAR */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#111827]/90 border border-white/10 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Reset View"
        >
          <RotateCcw size={17} />
        </button>
      </div>

      {/* FLOATING HOVER TOOLTIP */}
      {hoveredZone && ZONES[hoveredZone] && (
        <div
          className="pointer-events-none fixed z-50 p-3 rounded-xl bg-[#0f172a]/95 border border-cyan-500/30 text-white shadow-2xl backdrop-blur-lg w-56 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${mousePos.x + (containerRef.current?.getBoundingClientRect().left || 0)}px`,
            top: `${mousePos.y + (containerRef.current?.getBoundingClientRect().top || 0)}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-sm text-cyan-300">
              {ZONES[hoveredZone].name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              {hoveredZone}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">People Count:</span>
              <span className="font-semibold text-white">
                {zoneMetricsMap[hoveredZone]?.people_count ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Occupancy:</span>
              <span className="font-semibold text-amber-400">
                {Math.round(
                  ((zoneMetricsMap[hoveredZone]?.people_count || 0) /
                    ZONES[hoveredZone].capacity) *
                  100
                )}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Density:</span>
              <span className="font-semibold text-cyan-400">
                {(zoneMetricsMap[hoveredZone]?.density || 0).toFixed(2)} p/m²
              </span>
            </div>
            {zoneMetricsMap[hoveredZone]?.surge_detected && (
              <div className="mt-1.5 text-[11px] font-bold text-red-400 flex items-center gap-1">
                <span>🚨 CROWD SURGE DETECTED</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER SCALE & CONTEXT HINT */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0f172a]/80 border border-white/5 text-xs text-slate-400 backdrop-blur-md">
        <span className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-cyan-400" />
          Click zone to inspect
        </span>
        <span className="text-slate-600">|</span>
        <span>Drag to pan & Scroll to zoom</span>
      </div>
    </div>
  );
}
