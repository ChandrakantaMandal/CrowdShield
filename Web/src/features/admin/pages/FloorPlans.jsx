import { Upload } from "lucide-react";

export default function FloorPlans() {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Floor Plans</h1>

      <p className="text-slate-500 dark:text-slate-400 mt-2">
        Upload event layouts and AI will detect zones automatically.
      </p>

      <div className="mt-10 border-2 border-dashed border-cyan-400/30 rounded-3xl p-10 sm:p-20 text-center">
        <Upload size={60} className="mx-auto text-cyan-600 dark:text-cyan-400" />

        <h2 className="mt-5 text-xl text-slate-900 dark:text-white">Drag & Drop Floor Plan</h2>

        <button className="mt-8 bg-cyan-500 px-6 py-3 rounded-xl text-white">
          Upload Map
        </button>
      </div>
    </div>
  );
}
