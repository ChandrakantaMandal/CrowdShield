import { TriangleAlert, ShieldCheck, Clock3, ArrowRight } from "lucide-react";

const alerts = [
  {
    zone: "Stage Area",
    level: "Critical",
    people: 324,
    confidence: "99%",
    time: "2 sec ago",
    color: "bg-red-500",
    border: "border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    action: "Open Exit B",
  },
  {
    zone: "Main Hall",
    level: "Warning",
    people: 187,
    confidence: "96%",
    time: "18 sec ago",
    color: "bg-yellow-500",
    border: "border-yellow-500/30",
    text: "text-yellow-600 dark:text-yellow-400",
    action: "Monitor Area",
  },
  {
    zone: "North Gate",
    level: "Normal",
    people: 42,
    confidence: "98%",
    time: "1 min ago",
    color: "bg-emerald-500",
    border: "border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    action: "No Action",
  },
];

export default function Alerts() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <TriangleAlert className="text-red-600 dark:text-red-400" size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Live Alerts</h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time crowd safety monitoring
            </p>
          </div>
        </div>

        <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs text-red-600 dark:text-red-400">
          3 Active
        </span>
      </div>

      {/* Alerts */}
      <div className="p-5 space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.zone}
            className={`rounded-2xl border ${alert.border} bg-slate-50 dark:bg-white/[0.03] p-5 transition hover:bg-slate-100 dark:hover:bg-white/[0.05]`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{alert.zone}</h3>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${alert.color}`}
                  >
                    {alert.level}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
                  <span>👥 {alert.people} People</span>

                  <span>🎯 {alert.confidence} Confidence</span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 justify-end">
                  <Clock3 size={14} />

                  {alert.time}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className={alert.text} />

                <span className={alert.text}>{alert.action}</span>
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition">
                View Zone
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
