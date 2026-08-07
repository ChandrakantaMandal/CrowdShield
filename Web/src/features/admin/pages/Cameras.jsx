import { Camera } from "lucide-react";

export default function Cameras() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold mt-3 ml-5 text-slate-900 dark:text-white">Live Cameras</h1>

        <button className="bg-cyan-500 px-5 py-3 mr-5 mt-3 rounded-xl text-white">Add Camera</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((cam) => (
          <div
            key={cam}
            className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-5"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-slate-900 dark:text-white">Camera {cam}</h2>

              <span className="text-emerald-600 dark:text-emerald-400">● Live</span>
            </div>

            <div className="h-48 md:h-72 rounded-xl bg-black flex items-center justify-center">
              <Camera size={50} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
