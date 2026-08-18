import {
  TriangleAlert,
  ShieldCheck,
  Clock3,
  MapPin,
  Siren,
} from "lucide-react";

import useLiveData from "../../../lib/useLiveData";
import { fetchAlerts, formatTime } from "../../../lib/api";

export default function Alerts() {
  const { data: events } = useLiveData(() => fetchAlerts(50), 5000);

  const alerts = (events || []).map((event, index) => {
    const level = event.risk_level || "SAFE";

    return {
      id: event.id || event.created_at || index,
      zone: event.zone_id || "Unknown Zone",
      level:
        level === "CRITICAL"
          ? "Critical"
          : level === "HIGH"
          ? "High"
          : level === "WARNING"
          ? "Warning"
          : "Safe",
      message: event.message || "No details provided.",
      time: event.created_at ? formatTime(event.created_at) : "—",
    };
  });

  const critical = alerts.filter((a) => a.level === "Critical").length;
  const warnings = alerts.filter((a) => a.level === "Warning" || a.level === "High").length;
  const safe = alerts.filter((a) => a.level === "Safe").length;

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Alert Center
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor crowd incidents and AI-generated warnings in real time.
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Siren className="text-red-600 dark:text-red-400" size={32} />
        </div>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6">
          <p className="text-slate-500 dark:text-slate-400">Critical Alerts</p>

          <h2 className="text-4xl font-bold text-red-600 dark:text-red-400 mt-2">
            {String(critical).padStart(2, "0")}
          </h2>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6">
          <p className="text-slate-500 dark:text-slate-400">Warnings</p>

          <h2 className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {String(warnings).padStart(2, "0")}
          </h2>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-6">
          <p className="text-slate-500 dark:text-slate-400">Safe Zones</p>

          <h2 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {String(safe).padStart(2, "0")}
          </h2>
        </div>
      </div>

      {/* Alert List */}

      <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 overflow-hidden">

        <div className="flex flex-wrap justify-between items-center gap-4 px-4 sm:px-8 py-6 border-b border-slate-200 dark:border-white/5">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Live Incident Feed
          </h2>

          <span className="text-sm text-cyan-600 dark:text-cyan-400">
            Updating every 2 sec
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/5">

          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 sm:px-8 py-6 hover:bg-slate-50 dark:hover:bg-[#151F30] transition"
            >
              <div className="flex gap-5">

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center
                  ${
                    alert.level === "Critical"
                      ? "bg-red-500/15"
                      : alert.level === "High"
                      ? "bg-orange-500/15"
                      : alert.level === "Warning"
                      ? "bg-yellow-500/15"
                      : "bg-emerald-500/15"
                  }`}
                >
                  <TriangleAlert
                    className={
                    alert.level === "Critical"
                      ? "text-red-600 dark:text-red-400"
                      : alert.level === "High"
                      ? "text-orange-600 dark:text-orange-400"
                      : alert.level === "Warning"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-emerald-600 dark:text-emerald-400"
                    }
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    {alert.zone}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-5 mt-3 text-sm text-slate-500 dark:text-slate-400">

                    <div className="flex items-center gap-2">
                      <MapPin size={15} />
                      {alert.zone}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={15} />
                      {alert.time}
                    </div>

                  </div>
                </div>
              </div>

              <div>
                <span
                  className={`px-5 py-2 rounded-full text-sm font-semibold
                  ${
                    alert.level === "Critical"
                      ? "bg-red-500/15 text-red-600 dark:text-red-400"
                      : alert.level === "High"
                      ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                      : alert.level === "Warning"
                      ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {alert.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}

      <div className="rounded-3xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

        <div className="flex items-center gap-4">
          <ShieldCheck className="text-cyan-600 dark:text-cyan-400" size={32} />

          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
              AI Monitoring Active
            </h3>

            <p className="text-slate-500 dark:text-slate-400">
              CrowdGuardian is continuously monitoring all camera feeds.
            </p>
          </div>
        </div>

        <button className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition font-semibold text-white">
          Refresh Alerts
        </button>
      </div>
    </div>
  );
}