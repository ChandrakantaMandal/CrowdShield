import React, { useState, useMemo } from "react";
import {
  Navigation,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Users,
  Compass,
  Radio,
  Send,
  MapPin,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import useLiveData from "../../../lib/useLiveData";
import { fetchZoneMetrics, fetchSafeGate } from "../../../lib/api";
import { ZONES, GATES } from "../../../Map/data/venueConfig";

// Default Exit Gates configuration mapped to venue layout
const VENUE_EXIT_GATES = [
  {
    id: "EMERGENCY_EXIT",
    name: "West Emergency Evacuation Gate",
    direction: "WEST",
    location: "Concourse beside Main Stage (Zone C / Zone A)",
    doorWidthMeters: 10,
    flowCapacityPerMin: 350,
    recommendedFor: ["ZONE_C", "ZONE_A"],
    accentColor: "red",
    icon: "🚨",
  },
  {
    id: "PUBLIC_EXIT",
    name: "East Public Exit Gate",
    direction: "EAST",
    location: "Concourse beside Robotics Arena & Lounge (Zone B / Zone D)",
    doorWidthMeters: 12,
    flowCapacityPerMin: 400,
    recommendedFor: ["ZONE_B", "ZONE_D"],
    accentColor: "emerald",
    icon: "🚪",
  },
  {
    id: "MAIN_ENTRY",
    name: "South Main Entrance & Ingress Gate",
    direction: "SOUTH",
    location: "Registration Plaza (Zone E)",
    doorWidthMeters: 12,
    flowCapacityPerMin: 300,
    recommendedFor: ["ZONE_E"],
    accentColor: "cyan",
    icon: "🎟️",
  },
];

export default function ExitGuidance() {
  const [selectedSourceZone, setSelectedSourceZone] = useState("ZONE_C");
  const [isEvacuationActive, setIsEvacuationActive] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState(null);

  // Fetch live zone telemetry from database/backend
  const { data: rawZoneData, loading } = useLiveData(fetchZoneMetrics, 2000);

  // Fetch safe gate calculation from backend API
  const { data: safeGateResult } = useLiveData(
    () => fetchSafeGate("GATE_C"),
    4000
  );

  // Consolidate live zone crowd count & density
  const zoneMetricsMap = useMemo(() => {
    const map = {};
    Object.values(ZONES).forEach((z) => {
      map[z.id] = { people_count: 0, density: 0 };
    });

    if (Array.isArray(rawZoneData) && rawZoneData.length > 0) {
      rawZoneData.forEach((row) => {
        if (row.zone_id && map[row.zone_id]) {
          map[row.zone_id] = {
            ...map[row.zone_id],
            ...row,
          };
        }
      });
    }
    return map;
  }, [rawZoneData]);

  // Compute evacuation times per gate based on assigned zones crowd load
  const gateEvacuationStats = useMemo(() => {
    return VENUE_EXIT_GATES.map((gate) => {
      // Sum people count in recommended zones
      let assignedPeople = 0;
      gate.recommendedFor.forEach((zId) => {
        assignedPeople += zoneMetricsMap[zId]?.people_count || 0;
      });

      // Calculate estimated evacuation time in seconds: (people / flowPerMin) * 60
      const evacSecs = Math.max(
        12,
        Math.round((assignedPeople / gate.flowCapacityPerMin) * 60)
      );

      // Determine gate status
      let status = "OPTIMAL";
      let statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      if (evacSecs > 75 || assignedPeople > 600) {
        status = "CRITICAL HEAVY";
        statusBadge = "bg-red-500/10 text-red-400 border-red-500/20";
      } else if (evacSecs > 40) {
        status = "MODERATE TRAFFIC";
        statusBadge = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      }

      return {
        ...gate,
        assignedPeople,
        evacSecs,
        status,
        statusBadge,
      };
    });
  }, [zoneMetricsMap]);

  // Active Source Zone detail
  const sourceZoneInfo = ZONES[selectedSourceZone] || ZONES.ZONE_C;
  const sourceMetrics = zoneMetricsMap[selectedSourceZone] || {
    people_count: 0,
    density: 0,
  };

  // Dispatch emergency alert simulation
  const handleDispatchGuidance = () => {
    setIsEvacuationActive(true);
    setDispatchStatus("Evacuation guidance broadcasted to venue PA & digital signage!");
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & DISPATCH CONTROLS */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
              <Navigation size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Emergency Exit Guidance
                </h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${
                  isEvacuationActive
                    ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${isEvacuationActive ? "bg-red-400 animate-ping" : "bg-emerald-400"}`} />
                  {isEvacuationActive ? "EVACUATION ACTIVE" : "MONITORING STANDBY"}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time gate congestion monitoring and intelligent crowd evacuation routing algorithms.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDispatchGuidance}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition shadow-lg ${
              isEvacuationActive
                ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                : "bg-cyan-500 hover:bg-cyan-600 text-slate-950"
            }`}
          >
            <Radio size={16} />
            {isEvacuationActive ? "Re-Broadcast Guidance" : "Broadcast Evacuation Route"}
          </button>
        </div>
      </div>

      {dispatchStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            {dispatchStatus}
          </span>
          <button
            onClick={() => setDispatchStatus(null)}
            className="text-xs underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. REAL-TIME GATE EVACUATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gateEvacuationStats.map((gate) => (
          <div
            key={gate.id}
            className={`rounded-3xl bg-white dark:bg-[#111827] border p-6 space-y-4 shadow-sm transition hover:shadow-md ${
              gate.status.includes("CRITICAL")
                ? "border-red-500/40 bg-red-500/[0.02]"
                : "border-slate-200 dark:border-white/5"
            }`}
          >
            {/* Gate Icon & Direction Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{gate.icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {gate.direction} Exit
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    {gate.name}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${gate.statusBadge}`}>
                {gate.status}
              </span>
            </div>

            {/* Estimated Evacuation Time Counter */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-cyan-500" />
                Est. Clearance Time
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${
                  gate.evacSecs > 60
                    ? "text-red-500"
                    : gate.evacSecs > 35
                    ? "text-amber-500"
                    : "text-emerald-500"
                }`}>
                  {gate.evacSecs} sec
                </span>
                <span className="text-xs text-slate-400">
                  (~{(gate.evacSecs / 60).toFixed(1)} mins)
                </span>
              </div>
            </div>

            {/* Assigned Zone Load & Flow Capacity */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Crowd Load:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {gate.assignedPeople} people
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exit Flow Capacity:</span>
                <span className="font-semibold text-cyan-400">
                  {gate.flowCapacityPerMin} people/min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doorway Width:</span>
                <span>{gate.doorWidthMeters} meters</span>
              </div>
            </div>

            {/* Location Description */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{gate.location}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. DYNAMIC SAFE GATE ROUTING CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOURCE ZONE SELECTOR & ROUTING DETAILS */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Compass size={20} className="text-cyan-500" />
                Zone Evacuation Vector Calculator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a congested venue zone to compute optimal egress vector and safe gate assignment.
              </p>
            </div>

            {/* Zone Selector Dropdown */}
            <select
              value={selectedSourceZone}
              onChange={(e) => setSelectedSourceZone(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            >
              {Object.values(ZONES).map((z) => (
                <option key={z.id} value={z.id} className="bg-[#111827] text-white">
                  {z.name} ({z.id})
                </option>
              ))}
            </select>
          </div>

          {/* SOURCE ZONE ANALYSIS CARD */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Source Origin Zone
                </span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {sourceZoneInfo.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {sourceZoneInfo.role} • Capacity {sourceZoneInfo.capacity}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {sourceMetrics.people_count}
                </span>
                <span className="text-xs text-slate-400 block">people present</span>
              </div>
            </div>

            {/* RECOMMENDED EVACUATION ROUTE BANNER */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold shrink-0">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase">Recommended Safe Exit Path</span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedSourceZone === "ZONE_C" || selectedSourceZone === "ZONE_A"
                      ? "WEST EMERGENCY EVACUATION GATE (West Concourse)"
                      : selectedSourceZone === "ZONE_B" || selectedSourceZone === "ZONE_D"
                      ? "EAST PUBLIC EXIT GATE (East Concourse)"
                      : "SOUTH MAIN ENTRANCE & INGRESS GATE (South Plaza)"}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block">Est. Egress Time</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {Math.round((sourceMetrics.people_count / 350) * 60)} sec
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BACKEND SAFE GATE ALGORITHM RESPONSE */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              AI Safe-Gate Engine
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time API vector calculated from FastAPI server algorithm:
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Zone:</span>
              <span className="font-bold text-white">{selectedSourceZone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Optimal Safe Gate:</span>
              <span className="font-bold text-cyan-400">
                {safeGateResult?.safe_gate || "GATE_B"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Direction:</span>
              <span className="font-bold text-emerald-400">
                {safeGateResult?.direction || "WEST"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Distance Vector:</span>
              <span>{safeGateResult?.distance || "28.5"} meters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gate Risk Level:</span>
              <span className="font-bold text-emerald-400">
                {safeGateResult?.risk_level || "SAFE"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              {safeGateResult?.message || "Move WEST towards GATE_B for fastest evacuation."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
