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


const mapBody = (
  layers,
  layersOpen
) => (
  <>
    {/* Grid */}
    {layers.densityGrid && (
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    )}

    {/* Floorplan Placeholder */}
    <div className="absolute inset-10 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
      <div className="text-center">
        <MapPinned className="mx-auto text-slate-600" size={70} />

        <h3 className="mt-5 text-xl font-semibold text-slate-300">
          Live Floor Plan
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Upload a floor plan or connect a live camera
        </p>
      </div>
    </div>

    {/* Heat Zones */}
    {layers.heatZones && (
      <>
        <div className="absolute left-[28%] top-[30%] h-20 w-20 rounded-full bg-yellow-500/30 blur-2xl" />

        <div className="absolute left-[58%] top-[48%] h-24 w-24 rounded-full bg-red-500/40 blur-2xl animate-pulse" />

        <div className="absolute left-[72%] top-[24%] h-16 w-16 rounded-full bg-cyan-500/20 blur-xl" />
      </>
    )}

    {/* Legend */}
    {layersOpen && (
      <div className="absolute bottom-6 left-6 rounded-xl border border-white/5 bg-[#111827]/90 backdrop-blur-xl p-4">
        <h4 className="mb-3 text-sm font-semibold text-white">
          Density Legend
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
            Low Density
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            Moderate
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            Critical
          </div>
        </div>
      </div>
    )}

    {/* Layers Panel */}
    {layersOpen && (
      <div className="absolute right-6 top-6 hidden sm:block w-60 rounded-xl border border-white/5 bg-[#111827]/90 backdrop-blur-xl p-4">
        <h4 className="mb-4 text-sm font-semibold text-white">
          Live Detection
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">People</span>

            <span className="flex items-center gap-2 font-semibold text-white">
              <Users size={16} className="text-cyan-400" />
              1,284
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">High Risk Zones</span>

            <span className="flex items-center gap-2 font-semibold text-red-400">
              <TriangleAlert size={16} />3
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">AI Confidence</span>

            <span className="font-semibold text-emerald-400">98.7%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Processing</span>

            <span className="font-semibold text-cyan-400">24 FPS</span>
          </div>
        </div>
      </div>
    )}

  </>
);

export default function CrowdMap() {
  const [layersOpen, setLayersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [layers] = useState({
    densityGrid: true,
    heatZones: true,
  });



  return (
    <>
    <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] h-[480px] lg:h-[620px] overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <MapPinned className="text-cyan-600 dark:text-cyan-400" size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Live Crowd Map</h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">AI Detection Overlay</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>

          <button
            onClick={() => setLayersOpen((o) => !o)}
            className={`rounded-lg border p-2 transition ${
              layersOpen
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                : "border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10"
            }`}
            aria-label="Toggle layers"
          >
            <Layers3 size={18} />
          </button>

          <button className="rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-2 hover:bg-slate-100 dark:hover:bg-white/10">
            <LocateFixed size={18} />
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-2 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Expand crowd map"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[calc(100%-64px)] bg-[#0B1220] overflow-hidden">
        {mapBody(layers, layersOpen)}
      </div>
    </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Live Crowd Map"
        subtitle="AI Detection Overlay"
        icon={<MapPinned size={20} className="text-cyan-600 dark:text-cyan-400" />}
      >
        <div className="relative h-[70vh] bg-[#0B1220] overflow-hidden">
          {mapBody(layers, layersOpen)}
        </div>
      </Modal>
    </>
  );
}
