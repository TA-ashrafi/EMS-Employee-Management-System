import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  Zap,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";

const Layout = () => {
  const { user, profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clocking, setClocking] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleQuickClockInOut = async () => {
    try {
      setClocking(true);
      const res = await API.post("/api/attendance");
      toast.success(res.data.message || "Clock status updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to clock in/out");
    } finally {
      setClocking(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard Overview";
    if (path.includes("employees")) return "Employee Directory";
    if (path.includes("attendance")) return "Attendance Tracker";
    if (path.includes("leave")) return "Leave Management";
    if (path.includes("payslip")) return "Payroll & Payslips";
    if (path.includes("settings")) return "System & Profile Settings";
    return "EMS Portal";
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ...(user?.role === "ADMIN"
      ? [{ name: "Employees", path: "/employees", icon: Users }]
      : []),
    { name: "Attendance", path: "/attendance", icon: Clock },
    { name: "Leave", path: "/leave", icon: Calendar },
    { name: "Payslips", path: "/payslip", icon: FileText },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 font-bold text-slate-950 shadow-md shadow-yellow-500/20">
                <Zap className="h-6 w-6 fill-slate-950 stroke-slate-950" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                  Lemon<span className="text-yellow-400">EMS</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">
                  HR Management
                </p>
              </div>
            </div>
            <button
              className="text-slate-400 hover:text-white md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-400 text-slate-950 font-semibold shadow-md shadow-yellow-400/20"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? "text-slate-950" : "text-yellow-400/80 group-hover:text-yellow-400"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-slate-950" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout in Sidebar Bottom */}
        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-800/60 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-400 font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-yellow-400/90 font-medium">
                <ShieldCheck className="h-3 w-3" />
                {user?.role === "ADMIN" ? "Administrator" : "Employee"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-rose-600/20 hover:border-rose-500/30 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              {getPageTitle()}
            </h2>
          </div>

          {/* Quick Actions & Profile Header info */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleQuickClockInOut}
              disabled={clocking}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs hover:from-yellow-300 hover:to-amber-300 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              <span>{clocking ? "Processing..." : "Clock In / Out"}</span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{user?.email}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 font-bold text-slate-900 border-2 border-yellow-200 shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
