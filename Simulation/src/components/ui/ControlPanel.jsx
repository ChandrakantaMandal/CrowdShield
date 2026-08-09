import React from 'react';
import { SCENARIOS } from '../../data/venueConfig';
import { AlertTriangle, ShieldAlert, Users, Flame, RefreshCw, Zap } from 'lucide-react';

export function ControlPanel({ activeScenario, onSelectScenario, onReset }) {
  const scenarioIcons = {
    normal: <Users className="w-4 h-4 text-emerald-400" />,
    crowd_increase: <Zap className="w-4 h-4 text-amber-400" />,
    bottleneck: <AlertTriangle className="w-4 h-4 text-orange-400" />,
    surge: <Flame className="w-4 h-4 text-red-400" />,
    stampede: <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
  };

  return (
    <div className="absolute top-16 left-4 z-10 w-72 bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-xl p-3.5 shadow-2xl text-slate-100">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h2 className="font-bold text-xs tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" /> Scenario Drills
        </h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors bg-slate-900 px-2 py-1 rounded border border-slate-800"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="space-y-2">
        {Object.values(SCENARIOS).map(sc => {
          const isActive = activeScenario === sc.id;
          const isStampede = sc.id === 'stampede';

          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all duration-200 flex items-start gap-3 group relative overflow-hidden ${
                isStampede
                  ? isActive
                    ? 'bg-red-950/90 border-red-500 text-white shadow-lg shadow-red-500/20 ring-2 ring-red-500'
                    : 'bg-gradient-to-r from-red-900/40 to-slate-900 border-red-500/60 text-red-200 hover:bg-red-900/60'
                  : isActive
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-md mt-0.5 ${isActive ? 'bg-slate-900' : 'bg-slate-950'}`}>
                {scenarioIcons[sc.id]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${isStampede ? 'text-red-400 tracking-wide' : 'text-slate-100'}`}>
                    {sc.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      isStampede
                        ? 'bg-red-500 text-slate-950 border-red-400 font-extrabold animate-pulse'
                        : isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {sc.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mt-1 line-clamp-2">
                  {sc.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
