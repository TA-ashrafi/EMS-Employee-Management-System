import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  FileText,
  Printer,
  Plus,
  X,
  Zap,
  CheckCircle2,
} from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PrintPayslip = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Admin Generate Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    allowances: "0",
    deductions: "0",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/payslip");
      setPayslips(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch payslips");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try {
      const res = await API.get("/api/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employees for payslip generation", err);
    }
  };

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, [user]);

  const handleSelectEmployeeForGen = (empId) => {
    const emp = employees.find((e) => e.id === empId || e._id === empId);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        employeeId: empId,
        basicSalary: emp.basicSalary || 50000,
        allowances: emp.allowances || 5000,
        deductions: emp.deductions || 2000,
      }));
    } else {
      setFormData((prev) => ({ ...prev, employeeId: empId }));
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.basicSalary) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/api/payslip", formData);
      toast.success("Payslip generated successfully!");
      setIsGenerateModalOpen(false);
      fetchPayslips();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate payslip");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-Printable UI Wrapper */}
      <div className="print:hidden space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-7 w-7 text-yellow-500" /> Payroll & Payslips
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {isAdmin
                ? "Generate and review official salary payslips for all organization members."
                : "View and print your monthly compensation payslips."}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (employees.length > 0) {
                  handleSelectEmployeeForGen(employees[0].id || employees[0]._id);
                }
                setIsGenerateModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 px-5 py-3 text-xs font-bold text-slate-950 shadow-md hover:from-yellow-300 hover:to-amber-300 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Generate New Payslip</span>
            </button>
          )}
        </div>

        {/* Payslips Table / Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
          </div>
        ) : payslips.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
            <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">No Payslips Issued Yet</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {isAdmin
                ? "Click 'Generate New Payslip' to create your first monthly payroll record."
                : "Your issued payslips will appear here once generated by HR."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {isAdmin && <th className="px-6 py-4">Employee</th>}
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Basic Salary</th>
                    <th className="px-6 py-4">Allowances</th>
                    <th className="px-6 py-4">Deductions</th>
                    <th className="px-6 py-4">Net Salary</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payslips.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition-colors">
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 font-bold text-slate-900">
                              {item.employee?.firstName?.charAt(0) || "E"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {item.employee
                                  ? `${item.employee.firstName} ${item.employee.lastName || ""}`
                                  : "Employee"}
                              </p>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {item.employee?.department || "Staff"}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {MONTHS[item.month - 1]} {item.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300">
                        ${item.basicSalary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-emerald-600 dark:text-emerald-400">
                        +${item.allowances?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-rose-500 dark:text-rose-400">
                        -${item.deductions?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-black text-slate-900 dark:text-white text-sm">
                        ${(item.netSalary || item.basicSalary)?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedPayslip(item)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-yellow-400 px-3.5 py-2 text-xs font-bold text-yellow-400 dark:text-slate-950 shadow-xs hover:bg-slate-800 dark:hover:bg-yellow-300 transition-colors cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" /> View Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payslip View Modal & Printable Document */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-10 shadow-2xl space-y-6 print:shadow-none print:max-w-none print:p-0">
            {/* Action Bar (Hidden when printing) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Official Compensation Statement
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-yellow-300 shadow-xs cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print / PDF
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Container (Always white background for standard printing) */}
            <div id="printable-payslip" className="space-y-6 bg-white p-2 text-slate-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950 font-black text-xl">
                    <Zap className="h-7 w-7 fill-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      Lemon<span className="text-amber-500">EMS</span> Inc.
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      100 Enterprise Way, Suite 400 • HR & Payroll Dept.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-800">
                    PAYSLIP
                  </h3>
                  <p className="text-xs font-extrabold text-amber-600 mt-0.5">
                    {MONTHS[selectedPayslip.month - 1]} {selectedPayslip.year}
                  </p>
                </div>
              </div>

              {/* Employee Info Block */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Employee Details</p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {selectedPayslip.employee
                      ? `${selectedPayslip.employee.firstName} ${selectedPayslip.employee.lastName || ""}`
                      : "Staff Member"}
                  </p>
                  <p className="font-semibold text-slate-600 mt-0.5">
                    Email: {selectedPayslip.employee?.email || "N/A"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Department / Role</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedPayslip.employee?.department || "General"}
                  </p>
                  <p className="font-semibold text-slate-600 mt-0.5">
                    Position: {selectedPayslip.employee?.position || "Staff"}
                  </p>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs font-medium text-slate-700">
                  <thead className="bg-slate-900 text-yellow-400 text-[11px] font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Earnings & Deductions Description</th>
                      <th className="px-6 py-3 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-3.5 font-bold text-slate-900">Basic Monthly Salary</td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-900">
                        ${selectedPayslip.basicSalary?.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 font-medium text-slate-600">Standard Allowances (HRA, Transport)</td>
                      <td className="px-6 py-3.5 text-right font-bold text-emerald-600">
                        +${(selectedPayslip.allowances || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 font-medium text-slate-600">Tax & Provident Deductions</td>
                      <td className="px-6 py-3.5 text-right font-bold text-rose-500">
                        -${(selectedPayslip.deductions || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-amber-50/80 border-t-2 border-slate-200">
                    <tr>
                      <td className="px-6 py-4 font-black text-slate-900 text-sm">TOTAL NET PAYOUT</td>
                      <td className="px-6 py-4 text-right font-black text-slate-950 text-base">
                        ${(selectedPayslip.netSalary || selectedPayslip.basicSalary)?.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Stamp */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                <p>This is a computer-generated document. Signature is not required.</p>
                <div className="flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Verified & Approved
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Generate Payslip Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Generate Payslip</h2>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Select Employee
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => handleSelectEmployeeForGen(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-bold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-bold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Basic Salary ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Allowances ($)
                  </label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Deductions ($)
                  </label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center">
                <span>Calculated Net Pay:</span>
                <span className="text-base text-amber-700 dark:text-amber-400 font-black">
                  $
                  {(
                    Number(formData.basicSalary || 0) +
                    Number(formData.allowances || 0) -
                    Number(formData.deductions || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-yellow-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-yellow-300 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Generating..." : "Generate & Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintPayslip;
