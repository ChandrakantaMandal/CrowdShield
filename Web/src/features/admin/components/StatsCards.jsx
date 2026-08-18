import {
  Users,
  Camera,
  TriangleAlert,
  DoorOpen,
  TrendingUp,
} from "lucide-react";

import useLiveData from "../../../lib/useLiveData";
import { fetchCrowdMetrics, fetchAlerts } from "../../../lib/api";

export default function StatsCards() {
  const metrics = useLiveData(fetchCrowdMetrics, 2000);
  const riskEvents = useLiveData(() => fetchAlerts(50), 5000);

  const peopleCount = metrics.data?.people_count ?? 0;
  const activeAlerts = (riskEvents.data || []).filter(
    (event) => event.risk_level && event.risk_level !== "SAFE"
  ).length;

  const cards = [
    {
      title: "Active Visitors",
      value: peopleCount.toLocaleString(),
      change: "Live",
      status: "normal",
      icon: Users,
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Online Cameras",
      value: "12 / 12",
      change: "100%",
      status: "normal",
      icon: Camera,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Active Alerts",
      value: String(activeAlerts).padStart(2, "0"),
      change: "Live",
      status: activeAlerts > 0 ? "danger" : "normal",
      icon: TriangleAlert,
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      title: "Emergency Exits",
      value: "05",
      change: "Ready",
      status: "normal",
      icon: DoorOpen,
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111827] p-5 transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-[#151F30]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <Icon size={22} className={card.iconColor} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={15}
                  className={
                    card.status === "danger"
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                />

                <span
                  className={`text-sm font-medium ${
                    card.status === "danger"
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {card.change}
                </span>
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">Last 5 min</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
