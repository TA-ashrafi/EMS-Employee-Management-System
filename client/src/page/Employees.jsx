import React, { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  X,
  Building,
  LayoutGrid,
  List,
} from "lucide-react";

const DEPARTMENTS = [
  "All",
  "Engineering",
  "Human Resources",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "IT Support",
  "Customer Service",
  "Product Management",
  "Design",
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "Engineering",
    basicSalary: "",
    allowances: "",
    deductions: "",
    joinDate: new Date().toISOString().split("T")[0],
    password: "",
    role: "EMPLOYEE",
    bio: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const url =
        selectedDepartment === "All"
          ? "/api/employees"
          : `/api/employees?department=${encodeURIComponent(selectedDepartment)}`;
      const res = await API.get(url);
      setEmployees(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedDepartment]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: "Engineering",
      basicSalary: "50000",
      allowances: "5000",
      deductions: "2000",
      joinDate: new Date().toISOString().split("T")[0],
      password: "",
      role: "EMPLOYEE",
      bio: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      email: emp.email || "",
      phone: emp.phone || "",
      position: emp.position || "",
      department: emp.department || "Engineering",
      basicSalary: emp.basicSalary || "",
      allowances: emp.allowances || "",
      deductions: emp.deductions || "",
      joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().split("T")[0] : "",
      password: "",
      role: emp.userId?.role || "EMPLOYEE",
      bio: emp.bio || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingEmployee) {
        await API.put(`/api/employees/${editingEmployee.id}`, formData);
        toast.success("Employee updated successfully");
      } else {
        await API.post("/api/employees", formData);
        toast.success("Employee created successfully");
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      await API.delete(`/api/employees/${empId}`);
      toast.success("Employee deactivated");
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete employee");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const position = (emp.position || "").toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || email.includes(query) || position.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-yellow-500" /> Employee Directory
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Manage Lemon Media Company members, roles, details, and compensation.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-md hover:from-yellow-300 hover:to-amber-300 transition-all transform active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter, Search & View Switcher Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or title..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-yellow-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-yellow-400 focus:outline-none"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} Department
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle Switch (Cards vs Table) */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-yellow-400 text-slate-950 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-yellow-400 text-slate-950 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering (Cards or Table) */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
          <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">No Employees Found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search query or department filter.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        /* Cards View Mode */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-xl hover:border-yellow-400 dark:hover:border-yellow-400 transition-all duration-300 group flex flex-col justify-between space-y-5"
            >
              {/* Card Header & Avatar */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 font-black text-slate-950 text-2xl border-2 border-yellow-200 shadow-md">
                      {emp.firstName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        emp.isDeleted ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                      emp.isDeleted
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}
                  >
                    {emp.isDeleted ? "Inactive" : "Active"}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <p className="text-xs font-bold text-amber-600 dark:text-yellow-400 mt-1">
                    {emp.position || "Team Member"}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Building className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Details & Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Basic Salary:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    ${emp.basicSalary?.toLocaleString() || 0} / mo
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-yellow-400 hover:text-slate-950 dark:hover:bg-yellow-400 dark:hover:text-slate-950 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="flex items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-colors"
                    title="Deactivate Employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View Mode */
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 uppercase tracking-wider text-[11px] font-extrabold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department & Role</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Basic Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 font-black text-slate-950">
                          {emp.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Joined {new Date(emp.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          <Building className="h-3 w-3" /> {emp.department}
                        </span>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-1">
                          {emp.position || "Employee"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1 text-[11px]">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                          <Mail className="h-3.5 w-3.5 text-slate-400" /> {emp.email}
                        </p>
                        {emp.phone && (
                          <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Phone className="h-3.5 w-3.5 text-slate-400" /> {emp.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      ${emp.basicSalary?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.isDeleted ? (
                        <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="rounded-lg p-2 text-slate-500 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-slate-800 hover:text-slate-900 transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-600 transition-colors"
                          title="Deactivate Employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {editingEmployee ? "Edit Employee Information" : "Add New Employee"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  >
                    {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Position Title
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Senior Video Editor"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  {editingEmployee ? "New Password (Leave blank to keep unchanged)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingEmployee}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-yellow-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingEmployee ? "Update Employee" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
