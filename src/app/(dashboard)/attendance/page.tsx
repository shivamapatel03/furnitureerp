import { getEmployees, getAttendance, getMonthlySalary } from "@/app/actions/attendance";
import AttendanceManager from "./AttendanceManager";

export const dynamic = 'force-dynamic';

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dateParam = params.date;
  const targetDate = dateParam ? new Date(dateParam) : new Date();

  const [employees, attendance, salary] = await Promise.all([
    getEmployees(),
    getAttendance(targetDate),
    getMonthlySalary(targetDate.getFullYear(), targetDate.getMonth()),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 print:hidden">Staff Attendance</h1>
        <p className="text-gray-500 dark:text-slate-400 print:hidden">Mark attendance, manage staff, and view salary summaries</p>
      </div>

      <AttendanceManager
        initialEmployees={employees as any}
        initialAttendance={attendance as any}
        initialSalary={salary as any}
        dateStr={targetDate.toISOString()}
      />
    </div>
  );
}
