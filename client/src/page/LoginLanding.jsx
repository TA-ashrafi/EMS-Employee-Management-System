import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Zap, Mail, Lock, ShieldCheck, UserCheck, ArrowRight, Sparkles } from "lucide-react";

const LoginLanding = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState("admin"); // 'admin' or 'employee'
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password, roleType);
      toast.success(`Welcome back! Logged in as ${roleType}`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.error || "Invalid login credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Left Decoration Banner */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 p-12 lg:flex overflow-hidden">
        {/* Abstract Pattern overlay */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-yellow-300/20 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 shadow-xl">
            <Zap className="h-7 w-7 text-yellow-400 fill-yellow-400" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-950">
            Lemon<span className="text-white">EMS</span>
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/15 px-4 py-1.5 text-xs font-bold text-slate-950 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Smart Workforce & Payroll Solution</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 leading-tight">
            Manage your team with freshness & simplicity.
          </h1>
          <p className="text-slate-900/80 font-medium text-base leading-relaxed">
            Track attendance, process payroll payslips, and approve leave requests in one unified, vibrant workspace.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-950/10 pt-6 text-xs font-semibold text-slate-900/70">
          <span>&copy; {new Date().getFullYear()} LemonEMS. All rights reserved.</span>
          <span>Enterprise Ready</span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo Header */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 shadow-md">
              <Zap className="h-6 w-6 text-slate-950 fill-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Lemon<span className="text-yellow-400">EMS</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-400 font-medium">
              Choose your role and enter credentials to continue.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900 p-1.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setRoleType("admin")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                roleType === "admin"
                  ? "bg-yellow-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleType("employee")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                roleType === "employee"
                  ? "bg-yellow-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Employee Portal</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleType === "admin" ? "admin@example.com" : "employee@example.com"}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 py-3.5 font-bold text-slate-950 shadow-lg shadow-yellow-400/10 hover:from-yellow-300 hover:to-amber-300 transition-all transform active:scale-98 disabled:opacity-60"
            >
              <span>{submitting ? "Signing in..." : `Sign in as ${roleType === "admin" ? "Admin" : "Employee"}`}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Quick Demo Credentials hint */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300/90 font-medium">
            <p className="font-bold text-yellow-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Quick Access Info:
            </p>
            <p>Admin email & password can be found in environment variables or seeded DB.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
