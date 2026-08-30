"use client";

import { useState, useTransition, useEffect } from "react";
import { markAttendance, createEmployee, updateEmployee, deleteEmployee } from "@/app/actions/attendance";
import { format } from "date-fns";
import { Users, Calendar, IndianRupee, Plus, Edit2, Trash2, Check, X, UserCheck, Save, Printer, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { downloadInvoicePdf } from "@/lib/downloadPdf";

type Employee = { id: string; name: string; position: string | null; mobile: string; dailySalary: number; status: string };
type AttendanceRecord = { employeeId: string; status: string; date: string };
type SalaryRow = {
  employee: Employee;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  markedDays: number;
  fullMonthSalary: number;
  deductionAmount: number;
  earnedSalary: number;
  totalAdvances: number;
  netSalary: number;
};

export default function AttendanceManager({
  initialEmployees,
  initialAttendance,
  initialSalary,
  dateStr,
}: {
  initialEmployees: Employee[];
  initialAttendance: AttendanceRecord[];
  initialSalary: SalaryRow[];
  dateStr: string;
}) {
  const [tab, setTab] = useState<"attendance" | "staff" | "salary">("attendance");
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [selectedDate, setSelectedDate] = useState(dateStr.slice(0, 10));
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setSelectedDate(dateStr.slice(0, 10));
    setAttendance(initialAttendance);
    setEmployees(initialEmployees);
  }, [dateStr, initialAttendance, initialEmployees]);

  // ── Staff form state ──────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", mobile: "", position: "", dailySalary: "" });

  // ── Advance Form State ────────────────────────────────────
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceData, setAdvanceData] = useState({ employeeId: "", amount: "", date: new Date().toISOString().slice(0, 10), description: "" });

  const handleAddAdvance = () => {
    startTransition(async () => {
      const { addStaffPayment } = await import('@/app/actions/attendance');
      await addStaffPayment({
        employeeId: advanceData.employeeId,
        amount: parseFloat(advanceData.amount),
        date: new Date(advanceData.date),
        description: advanceData.description
      });
      setShowAdvanceModal(false);
      setAdvanceData({ employeeId: "", amount: "", date: new Date().toISOString().slice(0, 10), description: "" });
      alert('Advance paid successfully!');
      router.refresh();
    });
  };


  // ── Attendance ────────────────────────────────────────────
  const getStatus = (employeeId: string) =>
    attendance.find(a => a.employeeId === employeeId)?.status ?? null;

  const handleMark = (employeeId: string, status: string) => {
    setAttendance(prev => {
      const existing = prev.find(a => a.employeeId === employeeId);
      if (existing) return prev.map(a => a.employeeId === employeeId ? { ...a, status } : a);
      return [...prev, { employeeId, status, date: selectedDate }];
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const { batchMarkAttendance } = await import('@/app/actions/attendance');
      await batchMarkAttendance({ date: new Date(selectedDate), records: attendance });
      alert('Attendance saved successfully!');
      router.refresh();
    });
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAttendance = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf("daily-attendance-section", `Staff_Attendance_${selectedDate}.pdf`);
    } catch (e) {
      console.error("Attendance download error:", e);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSalary = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf("salary-summary-section", `Salary_Summary_${format(new Date(), 'MMM_yyyy')}.pdf`);
    } catch (e) {
      console.error("Salary download error:", e);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Staff CRUD ────────────────────────────────────────────
  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData({ name: emp.name, mobile: emp.mobile, position: emp.position ?? "", dailySalary: String(emp.dailySalary) });
  };

  const handleCreate = async () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      const newEmp = await createEmployee(fd);
      if (newEmp) {
        setEmployees(prev => [...prev, newEmp as any].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setShowAddForm(false);
      setFormData({ name: "", mobile: "", position: "", dailySalary: "" });
      router.refresh();
    });
  };

  const handleUpdate = async (id: string) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      const updated = await updateEmployee(id, fd);
      if (updated) {
        setEmployees(prev => prev.map(e => e.id === id ? (updated as any) : e));
      }
      setEditingId(null);
      router.refresh();
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? All attendance records will be removed.`)) return;
    setEmployees(prev => prev.filter(e => e.id !== id));
    startTransition(async () => {
      await deleteEmployee(id);
      router.refresh();
    });
  };

  const inputCls = "w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary";

  const tabs = [
    { key: "attendance" as const, label: "Daily Attendance", Icon: Calendar },
    { key: "staff" as const, label: "Staff List", Icon: Users },
    { key: "salary" as const, label: "Salary Summary", Icon: IndianRupee },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Selector */}
      <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-fit overflow-x-auto gap-1 print:hidden">
        {tabs.map(({ key, label, Icon }) => (
          <button 
            key={key} 
            onClick={() => setTab(key)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
              tab === key 
                ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 shadow-xs" 
                : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ── DAILY ATTENDANCE TAB ── */}
      {tab === "attendance" && (
        <div id="daily-attendance-section" className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          {/* Header toolbar */}
          <div className="p-3.5 sm:p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-slate-100 text-sm sm:text-base">
                {format(new Date(selectedDate + "T00:00:00"), 'EEEE, dd MMM yyyy')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Tap buttons to mark attendance</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto print:hidden">
              <input 
                type="date" 
                value={selectedDate} 
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => router.push('?date=' + e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100" 
              />
              <button
                type="button"
                onClick={handleDownloadAttendance}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-60"
                title="Download Attendance PDF"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Saving PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
              >
                <Save size={16} /> Save Attendance
              </button>
            </div>
          </div>

          {/* Mobile Attendance Cards */}
          <div className="block sm:hidden divide-y divide-gray-100 dark:divide-slate-800">
            {employees.map(emp => {
              const cur = getStatus(emp.id);
              const isMarking = markingId === emp.id;
              return (
                <div key={emp.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{emp.name}</h3>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{emp.position || "General Staff"}</p>
                    </div>
                    <span className="text-xs font-extrabold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      ₹{emp.dailySalary}/day
                    </span>
                  </div>

                  {/* Big thumb buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={isMarking}
                      onClick={() => handleMark(emp.id, 'PRESENT')}
                      className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        cur === 'PRESENT'
                          ? 'bg-green-600 text-white shadow-sm ring-2 ring-green-600 ring-offset-1'
                          : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/60'
                      }`}
                    >
                      {cur === 'PRESENT' && <Check size={14} className="stroke-[3]" />}
                      Present
                    </button>

                    <button
                      disabled={isMarking}
                      onClick={() => handleMark(emp.id, 'HALF_DAY')}
                      className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        cur === 'HALF_DAY'
                          ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500 ring-offset-1'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60'
                      }`}
                    >
                      {cur === 'HALF_DAY' && <Check size={14} className="stroke-[3]" />}
                      Half Day
                    </button>

                    <button
                      disabled={isMarking}
                      onClick={() => handleMark(emp.id, 'ABSENT')}
                      className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        cur === 'ABSENT'
                          ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600 ring-offset-1'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60'
                      }`}
                    >
                      {cur === 'ABSENT' && <Check size={14} className="stroke-[3]" />}
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}

            {employees.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                <Users className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-base font-bold text-gray-900 dark:text-slate-100">No staff registered</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">Go to the 'Staff List' tab to add your team members.</p>
                <button
                  onClick={() => setTab("staff")}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl"
                >
                  Go to Staff List
                </button>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-3.5 text-left">Staff Name</th>
                  <th className="px-6 py-3.5 text-left">Role / Position</th>
                  <th className="px-6 py-3.5 text-right">Daily Rate</th>
                  <th className="px-6 py-3.5 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {employees.map(emp => {
                  const cur = getStatus(emp.id);
                  const isMarking = markingId === emp.id;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{emp.name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{emp.position || "—"}</td>
                      <td className="px-6 py-4 text-right text-gray-800 dark:text-slate-200 font-extrabold">₹{emp.dailySalary.toLocaleString()}/day</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={isMarking}
                            onClick={() => handleMark(emp.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              cur === 'PRESENT' 
                                ? 'bg-green-600 text-white shadow-xs' 
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-950/60 hover:text-green-700 dark:hover:text-green-400'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            disabled={isMarking}
                            onClick={() => handleMark(emp.id, 'HALF_DAY')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              cur === 'HALF_DAY' 
                                ? 'bg-amber-500 text-white shadow-xs' 
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-700 dark:hover:text-amber-400'
                            }`}
                          >
                            Half Day
                          </button>
                          <button
                            disabled={isMarking}
                            onClick={() => handleMark(emp.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              cur === 'ABSENT' 
                                ? 'bg-red-600 text-white shadow-xs' 
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-red-400'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                      No staff registered yet. Switch to the Staff List tab to add employees.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── STAFF LIST TAB ── */}
      {tab === "staff" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="p-3.5 sm:p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-slate-100 text-sm sm:text-base">Staff Members ({employees.length})</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Manage carpenters, helpers & workers</p>
            </div>
            <button 
              onClick={() => { setShowAddForm(true); setEditingId(null); }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark active:scale-95 text-white px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <Plus size={16} /> Add Staff
            </button>
          </div>

          {/* Add Staff Form Drawer / Box */}
          {showAddForm && (
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/90 space-y-3">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">New Staff Member</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <input placeholder="Full Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
                <input placeholder="Mobile Number *" type="tel" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className={inputCls} />
                <input placeholder="Role (e.g. Master Carpenter)" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className={inputCls} />
                <input type="number" placeholder="Daily Salary (₹) *" value={formData.dailySalary} onChange={e => setFormData({ ...formData, dailySalary: e.target.value })} className={inputCls} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button 
                  onClick={() => setShowAddForm(false)} 
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <X size={14} className="inline mr-1" />Cancel
                </button>
                <button 
                  onClick={handleCreate} 
                  disabled={isPending || !formData.name || !formData.mobile}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 shadow-xs"
                >
                  <Check size={14} className="inline mr-1" />Save Staff
                </button>
              </div>
            </div>
          )}

          {/* Mobile Staff Cards */}
          <div className="block sm:hidden divide-y divide-gray-100 dark:divide-slate-800">
            {employees.map(emp => (
              <div key={emp.id} className="p-4 space-y-2">
                {editingId === emp.id ? (
                  <div className="space-y-2.5">
                    <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
                    <input placeholder="Mobile" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className={inputCls} />
                    <input placeholder="Position" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className={inputCls} />
                    <input placeholder="Daily Salary" type="number" value={formData.dailySalary} onChange={e => setFormData({ ...formData, dailySalary: e.target.value })} className={inputCls} />
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-lg">Cancel</button>
                      <button onClick={() => handleUpdate(emp.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-lg">Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{emp.name}</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{emp.position || "Staff"}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">{emp.mobile}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-gray-900 dark:text-slate-100 text-sm">₹{emp.dailySalary}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 block">/day</span>
                      </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center border-t border-gray-50 dark:border-slate-800">
                      <span className="text-xs text-gray-400 dark:text-slate-500">Monthly: ₹{(emp.dailySalary * 30).toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => startEdit(emp)} 
                          className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-primary rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id, emp.name)} 
                          className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {employees.length === 0 && (
              <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                No staff members added yet. Tap "Add Staff" above.
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-3.5 text-left">Name</th>
                  <th className="px-6 py-3.5 text-left">Mobile</th>
                  <th className="px-6 py-3.5 text-left">Position</th>
                  <th className="px-6 py-3.5 text-right">Daily Salary</th>
                  <th className="px-6 py-3.5 text-right">Monthly (×30)</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {editingId === emp.id ? (
                      <>
                        <td className="px-4 py-2"><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} /></td>
                        <td className="px-4 py-2"><input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className={inputCls} /></td>
                        <td className="px-4 py-2"><input value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className={inputCls} /></td>
                        <td className="px-4 py-2"><input type="number" value={formData.dailySalary} onChange={e => setFormData({ ...formData, dailySalary: e.target.value })} className={inputCls} /></td>
                        <td className="px-4 py-2 text-right text-gray-500 dark:text-slate-400 text-xs">₹{(parseFloat(formData.dailySalary || "0") * 30).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => handleUpdate(emp.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 rounded"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded ml-1"><X size={16} /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{emp.name}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{emp.mobile}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{emp.position || "—"}</td>
                        <td className="px-6 py-4 text-right font-extrabold text-gray-900 dark:text-slate-100">₹{emp.dailySalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-slate-300 font-semibold">₹{(emp.dailySalary * 30).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => startEdit(emp)} className="p-2 text-gray-400 dark:text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(emp.id, emp.name)} className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">No staff added yet. Click "Add Staff" to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SALARY SUMMARY TAB ── */}
      {tab === "salary" && (
        <div id="salary-summary-section" className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="p-3.5 sm:p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-slate-100 text-sm sm:text-base">Salary Summary — {format(new Date(), 'MMMM yyyy')}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Calculated based on attendance days (30 days basis)</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSalary}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-60 print:hidden"
              title="Download Salary Summary PDF"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving PDF...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Salary Cards */}
          <div className="block sm:hidden divide-y divide-gray-100 dark:divide-slate-800">
            {initialSalary.map(row => (
              <div key={row.employee.id} className="p-4 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{row.employee.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{row.employee.position || "Staff"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 block">Earned Net</span>
                    <span className="text-base font-extrabold text-green-700 dark:text-green-400">₹{row.netSalary?.toLocaleString() ?? row.earnedSalary.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setAdvanceData(prev => ({ ...prev, employeeId: row.employee.id }));
                      setShowAdvanceModal(true);
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold text-primary bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 active:scale-95 transition-all"
                  >
                    + Pay Advance
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-slate-800/80 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 text-[10px] block">Present</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{row.presentDays} d</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 text-[10px] block">Half Day</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{row.halfDays} d</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 text-[10px] block">Absent</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{row.absentDays} d</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 pt-1 border-t border-gray-100 dark:border-slate-800">
                  <span>Base: ₹{row.employee.dailySalary}/day</span>
                  <span>Absent Deduct: <span className="font-semibold text-red-600 dark:text-red-400">-₹{row.deductionAmount.toLocaleString()}</span></span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 pt-1">
                  <span>Earned: ₹{row.earnedSalary.toLocaleString()}</span>
                  <span>Advances Paid: <span className="font-semibold text-amber-600 dark:text-amber-400">-₹{(row.totalAdvances || 0).toLocaleString()}</span></span>
                </div>
              </div>
            ))}
            {initialSalary.length === 0 && (
              <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">No employee data found.</div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-3.5 text-left">Staff Name</th>
                  <th className="px-6 py-3.5 text-right">Daily Rate</th>
                  <th className="px-6 py-3.5 text-center">Present</th>
                  <th className="px-6 py-3.5 text-center">Half Day</th>
                  <th className="px-6 py-3.5 text-center">Absent</th>
                  <th className="px-6 py-3.5 text-right">Deductions</th>
                  <th className="px-6 py-3.5 text-right font-bold text-gray-900 dark:text-slate-100">Earned</th>
                  <th className="px-6 py-3.5 text-right text-amber-600 dark:text-amber-400">Advances Paid</th>
                  <th className="px-6 py-3.5 text-right font-bold text-gray-900 dark:text-slate-100 border-l border-gray-100 dark:border-slate-800">Net Payable</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {initialSalary.map(row => (
                  <tr key={row.employee.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{row.employee.name}</td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-slate-300">₹{row.employee.dailySalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600 dark:text-green-400">{row.presentDays}</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600 dark:text-amber-400">{row.halfDays}</td>
                    <td className="px-6 py-4 text-center font-bold text-red-600 dark:text-red-400">{row.absentDays}</td>
                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-semibold">-₹{row.deductionAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-slate-100">₹{row.earnedSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400 font-semibold">-₹{(row.totalAdvances || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-green-700 dark:text-green-400 text-base border-l border-gray-100 dark:border-slate-800 bg-green-50/30 dark:bg-green-950/20">₹{row.netSalary?.toLocaleString() ?? row.earnedSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setAdvanceData(prev => ({ ...prev, employeeId: row.employee.id }));
                          setShowAdvanceModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors print:hidden"
                      >
                        Add Advance
                      </button>
                    </td>
                  </tr>
                ))}
                {initialSalary.length === 0 && (
                  <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">No staff data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADVANCE PAYMENT MODAL ── */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">Pay Staff Advance</h3>
              <button onClick={() => setShowAdvanceModal(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 p-1 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">Staff Member</label>
                <select 
                  value={advanceData.employeeId}
                  onChange={e => setAdvanceData({ ...advanceData, employeeId: e.target.value })}
                  className={inputCls}
                >
                  <option value="" disabled>Select Staff...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} (₹{e.dailySalary}/d)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">Amount (₹)</label>
                  <input type="number" placeholder="0" value={advanceData.amount} onChange={e => setAdvanceData({ ...advanceData, amount: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">Date</label>
                  <input type="date" value={advanceData.date} onChange={e => setAdvanceData({ ...advanceData, date: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">Note (Optional)</label>
                <input placeholder="e.g. Festival bonus, emergency" value={advanceData.description} onChange={e => setAdvanceData({ ...advanceData, description: e.target.value })} className={inputCls} />
              </div>
              
              <button
                onClick={handleAddAdvance}
                disabled={isPending || !advanceData.employeeId || !advanceData.amount}
                className="w-full mt-2 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg active:scale-95 transition-all shadow-xs disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isPending ? 'Processing...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
