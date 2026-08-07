import { Camera, Maximize2, Wifi, Circle, ScanLine } from "lucide-react";
import { useState } from "react";
import Modal from "./Modal";

const videoContent = (
  <>
    {/* Replace this div with your video stream */}
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <div className="text-center">
        <Camera size={60} className="mx-auto text-slate-600" />

        <h3 className="mt-4 text-lg font-semibold text-slate-300">
          Camera Preview
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Waiting for live video stream...
        </p>
      </div>
    </div>

    {/* Scan animation */}
    <div className="absolute left-0 right-0 top-0 h-[2px] bg-cyan-400/60 animate-pulse" />

    {/* Recording */}
    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur">
      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />

      <span className="text-xs font-medium text-red-50">REC</span>
    </div>

    {/* Camera Info */}
    <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <Wifi size={15} className="text-emerald-400" />
        Camera Connected
      </div>

      <div className="mt-1 text-xs text-slate-400">
        1920 × 1080 • 30 FPS
      </div>
    </div>

    {/* AI Status */}
    <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 backdrop-blur px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <ScanLine size={16} className="text-cyan-400" />
        AI Detection Active
      </div>

      <div className="mt-1 text-xs text-emerald-400">Confidence 98.7%</div>
    </div>
  </>
);

export default function CameraFeed() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="text-cyan-600 dark:text-cyan-400" size={30} />

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Live Camera Feed</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Entrance Camera • AI Detection Enabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Circle size={8} fill="currentColor" className="animate-pulse" />
            LIVE
          </span>

          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] p-2 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Expand camera feed"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="relative h-72 bg-black">
        {videoContent}
      </div>
    </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Live Camera Feed"
        subtitle="Entrance Camera • AI Detection Enabled"
        icon={<Camera size={20} className="text-cyan-600 dark:text-cyan-400" />}
      >
        <div className="relative aspect-video w-full bg-black">
          {videoContent}
        </div>
      </Modal>
    </>
  );
}
