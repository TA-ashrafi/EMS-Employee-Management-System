import React, { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  Clock,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock3,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

const Attendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState({ isDeleted: false });
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/attendance");
      setAttendanceLogs(res.data.data || []);
      if (res.data.employee) {
        setEmployeeStatus(res.data.employee);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleClockInOut = async () => {
    try {
      setClocking(true);
      const res = await API.post("/api/attendance");
      toast.success(
        res.data.type === "CHECK_IN"
          ? "Successfully Clocked IN!"
          : "Successfully Clocked OUT!"
      );
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.error || "Clocking failed");
    } finally {
      setClocking(false);
    }
  };

  const todayLog = attendanceLogs.find((log) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const logStr = new Date(log.date).toISOString().split("T")[0];
    return todayStr === logStr;
  });

  const presentCount = attendanceLogs.filter(
    (l) => l.status === "PRESENT" || l.status === "LATE"
  ).length;
  const lateCount = attendanceLogs.filter((l) => l.status === "LATE").length;
  const avgHours =
    attendanceLogs.length > 0
      ? (
          attendanceLogs.reduce((acc, curr) => acc + (curr.workingHours || 0), 0) /
          attendanceLogs.length
        ).toFixed(1)
      : "0";

  const filteredLogs = attendanceLogs.filter((log) => {
    if (statusFilter === "ALL") return true;
    return log.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="h-7 w-7 text-yellow-500" /> Attendance Management
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Track daily check-in & check-out logs, working hours, and time logs.
          </p>
        </div>

        <button
          onClick={handleClockInOut}
          disabled={clocking || employeeStatus.isDeleted}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 px-6 py-3.5 text-xs font-extrabold text-slate-950 shadow-md shadow-yellow-400/20 hover:from-yellow-300 hover:to-amber-300 transition-all transform active:scale-95 disabled:opacity-50"
        >
          <UserCheck className="h-4 w-4" />
          <span>
            {clocking
              ? "Updating..."
              : todayLog && !todayLog.checkOut
              ? "Clock Out Now"
              : "Clock In Now"}
          </span>
        </button>
      </div>

      {/* Account Deactivated Warning */}
      {employeeStatus.isDeleted && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>Your account is deactivated. You cannot record attendance.</span>
        </div>
      )}

      {/* Today Clock Status Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
          Today's Punch Status
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Check In Time</p>
            <p className="text-lg font-black text-slate-900 mt-1">
              {todayLog?.checkIn
                ? new Date(todayLog.checkIn).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not Clocked In"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Check Out Time</p>
            <p className="text-lg font-black text-slate-900 mt-1">
              {todayLog?.checkOut
                ? new Date(todayLog.checkOut).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not Clocked Out"}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
            <p className="text-[11px] font-bold text-amber-700 uppercase">Current Status</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></span>
              <p className="text-lg font-black text-slate-900">
                {todayLog?.status || "PENDING"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Present</p>
            <h4 className="text-2xl font-black text-slate-900">{presentCount} Days</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Clock3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Late Arrivals</p>
            <h4 className="text-2xl font-black text-slate-900">{lateCount} Days</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Avg. Daily Hours</p>
            <h4 className="text-2xl font-black text-slate-900">{avgHours} Hours</h4>
          </div>
        </div>
      </div>

      {/* Logs Table Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Attendance Log History</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Logs</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">
            No attendance logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Hours</th>
                  <th className="px-6 py-4">Day Type</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">
                      {log.checkIn
                        ? new Date(log.checkIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">
                      {log.checkOut
                        ? new Date(log.checkOut).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      {log.workingHours ? `${log.workingHours} hrs` : "In Progress"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-600">
                      {log.dayType || "--"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          log.status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.status === "LATE"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
