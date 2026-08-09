import React from 'react';
import { Shield, Clock, Activity, Wifi, WifiOff, Settings, Play, Pause } from 'lucide-react';
import { SCENARIOS } from '../../data/venueConfig';

export function TopHeader({
  simSeconds,
  simSpeed,
  onChangeSimSpeed,
  scenarioKey,
  runId,
  isPaused,
  onTogglePause,
  isConnected,
  isStreamingEnabled,
  onToggleStreaming,
  onOpenSettings
}) {
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.normal;

  const baseTime = React.useMemo(() => new Date(), []);
  const simTime = new Date(baseTime.getTime() + simSeconds * 1000);
  const timeString = simTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-slate-100 shadow-xl">
      {/* Brand & Digital Twin Status */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-wider text-white font-outfit">
              CROWD<span className="text-cyan-400">SHIELD</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-widest">
              3D Digital Twin
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>RUN:</span>
            <span className="text-cyan-400 font-semibold">{runId}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-medium">SIMULATION DRILL</span>
          </p>
        </div>
      </div>

      {/* Clock & Speed Control */}
      <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="font-mono text-sm font-bold text-white tracking-wider">
            {timeString}
          </div>
        </div>

        <button
          onClick={onTogglePause}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />}
        </button>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-1">SPEED:</span>
          {[1, 10, 60, 300].map(s => (
            <button
              key={s}
              onClick={() => onChangeSimSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                simSpeed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Active Scenario Badge & API Status */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Scenario:</span>
          <span className="font-semibold text-cyan-300">{scenario.name}</span>
        </div>

        <button
          onClick={onToggleStreaming}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-mono transition-all ${
            isConnected
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : isStreamingEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
          title={
            isConnected
              ? 'FastAPI Telemetry Stream Active (Click to disable)'
              : isStreamingEnabled
              ? 'Connecting to FastAPI... (Click to disable)'
              : 'Standalone Mode (Click to enable FastAPI sync)'
          }
        >
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">
            {isConnected ? 'API LIVE' : isStreamingEnabled ? 'CONNECTING...' : 'CONNECT'}
          </span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          title="Simulation Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
