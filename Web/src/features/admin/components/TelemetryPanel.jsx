import { Activity, Users, Gauge, ArrowUpRight, AlertTriangle, Wifi, WifiOff, Loader2 } from "lucide-react";
import useLiveData from "../../../lib/useLiveData";
import { fetchCrowdMetrics, fetchZoneMetrics, formatTime } from "../../../lib/api";
import { ZONES } from "../../../Map/data/venueConfig";

const DENSITY_LEVELS = [
  { max: 40, label: "SAFE", text: "text-emerald-500", bg: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { max: 60, label: "WARNING", text: "text-amber-500", bg: "bg-amber-500", chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { max: 80, label: "HIGH", text: "text-orange-500", bg: "bg-orange-500", chip: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  { max: 101, label: "CRITICAL", text: "text-red-500", bg: "bg-red-500", chip: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" },
];

function densityLevel(density) {
  return DENSITY_LEVELS.find((l) => density < l.max) || DENSITY_LEVELS[DENSITY_LEVELS.length - 1];
}

function zoneConfig(zoneId) {
  return (
    ZONES[zoneId] || {
      id: zoneId,
      name: zoneId,
      role: "Unknown Zone",
      capacity: 0,
      color: "#64748b",
    }
  );
}

export default function TelemetryPanel() {
  const { data: zones, error: zonesError, loading: zonesLoading } = useLiveData(fetchZoneMetrics, 5000);
  const { data: snapshot, error: snapshotError } = useLiveData(fetchCrowdMetrics, 2000);

  const zoneRows = Array.isArray(zones) ? zones : [];
  const totalPeople = zoneRows.reduce((acc, z) => acc + (z.people_count || 0), 0);
  const liveZones = zoneRows.filter((z) => (z.people_count || 0) > 0).length;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827]">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg">
            <Activity size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Live Telemetry</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zone-wise crowd data from backend
            </p>
          </div>
        </div>

        {zonesError || snapshotError ? (
          <span className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs text-red-600 dark:text-red-400">
            <WifiOff size={12} /> OFFLINE
          </span>
        ) : (
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Wifi size={12} /> LIVE
          </span>
        )}
      </div>

      {/* Venue Total */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Venue Crowd Count
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {zonesLoading ? "—" : totalPeople}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> Prople</span>
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <div className="text-slate-500 dark:text-slate-400">Zones Reporting</div>
          <div className="text-cyan-600 dark:text-cyan-400 font-bold">
            {zonesLoading ? "—" : `${liveZones}/${zoneRows.length}`}
          </div>
        </div>
      </div>

      {/* Zone-wise breakdown */}
      <div className="px-6 pb-6 space-y-3 max-h-[520px] overflow-y-auto">
        {zonesLoading && !zoneRows.length && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Loading telemetry...
          </div>
        )}

        {!zonesLoading && !zoneRows.length && (
          <div className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
            No zone data received from backend yet.
          </div>
        )}

        {zoneRows.map((zone) => {
          const cfg = zoneConfig(zone.zone_id);
          const density = Number(zone.density || 0);
          const speed = Number(zone.average_speed ?? zone.speed ?? 0);
          const level = densityLevel(density);

          return (
            <div
              key={zone.zone_id}
              className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {cfg.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {zone.zone_id} • Cap {cfg.capacity || "—"}
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border ${level.chip}`}>
                  {level.label} {density}%
                </span>
              </div>

              {/* Density bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Density</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {zone.people_count || 0} people
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(density, 100)}%`, backgroundColor: cfg.color }}
                  />
                </div>
              </div>

              {/* Metric grid */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Gauge size={11} className="text-cyan-600 dark:text-cyan-400" /> Avg Speed
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-200">
                    {speed.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">m/s</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <ArrowUpRight size={11} className="text-amber-500" /> Flow Vector
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-200">
                    {zone.direction || "UNKNOWN"}
                  </div>
                </div>
              </div>

              {/* Status flags */}
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                <span
                  className={`px-2 py-0.5 rounded border ${
                    zone.surge_detected
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/40 font-bold animate-pulse"
                      : "bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  SURGE: {zone.surge_detected ? "DETECTED" : "CLEAR"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded border ${
                    zone.bottleneck
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 font-bold"
                      : "bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  BOTTLENECK: {zone.bottleneck ? "YES" : "NO"}
                </span>
              </div>

              {/* Updated time */}
              <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <AlertTriangle size={9} />
                Updated {zone.created_at ? formatTime(zone.created_at) : "—"}
              </div>
            </div>
          );
        })}

        {!zonesLoading && snapshot && snapshot.zone_id && !zoneRows.some((z) => z.zone_id === snapshot.zone_id) && (
          <div className="text-[11px] font-mono text-slate-400 text-center">
            Snapshot zone {snapshot.zone_id}: {snapshot.people_count} people, density {snapshot.density}%
          </div>
        )}
      </div>
    </div>
  );
}
