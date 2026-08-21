import React, { useState, useMemo, useEffect } from "react";
import {
  Flame,
  Users,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Box,
  MapPin,
  CheckCircle2,
  Info,
} from "lucide-react";
import HeatmapCanvas from "../components/HeatmapCanvas";
import useLiveData from "../../../lib/useLiveData";
import { fetchZoneMetrics, fetchCrowdMetrics, riskLevelFromScore } from "../../../lib/api";
import { ZONES } from "../../../Map/data/venueConfig";

// Default simulation zone data generator if backend endpoint is offline
function generateFallbackZoneData() {
  const mockData = {};
  const zoneList = Object.values(ZONES);
  const now = new Date().toISOString();

  zoneList.forEach((zone) => {
    // Generate realistic variation
    let capacityRatio = 0.4;
    let surge = false;
    let bottleneck = false;

    if (zone.id === "ZONE_C") {
      capacityRatio = 0.88; // Main stage high density
      surge = true;
    } else if (zone.id === "ZONE_E") {
      capacityRatio = 0.72; // Registration booth
      bottleneck = true;
    } else if (zone.id === "ZONE_A") {
      capacityRatio = 0.45;
    } else if (zone.id === "ZONE_B") {
      capacityRatio = 0.35;
    } else {
      capacityRatio = 0.55;
    }

    const people = Math.round(zone.capacity * capacityRatio);
    const area = zone.size[0] * zone.size[1];
    const density = Number((people / area).toFixed(2));
    const speed = surge ? 0.4 : 1.2;

    mockData[zone.id] = {
      zone_id: zone.id,
      people_count: people,
      density: density,
      speed: speed,
      direction: "SOUTH_EAST",
      surge_detected: surge,
      bottleneck: bottleneck,
      flow_conflict: surge,
      risk_level: capacityRatio > 0.8 ? "CRITICAL" : capacityRatio > 0.6 ? "HIGH" : "SAFE",
      timestamp: now,
    };
  });

  return mockData;
}

