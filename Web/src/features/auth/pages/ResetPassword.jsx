import { motion } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../../../lib/supabase";

const OTP_LENGTH = 8;

const splitCode = (value) =>
  value.replace(/\D/g, "").slice(0, OTP_LENGTH);

export default function ResetPassword() {
  const navigationRef = useNavigate();
  const location = useLocation();

  const initialEmail =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    "";

  const [email, setEmail] = useState(initialEmail);
  const [hasEmail, setHasEmail] = useState(Boolean(initialEmail));
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(Boolean(initialEmail));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(hasEmail ? "code" : "email");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const sendCode = async (targetEmail) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
    });

    if (error) throw error;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);

      await sendCode(email);

      setSent(true);
      setStep("code");
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError(null);
      setResending(true);

      await sendCode(email);

      setCode("");
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const startCountdown = () => {
    setResendCountdown(60);
    const timer = setInterval(() => {
      setResendCountdown((sec) => {
        if (sec <= 1) {
          clearInterval(timer);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);

      if (code.length !== OTP_LENGTH) {
        throw new Error(`Please enter the ${OTP_LENGTH}-digit code from your email`);
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) throw error;

      setStep("password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassword = async (e) => {
    e.preventDefault();
    try {
      setError(null);

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      setLoading(true);

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => navigationRef("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-slate-100 dark:bg-[#0B1220]">
      <div className="absolute -top-52 -left-52 w-[550px] h-[550px] rounded-full blur-[140px] bg-cyan-500/10 dark:bg-cyan-400/[0.08]" />

      <div className="absolute -bottom-52 -right-52 w-[550px] h-[550px] rounded-full blur-[140px] bg-violet-500/10 dark:bg-violet-400/[0.08]" />

      <div className="absolute inset-0 dark:bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] dark:bg-[size:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827]/90 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex justify-center">
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
            style={{
              background: "linear-gradient(135deg,#22D3EE 0%,#3B82F6 100%)",
            }}
          >
            {done ? (
              <CheckCircle2 className="text-white" size={38} />
            ) : (
              <ShieldCheck className="text-white" size={38} />
            )}
          </motion.div>
        </div>

        <h1 className="text-center text-3xl font-extrabold mt-7 tracking-tight text-slate-900 dark:text-white">
          {done ? "Password Updated" : "Reset Password"}
        </h1>

        {!done && (
          <p className="text-center mt-3 text-slate-500 dark:text-slate-400">
            {step === "email" &&
              "Enter your account email to receive a verification code."}
            {step === "code" &&
              `Enter the ${OTP_LENGTH}-digit code sent to ${email}`}
            {step === "password" &&
              "Create a new password for your account."}
          </p>
        )}

        {/* Progress Dots */}
        {!done && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {["email", "code", "password"].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  (step === "email" && s === "email") ||
                  (step === "code" && (s === "email" || s === "code")) ||
                  step === "password"
                    ? "w-8 bg-cyan-500"
                    : "w-4 bg-slate-200 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
        )}

        {done ? (
          <div className="mt-8">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-4 text-center">
              <CheckCircle2
                className="mx-auto mb-2 text-green-500"
                size={36}
              />

              <p className="text-sm text-green-600 dark:text-green-400">
                Your password has been reset successfully.
                <br />
                You can now log in with your new password.
              </p>
            </div>

            <motion.button
              onClick={goToLogin}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 30px rgba(34,211,238,.25)",
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(90deg,#22D3EE,#3B82F6)",
              }}
            >
              Back to Login
              <ArrowRight size={20} />
            </motion.button>
          </div>
        ) : (
          <div className="mt-8">
            {step === "email" && (
              <form onSubmit={handleSendCode}>
                <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">
                  Email Address
                </label>

                <div className="flex items-center rounded-2xl px-4 py-3 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151F30]">
                  <Mail
                    size={20}
                    className="mr-3 text-cyan-600 dark:text-cyan-400"
                  />

                  <input
                    type="email"
                    required
                    placeholder="admin@crowdshield.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 30px rgba(34,211,238,.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg,#22D3EE,#3B82F6)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Code
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={goToLogin}
                  className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleVerifyCode}>
                <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">
                  Verification Code
                </label>

                <div className="flex items-center rounded-2xl px-4 py-3 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151F30]">
                  <KeyRound
                    size={20}
                    className="mr-3 text-cyan-600 dark:text-cyan-400"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    autoComplete="one-time-code"
                    required
                    placeholder={`${"0".repeat(OTP_LENGTH)}`}
                    value={code}
                    onChange={(e) => setCode(splitCode(e.target.value))}
                    className="w-full bg-transparent outline-none text-slate-900 dark:text-white tracking-[0.3em]"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || code.length !== OTP_LENGTH}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 30px rgba(34,211,238,.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg,#22D3EE,#3B82F6)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>

                <div className="mt-4 text-center text-sm">
                  {sent && (
                    <p className="text-slate-500 dark:text-slate-400 mb-1">
                      Didn't receive the code?
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEmail("");
                      setSent(false);
                      setCode("");
                      setStep("email");
                      setError(null);
                    }}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline mr-4"
                  >
                    Change email
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || resendCountdown > 0}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-50"
                  >
                    {resending
                      ? "Sending..."
                      : resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : "Resend code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={goToLogin}
                  className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handleConfirmPassword}>
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">
                    New Password
                  </label>

                  <div className="flex items-center rounded-2xl px-4 py-3 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151F30]">
                    <Lock
                      size={20}
                      className="mr-3 text-cyan-600 dark:text-cyan-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-slate-500 dark:text-slate-400"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block mb-2 text-sm font-medium text-slate-900 dark:text-white">
                    Confirm Password
                  </label>

                  <div className="flex items-center rounded-2xl px-4 py-3 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#151F30]">
                    <Lock
                      size={20}
                      className="mr-3 text-cyan-600 dark:text-cyan-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 30px rgba(34,211,238,.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg,#22D3EE,#3B82F6)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={goToLogin}
                  className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />

          <span className="mx-4 text-sm text-slate-500 dark:text-slate-400">
            Secure Admin Access
          </span>

          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        </div>

        <div className="text-center text-sm leading-7 text-slate-500 dark:text-slate-400">
          <p>Powered by CrowdGuardian AI</p>

          <p>Real-Time Crowd Intelligence & Safety Platform</p>
        </div>
      </motion.div>
    </div>
  );
}