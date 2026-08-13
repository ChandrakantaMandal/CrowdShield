import {
  ShieldCheck,
  LayoutDashboard,
  Map,
  Camera,
  Upload,
  Navigation,
  Bell,
  Settings,
  LogOut,
  Activity,
  ChevronRight,
  X,
} from "lucide-react";
import useLogout from "../../auth/hooks/useLogout";
import useSidebarStore from "../../../store/useSidebarStore";
import { NavLink } from "react-router-dom";
import useLiveData from "../../../lib/useLiveData";
import { fetchCrowdMetrics, fetchRiskEvents, fetchZoneMetrics } from "../../../lib/api";

export default function Sidebar() {
  const close = useSidebarStore((s) => s.close);
  const isOpen = useSidebarStore((s) => s.isOpen);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 h-screen bg-white dark:bg-[#0B1220] border-r border-slate-200 dark:border-white/5 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0B1220] border-r border-slate-200 dark:border-white/5 flex-col transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={close}
          className="absolute right-4 top-6 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <SidebarContent />
      </aside>
    </>
  );
}

function SidebarContent() {
  const { logout } = useLogout();

  const menu = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Map,
      title: "Heatmap",
      path: "/dashboard/heatmap",
    },
    {
      icon: Camera,
      title: "Live Cameras",
      path: "/dashboard/cameras",
    },
    {
      icon: Upload,
      title: "Floor Plans",
      path: "/dashboard/floor-plans",
    },
    {
      icon: Navigation,
      title: "Exit Guidance",
      path: "/dashboard/exit-guidance",
    },
    {
      icon: Bell,
      title: "Alerts",
      path: "/dashboard/alerts",
    },
  ];

  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto">
      {/* Logo */}
      <div className="h-25 px-6 flex items-center border-b border-slate-200 dark:border-white/5 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <ShieldCheck size={22} className="text-cyan-600 dark:text-cyan-400" />
        </div>
    
        <div className="ml-4">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Crowd <span className="text-cyan-600 dark:text-cyan-400">Shield</span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">Security Command Center</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 mt-2">
        <p className="px-3 mb-3 text-xs font-semibold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">
          Overview
        </p>

        <div className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `group flex w-full items-center justify-between rounded-xl border px-4 py-3 ${
                    isActive
                      ? "border-cyan-500/20 bg-cyan-500/10"
                      : "border-transparent hover:bg-slate-100 dark:hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`${
                          isActive
                            ? "text-cyan-600 dark:text-cyan-400"
                            : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                      />

                      <span
                        className={`${
                          isActive
                            ? "font-medium text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    <ChevronRight
                      size={16}
                      className={`${
                        isActive
                          ? "translate-x-1 text-cyan-600 dark:text-cyan-400"
                          : "text-slate-500 dark:text-slate-600 group-hover:translate-x-1"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Analytics */}
      <LiveAnalytics />

      {/* Footer */}
      <div className="p-5 mt-4 border-t border-slate-200 dark:border-white/5 shrink-0">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 rounded-xl border px-4 py-3 ${
              isActive
                ? "border-cyan-500/20 bg-cyan-500/10 text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <button
          onClick={logout}
          className="group mt-3 w-full flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-400 transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
}

const RISK_LEVEL_STYLES = {
  SAFE: "text-emerald-600 dark:text-emerald-400",
  WARNING: "text-yellow-500 dark:text-yellow-400",
  HIGH: "text-orange-500 dark:text-orange-400",
  CRITICAL: "text-red-600 dark:text-red-400",
};

function riskLevelFromMetrics(metrics) {
  let score = 0;
  if (metrics?.density > 0.00005) score += 35;
  if (metrics?.average_speed > 1.5) score += 20;
  if (metrics?.surge_detected) score += 15;
  if (metrics?.bottleneck) score += 10;
  if (metrics?.flow_conflict) score += 10;

  if (score <= 30) return "SAFE";
  if (score <= 60) return "WARNING";
  if (score < 80) return "HIGH";
  return "CRITICAL";
}

function LiveAnalytics() {
  const { data: metrics } = useLiveData(fetchCrowdMetrics, 2000);
  const { data: zoneRows } = useLiveData(fetchZoneMetrics, 2000);
  const { data: riskEvents } = useLiveData(() => fetchRiskEvents(50), 2000);

  const zones = Array.isArray(zoneRows) ? zoneRows : [];
  const liveZones = zones.filter((zone) => (zone.people_count || 0) > 0).length;

  const alerts = Array.isArray(riskEvents) ? riskEvents : [];
  const activeAlerts = alerts.filter((event) => event.risk_level !== "SAFE").length;

  const visitors = metrics?.people_count ?? 0;
  const riskLevel = riskLevelFromMetrics(metrics);

  return (
    <div className="px-5">
      <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#111827] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-cyan-600 dark:text-cyan-400" />

          <span className="font-medium text-slate-900 dark:text-white">Live Analytics</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Visitors</span>

            <span className="font-semibold text-slate-900 dark:text-white">
              {visitors.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Crowd Risk</span>

            <span className={`font-semibold ${RISK_LEVEL_STYLES[riskLevel]}`}>{riskLevel}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Zones Reporting</span>

            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
              {zones.length ? `${liveZones}/${zones.length}` : "—"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Alerts</span>

            <span className="text-red-600 dark:text-red-400 font-semibold">
              {String(activeAlerts).padStart(2, "0")} Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
