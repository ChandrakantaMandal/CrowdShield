import React, { useState } from 'react';
import { X, Server, Database, Save, Check } from 'lucide-react';

export function SettingsModal({
  isOpen,
  onClose,
  apiUrl,
  onSaveApiUrl,
  runId,
  onSaveRunId
}) {
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [runIdInput, setRunIdInput] = useState(runId);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveApiUrl(urlInput);
    onSaveRunId(runIdInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
          <Server className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-base text-white font-outfit">
            Simulation & API Settings
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              FastAPI Telemetry Endpoint URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Target for POST /api/crowd/metrics telemetry stream.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Simulation Run ID
            </label>
            <input
              type="text"
              value={runIdInput}
              onChange={(e) => setRunIdInput(e.target.value)}
              placeholder="DEMO-STAMPEDE-001"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Deterministic identifier for Supabase database filtering.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
