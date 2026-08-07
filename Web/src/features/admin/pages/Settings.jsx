import { useState } from "react";
import {
  Bell,
  ShieldCheck,
  MapPin,
  Camera,
  Activity,
  Database,
  Monitor,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import Toggle from "../components/Toggle";
import useThemeStore from "../../../store/useThemeStore";

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>

        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>

      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-4 sm:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
          <Icon className="text-cyan-600 dark:text-cyan-400" size={20} />
        </div>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="mt-4 divide-y divide-slate-200 dark:divide-white/5">
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    emailDigest: false,
    sms: true,
  });

  const [detection, setDetection] = useState({
    heatZones: true,
    liveOverlay: true,
    autoZoom: false,
    reidTracking: true,
  });

  const [privacy, setPrivacy] = useState({
    storeFootage: true,
    anonymize: true,
  });

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const themeOptions = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Configure alerts, AI detection, and system preferences.
          </p>
        </div>

        <button className="h-11 px-6 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition">
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <Section icon={Bell} title="Notifications">
          <ToggleRow label="Critical Alerts"
            description="Push notifications for critical crowd incidents"
            checked={notifications.criticalAlerts}
            onChange={(v) =>
              setNotifications((s) => ({ ...s, criticalAlerts: v }))
            }
          />

          <ToggleRow label="Email Digest"
            description="Daily summary of crowd activity"
            checked={notifications.emailDigest}
            onChange={(v) =>
              setNotifications((s) => ({ ...s, emailDigest: v }))
            }
          />

          <ToggleRow label="SMS Alerts"
            description="Emergency SMS for high-risk events"
            checked={notifications.sms}
            onChange={(v) => setNotifications((s) => ({ ...s, sms: v }))}
          />
        </Section>

        <Section icon={Activity} title="AI Detection">
          <ToggleRow label="Heat Zone Detection"
            description="Color-coded density zones on the live map"
            checked={detection.heatZones}
            onChange={(v) => setDetection((s) => ({ ...s, heatZones: v }))}
          />

          <ToggleRow label="Live Overlay"
            description="Real-time detection overlay on camera feeds"
            checked={detection.liveOverlay}
            onChange={(v) => setDetection((s) => ({ ...s, liveOverlay: v }))}
          />

          <ToggleRow label="Auto Zoom"
            description="Automatically zoom into high-risk zones"
            checked={detection.autoZoom}
            onChange={(v) => setDetection((s) => ({ ...s, autoZoom: v }))}
          />

          <ToggleRow label="Re-identification Tracking"
            description="Track individuals across multiple cameras"
            checked={detection.reidTracking}
            onChange={(v) =>
              setDetection((s) => ({ ...s, reidTracking: v }))
            }
          />
        </Section>

        <Section icon={ShieldCheck} title="Privacy & Storage">
          <ToggleRow label="Store Footage"
            description="Keep recorded footage for 30 days"
            checked={privacy.storeFootage}
            onChange={(v) => setPrivacy((s) => ({ ...s, storeFootage: v }))}
          />

          <ToggleRow label="Anonymize Detections"
            description="Blur faces and anonymize person data"
            checked={privacy.anonymize}
            onChange={(v) => setPrivacy((s) => ({ ...s, anonymize: v }))}
          />
        </Section>

        <Section icon={Monitor} title="Appearance">
          <div className="py-4">
            <p className="font-medium text-slate-900 dark:text-white">Theme</p>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choose how CrowdShield looks. System follows your device
              preference.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => {
                const active = theme === value;

                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition ${
                      active
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={20} />

                    <span className="flex items-center gap-1">
                      {active && <Check size={14} />}
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section icon={Database} title="Data & Sources">
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Connected Cameras
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                12 cameras actively streaming
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              Connected
            </span>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-slate-500 dark:text-slate-400" size={18} />

              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Default Venue
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Central Arena · Block B
                </p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition">
              Change
            </button>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Camera className="text-slate-500 dark:text-slate-400" size={18} />

              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Camera Streams
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  1080p · 24 FPS
                </p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition">
              Change
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

