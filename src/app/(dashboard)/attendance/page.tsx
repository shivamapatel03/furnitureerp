import { getEmployees, getAttendance, getMonthlySalary } from "@/app/actions/attendance";
import AttendanceManager from "./AttendanceManager";

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const today = new Date();
  const [employees, attendance, salary] = await Promise.all([
    getEmployees(),
    getAttendance(today),
    getMonthlySalary(today.getFullYear(), today.getMonth()),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Attendance</h1>
        <p className="text-gray-500">Mark attendance, manage staff, and view salary summaries</p>
      </div>

      <AttendanceManager
        initialEmployees={employees as any}
        initialAttendance={attendance as any}
        initialSalary={salary as any}
        dateStr={today.toISOString()}
      />
    </div>
  );
}
