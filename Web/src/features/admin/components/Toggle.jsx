export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111827] ${
        checked
          ? "border-cyan-500/60 bg-cyan-500"
          : "border-slate-300 dark:border-white/10 bg-slate-200 dark:bg-white/5"
      }`}
    >
      <span
        className={`absolute top-px left-0.5 h-5 w-5 mb-2 rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
