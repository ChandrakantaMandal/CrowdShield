import {
  MapPinned,
  Maximize2,
  LocateFixed,
  Layers3,
  Users,
  TriangleAlert,
} from "lucide-react";

import { useState } from "react";

import Modal from "./Modal";
import useLiveData from "../../../lib/useLiveData";
import { fetchCrowdMetrics, fetchAlerts } from "../../../lib/api";

const SIMULATION_MAP_URL =
  import.meta.env.VITE_SIMULATION_URL || "http://localhost:3000/?view=map";

// Map Body
function MapBody({ layersOpen }) {
  const metrics = useLiveData(fetchCrowdMetrics, 2000);
  const riskEvents = useLiveData(() => fetchAlerts(50), 5000);

  const peopleCount = metrics.data?.people_count ?? 0;
  const highRiskZones = (riskEvents.data || []).filter((event) =>
    ["HIGH", "CRITICAL"].includes(event.risk_level)
  ).length;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0B1220]">
      {/* LIVE 3D CROWD SIMULATION (map-only view) */}
      <div className="absolute inset-0 overflow-hidden bg-[#0B1220]">
        <iframe
          src={SIMULATION_MAP_URL}
          title="Live Crowd Map"
          className="h-full w-full border-0"
          allow="accelerometer; gyroscope; camera"
        />
      </div>

      {/*DENSITY LEGEND*/}

      {layersOpen && (
        <div className="absolute bottom-6 left-6 z-2 rounded-xl border border-white/5 bg-[#111827]/90 p-4 shadow-xl backdrop-blur-xl">
          <h4 className="mb-3 text-sm font-semibold text-white">
            Density Legend
          </h4>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-400" />

              <span>Low Density</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-yellow-400" />

              <span>Moderate</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500" />

              <span>Critical</span>
            </div>
          </div>
        </div>
      )}

      {/* LIVE DETECTION PANEL */}

      {layersOpen && (
        <div className="absolute right-6 top-6 z-20 hidden w-60 rounded-xl border border-white/5 bg-[#111827]/90 p-4 shadow-xl backdrop-blur-xl sm:block ">
          <h4 className="mb-4 text-sm font-semibold text-white">
            Live Detection
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">People</span>
              <span className="flex items-center gap-2 font-semibold text-white">
                <Users size={16} className="text-cyan-400" />
                {peopleCount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">High Risk Zones</span>

              <span className="flex items-center gap-2 font-semibold text-red-400">
                <TriangleAlert size={16} />
                {highRiskZones}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">AI Confidence</span>

              <span className="font-semibold text-emerald-400">98.7%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Processing</span>

              <span className="font-semibold text-cyan-400">24 FPS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Crowd Map
export default function CrowdMap() {
  const [layersOpen, setLayersOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [layers] = useState({
    densityGrid: true,
    heatZones: true,
  });

  return (
    <>
      {/*MAIN MAP CARD*/}

      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/5   dark:bg-[#111827]">
        {/* HEADER*/}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-white/5 ">
          {/* Left */}

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
              <MapPinned size={19} className="text-cyan-500" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Live Crowd Map
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Detection Overlay
              </p>
            </div>
          </div>

          {/* Right Controls */}

          <div className="flex items-center gap-2 sm:gap-3">
            <span className=" hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400 sm:flex">
              <span className=" h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              LIVE
            </span>

            {/* Layers */}

            <button
              type="button"
              onClick={() => {
                setLayersOpen((current) => !current);
              }}
              className={`rounded-lgborder p-2 transition
                ${
                  layersOpen
                    ? `border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 `
                    : `border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/10 `
                }
              `}
              aria-label="Toggle layers"
            >
              <Layers3 size={18} />
            </button>

            {/* Locate */}

            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Locate"
            >
              <LocateFixed size={18} />
            </button>

            {/* Expand */}

            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
              }}
              className="
                rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Expand crowd map"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        {/*SMALL MAP*/}

        <div
          className="
            relative h-[380px] w-full overflow-hidden bg-[#0B1220] sm:h-[430px]  lg:h-[450px]"
        >
          <MapBody layers={layers} layersOpen={layersOpen} />
        </div>
      </div>

      {/*EXPANDED MAP MODAL */}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title="Live Crowd Map"
        subtitle="AI Detection Overlay"
        icon={
          <MapPinned size={20} className="text-cyan-600 dark:text-cyan-400" />
        }
      >
        <div
          className="
            relative
            h-[70vh]
            min-h-[500px]
            w-full
            overflow-hidden
            bg-[#0B1220]
          "
        >
          <MapBody layers={layers} layersOpen={layersOpen} />
        </div>
      </Modal>
    </>
  );
}
