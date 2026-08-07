import { Flame } from "lucide-react";

export default function Heatmap() {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-4 sm:p-8">
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Crowd Heatmap</h1>

          <p className="text-slate-500 dark:text-slate-400 mt-2">
            AI generated crowd density visualization.
          </p>
        </div>

        <Flame className="text-cyan-600 dark:text-cyan-400" size={34} />
      </div>

      <div className="h-[400px] md:h-[650px] rounded-2xl border border-dashed border-cyan-400/30 flex items-center justify-center text-slate-500 dark:text-slate-400">
        HEATMAP HERE
      </div>
    </div>
  );
}
