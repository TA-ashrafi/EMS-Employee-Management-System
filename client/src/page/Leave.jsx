import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Filter,
  Check,
  Ban,
} from "lucide-react";

const Leave = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal State for Applying Leave
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "PAID",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const url =
        isAdmin && filterStatus !== "ALL"
          ? `/api/leave?status=${filterStatus}`
          : "/api/leave";
      const res = await API.get(url);
      setLeaves(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please complete all leave form fields");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/api/leave", formData);
      toast.success("Leave application submitted successfully!");
      setIsModalOpen(false);
      setFormData({
        type: "PAID",
        startDate: "",
        endDate: "",
        reason: "",
      });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      await API.patch(`/api/leave/${leaveId}`, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update leave status");
    }
  };

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-yellow-500" /> Leave Management
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {isAdmin
              ? "Review and respond to employee leave applications."
              : "Apply for leave and track the approval status of your applications."}
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 px-5 py-3 text-xs font-bold text-slate-950 shadow-md hover:from-yellow-300 hover:to-amber-300 transition-all transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Admin Status Filter Toolbar */}
      {isAdmin && (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <Filter className="h-4 w-4 text-slate-400 ml-2" />
          <span className="text-xs font-bold text-slate-600">Filter Status:</span>
          <div className="flex items-center gap-1.5 ml-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                  filterStatus === st
                    ? "bg-slate-900 text-yellow-400 shadow-xs"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leave Applications Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-slate-800">No Leave Applications Found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {isAdmin
              ? "There are currently no leave applications under this status filter."
              : "You haven't submitted any leave requests yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  {isAdmin && <th className="px-6 py-4">Employee</th>}
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((item) => (
                  <tr key={item.id || item._id} className="hover:bg-amber-50/30 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 font-bold text-slate-900">
                            {item.employee?.firstName?.charAt(0) || "E"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.employee
                                ? `${item.employee.firstName} ${item.employee.lastName || ""}`
                                : "Employee"}
                            </p>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.employee?.department || "Department"}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-800">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">
                          {new Date(item.startDate).toLocaleDateString()} &rarr;{" "}
                          {new Date(item.endDate).toLocaleDateString()}
                        </p>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Applied: {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-700">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                          item.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status === "APPROVED" && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {item.status === "REJECTED" && <XCircle className="h-3.5 w-3.5" />}
                        {item.status === "PENDING" && <Clock className="h-3.5 w-3.5" />}
                        {item.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {item.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(item.id || item._id, "APPROVED")}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id || item._id, "REJECTED")}
                              className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">Handled</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">Leave Application</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Leave Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-bold focus:border-yellow-400 focus:outline-none"
                >
                  <option value="PAID">Paid Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    min={tomorrowStr}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.startDate || tomorrowStr}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please specify why you are taking leave..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-yellow-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