export default function Heatmap() {
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [showParticles, setShowParticles] = useState(true);
  const [heatIntensity, setHeatIntensity] = useState(1.0);
  const [heatRadius, setHeatRadius] = useState(1.0);
  const [minDensityThreshold, setMinDensityThreshold] = useState(0);
  const [simulatedSurge, setSimulatedSurge] = useState(false);

  // Fetch live zone data & dashboard crowd metrics (polling every 1.5 seconds)
  const { data: rawZoneData, loading, error } = useLiveData(
    fetchZoneMetrics,
    1500
  );
  const { data: crowdMetrics } = useLiveData(
    fetchCrowdMetrics,
    1500
  );

  // Fallback data generator if backend server is not running
  const fallbackData = useMemo(() => generateFallbackZoneData(), []);

  // Consolidate database & live simulation data map
  const zoneMetricsMap = useMemo(() => {
    const map = {};

    // Initialize all 5 zones from venueConfig
    Object.values(ZONES).forEach((zone) => {
      map[zone.id] = {
        zone_id: zone.id,
        people_count: 0,
        density: 0,
        speed: 0,
        surge_detected: false,
        bottleneck: false,
        flow_conflict: false,
        risk_level: "SAFE",
        timestamp: null,
      };
    });

    const hasLiveData = Array.isArray(rawZoneData) && rawZoneData.length > 0;
    const dashboardPeople = crowdMetrics?.people_count;

    const liveZoneTotalPeople = hasLiveData
      ? rawZoneData.reduce((acc, row) => acc + (row.people_count || 0), 0)
      : 0;

    // When dashboard total people is zero, or live zone total is zero, or no active telemetry:
    const isTotalZero =
      dashboardPeople === 0 ||
      (hasLiveData && liveZoneTotalPeople === 0) ||
      (!hasLiveData && (dashboardPeople === undefined || dashboardPeople === 0));

    if (isTotalZero) {
      if (simulatedSurge) {
        map["ZONE_C"].surge_detected = true;
        map["ZONE_C"].risk_level = "CRITICAL";
      }
      return map;
    }

    if (hasLiveData) {
      // Direct 1-to-1 mapping from Database / Simulation Telemetry
      rawZoneData.forEach((row) => {
        if (row.zone_id && map[row.zone_id]) {
          const zone = ZONES[row.zone_id];
          const people = row.people_count ?? 0;
          const capacity = zone?.capacity || 100;
          const ratio = people / capacity;
          
          let risk = row.risk_level;
          if (!risk) {
            risk = ratio > 0.85 ? "CRITICAL" : ratio > 0.65 ? "HIGH" : ratio > 0.4 ? "WARNING" : "SAFE";
          }

          map[row.zone_id] = {
            ...map[row.zone_id],
            ...row,
            people_count: people,
            density: row.density ?? Number((people / (zone?.size[0] * zone?.size[1] || 1)).toFixed(2)),
            surge_detected: Boolean(row.surge_detected || (simulatedSurge && row.zone_id === "ZONE_C")),
            risk_level: simulatedSurge && row.zone_id === "ZONE_C" ? "CRITICAL" : risk,
          };
        }
      });
    } else if (dashboardPeople > 0) {
      // Use fallback baseline data only if dashboard people is explicitly > 0
      Object.keys(fallbackData).forEach((zId) => {
        map[zId] = {
          ...fallbackData[zId],
          surge_detected: Boolean(fallbackData[zId].surge_detected || (simulatedSurge && zId === "ZONE_C")),
          risk_level: simulatedSurge && zId === "ZONE_C" ? "CRITICAL" : fallbackData[zId].risk_level,
        };
      });
    }

    return map;
  }, [rawZoneData, crowdMetrics, fallbackData, simulatedSurge]);

  // Aggregate Key Metrics
  const aggregatedStats = useMemo(() => {
    const zones = Object.values(ZONES);
    let totalPeople = 0;
    let totalCapacity = 0;
    let sumDensity = 0;
    let criticalCount = 0;
    let highestDensityZone = null;
    let maxDensity = -1;

    zones.forEach((z) => {
      const metric = zoneMetricsMap[z.id] || {};
      const people = metric.people_count || 0;
      const density = metric.density || 0;
      const capacityRatio = people / z.capacity;

      totalPeople += people;
      totalCapacity += z.capacity;
      sumDensity += density;

      if (capacityRatio > 0.75 || metric.surge_detected) {
        criticalCount++;
      }

      if (people > 0 && density > maxDensity) {
        maxDensity = density;
        highestDensityZone = {
          ...z,
          density,
          people,
          occupancyPct: Math.round(capacityRatio * 100),
          risk: metric.risk_level || "SAFE",
        };
      }
    });

    if (totalPeople === 0) {
      highestDensityZone = null;
    }

    return {
      totalPeople,
      totalCapacity,
      overallOccupancyPct: Math.round((totalPeople / totalCapacity) * 100),
      avgDensity: (sumDensity / zones.length).toFixed(2),
      criticalCount,
      highestDensityZone,
    };
  }, [zoneMetricsMap]);

  // Ranked Hotspots (Highest density & occupancy first)
  const sortedHotspots = useMemo(() => {
    return Object.values(ZONES)
      .map((zone) => {
        const metric = zoneMetricsMap[zone.id] || {};
        const people = metric.people_count || 0;
        const capacityRatio = people / zone.capacity;
        const occupancyPct = Math.round(capacityRatio * 100);
        return {
          ...zone,
          metric,
          people,
          occupancyPct,
          density: metric.density || 0,
        };
      })
      .sort((a, b) => b.occupancyPct - a.occupancyPct);
  }, [zoneMetricsMap]);

  // Selected Zone Detailed Info
  const selectedZoneData = useMemo(() => {
    if (!activeZoneId || !ZONES[activeZoneId]) return null;
    const zone = ZONES[activeZoneId];
    const metric = zoneMetricsMap[activeZoneId] || {};
    const people = metric.people_count || 0;
    const occupancyPct = Math.round((people / zone.capacity) * 100);

    return {
      ...zone,
      metric,
      people,
      occupancyPct,
      density: metric.density || 0,
    };
  }, [activeZoneId, zoneMetricsMap]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
              <Flame size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Crowd Density Heatmap
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                  LIVE STREAM
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time high population detection and spatial crowd concentration analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Simulation Toggle Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSimulatedSurge((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium border transition ${
              simulatedSurge
                ? "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse"
                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            }`}
          >
            <ShieldAlert size={16} className={simulatedSurge ? "text-red-400" : "text-amber-400"} />
            {simulatedSurge ? "Surge Simulated" : "Trigger Surge Drill"}
          </button>
        </div>
      </div>

      {/* 2. KEY METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Crowd */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Crowd</span>
            <Users size={18} className="text-cyan-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {aggregatedStats.totalPeople.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {aggregatedStats.totalCapacity.toLocaleString()} cap
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, aggregatedStats.overallOccupancyPct)}%` }}
            />
          </div>
        </div>

        {/* Highest Density Hotspot */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Density Hotspot</span>
            <Flame size={18} className="text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-slate-900 dark:text-white truncate block">
              {aggregatedStats.highestDensityZone?.name || "None"}
            </span>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-500">
                {aggregatedStats.highestDensityZone?.density} p/m²
              </span>
              <span className="text-slate-400">
                {aggregatedStats.highestDensityZone?.occupancyPct}% full
              </span>
            </div>
          </div>
        </div>

        {/* Congested Zones */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Critical Zones</span>
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${aggregatedStats.criticalCount > 0 ? "text-red-500" : "text-emerald-400"}`}>
              {aggregatedStats.criticalCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              zones &gt; 75% capacity
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {aggregatedStats.criticalCount > 0
              ? "Immediate flow rerouting recommended."
              : "All zones operating within safe limits."}
          </p>
        </div>

        {/* Average Venue Density */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Venue Density</span>
            <Activity size={18} className="text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {aggregatedStats.avgDensity}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">people / m²</span>
          </div>
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Optimal flow baseline
          </p>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN VISUALIZATION PANEL (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-4 sm:p-6 shadow-sm">
            {/* Viewport Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Spatial Density Heat Field
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Updated live)
                </span>
              </div>

              {/* Intensity & Particles Quick Adjustments */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Heat Intensity:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={heatIntensity}
                    onChange={(e) => setHeatIntensity(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showParticles}
                    onChange={(e) => setShowParticles(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-0 accent-cyan-500"
                  />
                  Crowd Flow Motion
                </label>
              </div>
            </div>

            {/* Viewport Renderer Container */}
            <div className="h-[480px] sm:h-[550px] w-full rounded-2xl overflow-hidden relative">
              <HeatmapCanvas
                zoneMetricsMap={zoneMetricsMap}
                activeZoneId={activeZoneId}
                onSelectZone={(zId) => setActiveZoneId(zId)}
                showParticles={showParticles}
                heatIntensity={heatIntensity}
                heatRadius={heatRadius}
                minDensityThreshold={minDensityThreshold}
              />
            </div>

            {/* HEATMAP COLOR SCALE LEGEND */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Heat Scale (p/m²):
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-xs" />
                  <span className="text-slate-400">Low (&lt;1.0)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-xs" />
                  <span className="text-slate-400">Normal (1.0-2.0)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-xs" />
                  <span className="text-slate-400">Moderate (2.0-3.0)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-500 shadow-xs" />
                  <span className="text-slate-400">High (3.0-4.0)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-xs" />
                  <span className="text-red-400 font-semibold">Critical (&gt;4.0)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HOTSPOTS SPOTLIGHT & ZONE INSPECTOR */}
        <div className="space-y-6">
          {/* HIGH POPULATION HOTSPOTS SPOTLIGHT */}
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  High Density Hotspots
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by occupancy
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {sortedHotspots.map((item, index) => {
                const isSelected = activeZoneId === item.id;
                const isCritical = item.occupancyPct >= 80 || item.metric.surge_detected;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveZoneId(item.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/15"
                        : isCritical
                        ? "border-red-500/40 bg-red-500/5 hover:border-red-500"
                        : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-cyan-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? "bg-red-500/20 text-red-400"
                          : item.occupancyPct >= 60
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {item.occupancyPct}% Full
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{item.people} / {item.capacity} people</span>
                      <span className="font-mono text-cyan-400">{item.density} p/m²</span>
                    </div>

                    {/* Progress occupancy bar */}
                    <div className="mt-2 w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCritical
                            ? "bg-red-500"
                            : item.occupancyPct >= 60
                            ? "bg-amber-500"
                            : "bg-cyan-500"
                        }`}
                        style={{ width: `${Math.min(100, item.occupancyPct)}%` }}
                      />
                    </div>

                    {item.metric.surge_detected && (
                      <div className="mt-2 text-[11px] font-bold text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        SURGE DETECTED - INGRESS BOTTLENECK
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SELECTED ZONE DETAILS INSPECTOR */}
          {selectedZoneData ? (
            <div className="rounded-3xl bg-white dark:bg-[#111827] border border-cyan-500/40 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedZoneData.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedZoneData.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveZoneId(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <span className="text-slate-400 block mb-1">Density</span>
                  <span className="font-bold text-sm text-cyan-400">
                    {selectedZoneData.density} p/m²
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <span className="text-slate-400 block mb-1">Risk Level</span>
                  <span className={`font-bold text-sm ${
                    selectedZoneData.metric.risk_level === "CRITICAL"
                      ? "text-red-400"
                      : selectedZoneData.metric.risk_level === "HIGH"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}>
                    {selectedZoneData.metric.risk_level || "SAFE"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Description:</span>
                  <span className="text-right">{selectedZoneData.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dimensions:</span>
                  <span>{selectedZoneData.size[0]}m × {selectedZoneData.size[1]}m</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="/dashboard/exit-guidance"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-2.5 text-xs transition"
                >
                  <span>Dispatch Exit Guidance</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10 p-6 text-center text-slate-400 text-xs">
              <Info size={20} className="mx-auto mb-2 text-slate-500" />
              Click any zone on the heatmap canvas to inspect real-time crowd metrics and recommended flow actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
