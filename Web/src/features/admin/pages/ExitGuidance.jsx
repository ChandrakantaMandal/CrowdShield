import { Navigation } from "lucide-react";

export default function ExitGuidance() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Emergency Exit Guidance</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["North", "East", "South"].map((exit) => (
          <div
            key={exit}
            className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6"
          >
            <Navigation className="text-cyan-600 dark:text-cyan-400 mb-4" />

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{exit} Exit</h2>

            <p className="text-slate-500 dark:text-slate-400 mt-3">Estimated evacuation</p>

            <h1 className="text-4xl mt-5 font-bold text-emerald-600 dark:text-emerald-400">18 sec</h1>
          </div>
        ))}
      </div>
    </div>
  );
}
