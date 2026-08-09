import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export function AlertBanner({ activeScenario, highestRiskZone, isStampede }) {
  if (!highestRiskZone) return null;

  const { zone_id, risk } = highestRiskZone;
  const isCritical = risk.level === 'CRITICAL' || isStampede || activeScenario === 'surge' || activeScenario === 'stampede';
  const isHigh = risk.level === 'HIGH' || activeScenario === 'bottleneck';
  const isWarning = risk.level === 'WARNING' || activeScenario === 'crowd_increase';

  if (!isCritical && !isHigh && !isWarning && activeScenario === 'normal') return null;

  const bannerTheme = isCritical
    ? {
        container: 'bg-red-950/95 border-red-500 text-white ring-4 ring-red-500/40 animate-pulse',
        iconBg: 'bg-red-600 text-white',
        tag: 'bg-red-500/20 text-red-300 border-red-500/40',
        title: isStampede ? '🚨 STAMPEDE EVACUATION SAFETY DRILL ACTIVE' : `🚨 CRITICAL CROWD RISK: ${risk.level}`
      }
    : isHigh
    ? {
        container: 'bg-orange-950/95 border-orange-500 text-orange-100 ring-2 ring-orange-500/30',
        iconBg: 'bg-orange-600 text-white',
        tag: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        title: `⚠️ HIGH CROWD DENSITY DETECTED`
      }
    : {
        container: 'bg-amber-950/90 border-amber-500 text-amber-100 ring-2 ring-amber-500/30',
        iconBg: 'bg-amber-600 text-white',
        tag: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        title: `⚡ ELEVATED CROWD INFLUX DETECTED`
      };

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto z-30 w-11/12 max-w-3xl flex justify-center pointer-events-none px-4">
      <div
        className={`pointer-events-auto w-full p-4 rounded-xl border backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${bannerTheme.container}`}
      >
        {/* Left icon & title */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl shadow-lg ${bannerTheme.iconBg}`}>
            {isCritical ? (
              <ShieldAlert className="w-7 h-7 animate-bounce" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider uppercase font-mono">
                {bannerTheme.title}
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-black/50 border border-white/20">
                SCORE: {risk.score}/100
              </span>
            </div>
            <p className="text-xs font-medium text-slate-200 mt-0.5">
              Sector: <strong className="text-cyan-300 font-mono font-bold">{zone_id}</strong> • Live Surge & Flow Anomaly Monitoring
            </p>
          </div>
        </div>

        {/* Action Recommendation */}
        <div className="flex-1 max-w-lg bg-black/50 p-2.5 rounded-lg border border-white/15 text-xs">
          <div className="font-bold text-amber-300 uppercase tracking-wide text-[10px] mb-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Response Protocol:
          </div>
          <p className="text-slate-100 font-sans leading-tight">
            {isStampede
              ? 'OPEN EMERGENCY EXIT GATES IMMEDIATELY. Broadcast evacuation voice command and divert security personnel.'
              : risk.recommendations}
          </p>
        </div>
      </div>
    </div>
  );
}

