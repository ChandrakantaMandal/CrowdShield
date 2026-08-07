import {
  Bell,
  ShieldCheck,
  Clock3,
  ChevronDown,
  Menu,
  User,
  LogOut,
  Mail,
  TriangleAlert,
  Users,
  Camera,
  Settings,
} from "lucide-react";
import { useState } from "react";
import useSidebarStore from "../../../store/useSidebarStore";
import useAuthStore from "../../../store/useAuthStore";
import useLogout from "../../auth/hooks/useLogout";
import Modal from "./Modal";
import Toggle from "./Toggle";

const notifications = [
  {
    id: 1,
    icon: TriangleAlert,
    color: "text-red-400",
    title: "High density detected at Exit A",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: Camera,
    color: "text-cyan-400",
    title: "Camera 3 went offline",
    time: "18 min ago",
  },
  {
    id: 3,
    icon: Users,
    color: "text-yellow-400",
    title: "Crowd level above 80% in Zone 2",
    time: "1 hr ago",
  },
];

export default function Topbar() {
  const toggle = useSidebarStore((s) => s.toggle);
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { logout } = useLogout();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pushOn, setPushOn] = useState(true);
  const [emailOn, setEmailOn] = useState(true);

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Admin";
  const email = user?.email || "admin@crowdshield.io";
  const role = profile?.role || "admin";

  return (
    <>
    <header className="sticky top-0 z-20 h-20 bg-slate-100/90 dark:bg-[#0B1220]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 sm:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={toggle}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] transition hover:bg-slate-200 dark:hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-slate-700 dark:text-slate-300" />
        </button>

        <div>
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Security Command Center
          </h1>

          <div className="hidden md:flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>System Online</span>
            </div>

            <span className="text-slate-300 dark:text-white/10">|</span>

            <div className="flex items-center gap-2">
              <Clock3 size={14} />
              {now}
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Status */}
        <div className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] px-4 py-2">
          <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={18} />

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Status</p>

            <p className="text-sm font-medium text-slate-900 dark:text-white">Monitoring Active</p>
          </div>
        </div>

        {/* Notification */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] transition hover:bg-slate-200 dark:hover:bg-white/10"
          aria-label="Open notifications"
        >
          <Bell size={20} className="text-slate-700 dark:text-slate-300" />

          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] px-3 py-2 transition hover:bg-slate-200 dark:hover:bg-white/10"
          aria-label="Open profile"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              name
            )}&background=0f172a&color=fff`}
            alt={name}
            className="h-10 w-10 rounded-full"
          />

          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p>

            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">Security Operator</p>
          </div>

          <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>
    </header>

      {/* Notifications Modal */}
      <Modal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        subtitle="Manage alert preferences"
        icon={<Bell size={20} className="text-cyan-400" />}
      >
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {/* Toggles */}
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Push Notifications
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time alert popups
                </p>
              </div>

              <Toggle
                checked={pushOn}
                onChange={setPushOn}
                label="Push notifications"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Email Alerts</p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Send alerts to {email}
                </p>
              </div>

              <Toggle
                checked={emailOn}
                onChange={setEmailOn}
                label="Email alerts"
              />
            </div>
          </div>

          {/* List */}
          <div className="p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Recent Alerts
            </h3>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5">
                    <n.icon size={18} className={n.color} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-900 dark:text-white">{n.title}</p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Profile"
        subtitle="Account overview"
        icon={<User size={20} className="text-cyan-400" />}
      >
        <div className="p-6">
          {/* Identity */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-8 text-center">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                name
              )}&background=0f172a&color=fff&size=128`}
              alt={name}
              className="h-24 w-24 rounded-full border-4 border-cyan-500/20"
            />

            <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{name}</h3>

            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Mail size={14} />
              {email}
            </p>

            <span className="mt-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
              {role}
            </span>
          </div>

          {/* Details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>

              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white capitalize">
                Security Operator
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Access Level</p>

              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white capitalize">
                {role}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => setProfileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] px-5 py-2.5 text-sm text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <Settings size={16} />
              Edit Settings
            </button>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
