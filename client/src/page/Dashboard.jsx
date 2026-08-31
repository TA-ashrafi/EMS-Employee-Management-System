import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  Users,
  Building2,
  Clock,
  CalendarDays,
  CreditCard,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      toast.error(err.response?.data?.error || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleClockInOut = async () => {
    try {
      setClocking(true);
      const res = await API.post("/api/attendance");
      toast.success(res.data.message || "Clock action successful!");
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || "Clocking failed");
    } finally {
      setClocking(false);
    }
  };

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-3.5 py-1 text-xs font-bold text-yellow-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAdmin ? "Administrator Portal" : "Employee Portal"}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Good day, <span className="text-yellow-400">{displayName}</span>! 👋
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-xl">
              {isAdmin
                ? "Here is the summary of your organization's attendance, department stats, and pending leave requests today."
                : "Welcome to your employee dashboard. Check your monthly attendance, leave applications, and latest payslip."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleClockInOut}
              disabled={clocking}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-400/20 hover:from-yellow-300 hover:to-amber-300 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <UserCheck className="h-5 w-5" />
              <span>{clocking ? "Processing..." : "Clock In / Clock Out"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Employees
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.totalEmployee || 0}
                </h3>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" /> Active Staff
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Departments
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.totalDepartments || 0}
                </h3>
                <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Configured Units
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Today's Attendance
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.todayAttendance || 0}
                </h3>
                <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Clocked-in Staff
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pending Leaves
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  <CalendarDays className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.pendingLeaves || 0}
                </h3>
                <span className="mt-1 text-xs font-semibold text-rose-500 dark:text-rose-400">
                  Requires Review
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Month Attendance
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.currentMonthAttendance || 0} <span className="text-lg font-bold text-slate-500 dark:text-slate-400">Days</span>
                </h3>
                <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  This Month
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  My Pending Leaves
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <CalendarDays className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.pendingLeaves || 0}
                </h3>
                <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Awaiting Approval
                </span>
              </div>
            </div>

            <div className="col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Latest Payslip
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {dashboardData?.latestPayslip
                      ? `$${dashboardData.latestPayslip.netSalary || dashboardData.latestPayslip.basicSalary}`
                      : "No Payslip Generated"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    {dashboardData?.latestPayslip
                      ? `For ${dashboardData.latestPayslip.month} ${dashboardData.latestPayslip.year}`
                      : "Check back later for issued payslips"}
                  </p>
                </div>
                <Link
                  to="/payslip"
                  className="flex items-center gap-2 text-xs font-bold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 px-4 py-2.5 rounded-xl border border-yellow-200 dark:border-yellow-800/40"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Quick Shortcuts
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isAdmin && (
            <Link
              to="/employees"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-yellow-400 dark:hover:border-yellow-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-slate-950 transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Employee Directory</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Add, edit or deactivate team members
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-yellow-500 transition-all" />
            </Link>
          )}

          <Link
            to="/attendance"
            className="group flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-yellow-400 dark:hover:border-yellow-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-slate-950 transition-colors">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Attendance Log</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Review check-in history and timesheet
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-yellow-500 transition-all" />
          </Link>

          <Link
            to="/leave"
            className="group flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-yellow-400 dark:hover:border-yellow-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-slate-950 transition-colors">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Leave Portal</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Submit requests or manage pending leaves
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-yellow-500 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
