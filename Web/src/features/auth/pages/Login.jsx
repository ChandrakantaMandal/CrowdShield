import { motion } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

import useLogin from "../hooks/useLogin";

export default function Login() {
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-slate-100 dark:bg-[#0B1220]">
      {/* Background Glow */}
      <div className="absolute -top-52 -left-52 w-[550px] h-[550px] rounded-full blur-[140px] bg-cyan-500/10 dark:bg-cyan-400/[0.08]" />

      <div className="absolute -bottom-52 -right-52 w-[550px] h-[550px] rounded-full blur-[140px] bg-violet-500/10 dark:bg-violet-400/[0.08]" />

      {/* Grid */}
      <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] dark:bg-[size:50px_50px]" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827]/90 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
            style={{
              background: "linear-gradient(135deg,#22D3EE 0%,#3B82F6 100%)",
            }}
          >
            <ShieldCheck className="text-white" size={38} />
          </motion.div>
        </div>

        {/* Title */}
        <h1 className="text-center text-4xl font-extrabold mt-7 tracking-tight text-slate-900 dark:text-white">
          Crowd

          <span
            className="bg-clip-text text-transparent ml-1"
            style={{
              backgroundImage: "linear-gradient(90deg,#22D3EE,#3B82F6,#8B5CF6)",
            }}
          >
            Shield
          </span>
        </h1>

        <p className="text-center mt-3 text-slate-500 dark:text-slate-400">
          AI Powered Crowd Monitoring & Analytics Platform
        </p>

        {/* Email */}
        <div className="mt-8">
          <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">
            Email Address
          </label>

          <div className="flex items-center rounded-2xl px-4 py-3 border transition-all duration-300 focus-within:ring-2 focus-within:ring-cyan-400/30 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151F30]">
            <Mail size={20} className="mr-3 text-cyan-600 dark:text-cyan-400" />

            <input
              type="email"
              placeholder="admin@crowdshield.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-5">
          <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">
            Password
          </label>

          <div className="flex items-center rounded-2xl px-4 py-3 border transition-all duration-300 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151F30]">
            <Lock size={20} className="mr-3 text-cyan-600 dark:text-cyan-400" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="transition text-slate-500 dark:text-slate-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember */}
        <div className="flex justify-between items-center mt-5 text-sm text-slate-500 dark:text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-cyan-500" />
            Remember me
          </label>

          <button
            type="button"
            className="transition hover:opacity-80 text-cyan-600 dark:text-cyan-400"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <motion.button
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 30px rgba(34,211,238,.25)",
          }}
          whileTap={{
            scale: 0.98,
          }}
          disabled={loading}
          onClick={() => login(email, password)}
          className="w-full mt-8 rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2 transition-all"
          style={{
            background: "linear-gradient(90deg,#22D3EE,#3B82F6)",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Signing In...
            </>
          ) : (
            <>
              Login
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />

          <span className="mx-4 text-sm text-slate-500 dark:text-slate-400">
            Secure Admin Access
          </span>

          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Footer */}
        <div className="text-center text-sm leading-7 text-slate-500 dark:text-slate-400">
          <p>Powered by CrowdGuardian AI</p>

          <p>Real-Time Crowd Intelligence & Safety Platform</p>
        </div>
      </motion.div>
    </div>
  );
}
