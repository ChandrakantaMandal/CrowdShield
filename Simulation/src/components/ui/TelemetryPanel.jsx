import React from 'react';
import { ZONES } from '../../data/venueConfig';
import { calculateZoneRisk } from '../../engine/RiskEngine';
import { Users, Gauge, ArrowUpRight, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export function TelemetryPanel({ zoneMetrics = {}, activeZone, onSelectZone }) {
  const totalPopulation = Object.values(zoneMetrics).reduce((acc, m) => acc + (m.people_count || 0), 0);
  const selectedZone = ZONES[activeZone] || ZONES.ZONE_C;
  const metrics = zoneMetrics[activeZone] || {
    people_count: 0,
    density: 0,
    speed: 1.0,
    direction: 'NORTH',
    surge_detected: false,
    bottleneck: false,
    flow_conflict: false
  };

  const risk = calculateZoneRisk({
    ...metrics,
    capacity: selectedZone.capacity
  });

  return (
    <div className="absolute top-16 right-4 z-10 w-80 bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-xl p-3.5 shadow-2xl text-slate-100 flex flex-col gap-3">
      {/* Total Population Counter */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              Venue Crowd Count
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {totalPopulation} <span className="text-xs font-normal text-slate-400">Agents</span>
            </div>
          </div>
        </div>
        <div className="text-right font-mono text-xs">
          <div className="text-slate-400">Total Zones</div>
          <div className="text-cyan-400 font-bold">5 Active</div>
        </div>
      </div>

      {/* Zone Tabs Selector */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Telemetry Zones</span>
          <span className="text-cyan-400">Click to Select</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {Object.keys(ZONES).map(zid => {
            const zm = zoneMetrics[zid] || { level: 'SAFE' };
            const isSel = activeZone === zid;
            const zRisk = calculateZoneRisk({ ...zm, capacity: ZONES[zid].capacity });

            return (
              <button
                key={zid}
                onClick={() => onSelectZone(zid)}
                className={`py-1.5 px-1 rounded text-center transition-all border ${isSel
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
              >
                <div className="text-[10px] font-mono font-bold">{zid.replace('ZONE_', 'Z-')}</div>
                <div
                  className="w-2 h-2 rounded-full mx-auto mt-1"
                  style={{ backgroundColor: zRisk.color }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Telemetry Card */}
      <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{selectedZone.name}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Cap: {selectedZone.capacity} • {selectedZone.role}
            </p>
          </div>
          <div
            className="px-2 py-1 rounded text-xs font-bold font-mono border text-slate-950 uppercase shadow"
            style={{ backgroundColor: risk.color, borderColor: risk.color }}
          >
            {risk.level} ({risk.score})
          </div>
        </div>

        {/* Density Gauge Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 font-mono">Density Level</span>
            <span className="font-bold font-mono text-cyan-300">{metrics.density}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(metrics.density, 100)}%`,
                backgroundColor: risk.color
              }}
            />
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" /> Avg Speed
            </div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">
              {metrics.speed.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">m/s</span>
            </div>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-amber-400" /> Flow Vector
            </div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">
              {metrics.direction}
            </div>
          </div>
        </div>

        {/* Telemetry Status Flags */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] font-mono">
          <span
            className={`px-2 py-0.5 rounded border ${metrics.surge_detected
                ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold animate-pulse'
                : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
          >
            SURGE: {metrics.surge_detected ? 'DETECTED' : 'CLEAR'}
          </span>
          <span
            className={`px-2 py-0.5 rounded border ${metrics.bottleneck
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
          >
            BOTTLENECK: {metrics.bottleneck ? 'YES' : 'NO'}
          </span>
        </div>
      </div>
    </div>
  );
}
