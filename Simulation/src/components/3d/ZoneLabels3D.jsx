import React from 'react';
import { Html } from '@react-three/drei';
import { ZONES } from '../../data/venueConfig';
import { calculateZoneRisk } from '../../engine/RiskEngine';

export function ZoneLabels3D({ zoneMetrics = {}, activeZone, onSelectZone }) {
  return (
    <group>
      {Object.values(ZONES).map(zone => {
        const [cx, , cz] = zone.center;
        const [w, d] = zone.size;

        const metrics = zoneMetrics[zone.id] || {
          people_count: 0,
          density: 0,
          speed: 1.0,
          surge_detected: false,
          bottleneck: false,
          flow_conflict: false
        };

        const risk = calculateZoneRisk({
          ...metrics,
          capacity: zone.capacity
        });

        const isSelected = activeZone === zone.id;

        const levelColors = {
          SAFE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          WARNING: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          CRITICAL: 'bg-red-500/30 text-red-400 border-red-500/60 animate-pulse'
        };

        const badgeClass = levelColors[risk.level] || levelColors.SAFE;

        // Position along the front border perimeter of the zone, matching its width
        const posX = cx;
        const posY = 0.02;
        const posZ = cz + d / 2 - 2.2;
        const cardWidth = Math.max(260, Math.round(w * 16));

        return (
          <Html
            key={zone.id}
            transform
            rotation={[-Math.PI / 2, 0, 0]}
            position={[posX, posY, posZ]}
            scale={1.4}
            center
            zIndexRange={[0, 0]}
          >
            <div
              onClick={() => onSelectZone(zone.id)}
              className={`cursor-pointer transition-all duration-300 transform select-none ${
                isSelected ? 'scale-105 ring-4 ring-cyan-400 ring-offset-2 ring-offset-black' : 'hover:scale-102 opacity-95 hover:opacity-100'
              }`}
            >
              <div
                className="bg-black/90 backdrop-blur-md border-4 border-dashed rounded-2xl p-4 shadow-2xl text-center font-mono"
                style={{
                  width: `${cardWidth}px`,
                  borderColor: isSelected ? '#22d3ee' : risk.color,
                  boxShadow: `0 0 45px ${risk.color}50`
                }}
              >
                {/* Zone Border Stencil Header */}
                <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b-2 border-dashed border-white/30">
                  <div className="flex items-center gap-2 text-white font-black text-sm tracking-widest">
                    <span className="text-amber-400">/</span>
                    <span className="text-white uppercase">{zone.id.replace('ZONE_', 'ZONE ')}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded border-2 uppercase tracking-wider font-mono shadow-md ${badgeClass}`}
                  >
                    STATUS: {risk.level}
                  </span>
                </div>

                {/* Zone Name - White & Bold */}
                <div className="text-xl font-black text-white tracking-wider mb-2 drop-shadow uppercase">
                  {zone.name}
                </div>

                {/* Perimeter Density Bar */}
                <div className="w-full bg-slate-900 h-3.5 rounded-md overflow-hidden border-2 border-white/30 mb-2.5 p-0.5 shadow-inner">
                  <div
                    className="h-full transition-all duration-300 rounded"
                    style={{
                      width: `${Math.min(metrics.density || 0, 100)}%`,
                      backgroundColor: risk.color
                    }}
                  />
                </div>

                {/* Border Telemetry Stats Row */}
                <div className="flex items-center justify-between text-xs text-white font-black bg-zinc-900/90 px-4 py-2 rounded-lg border-2 border-white/20 shadow-inner">
                  <span>COUNT: <strong className="text-white text-base">{metrics.people_count || 0}</strong></span>
                  <span className="text-zinc-500">|</span>
                  <span>CAP: <strong className="text-white text-base">{zone.capacity}</strong></span>
                  <span className="text-zinc-500">|</span>
                  <span>DENSITY: <strong className="text-base text-white">{metrics.density || 0}%</strong></span>
                </div>
              </div>
            </div>
          </Html>
        );
      })}
    </group>
  );
}


