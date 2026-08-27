import { getSettings } from "@/app/actions/settings";
import SettingsForm from "./SettingsForm";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Company profile, login security & invoice branding</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs p-4 sm:p-6 transition-colors">
        <SettingsForm initialSettings={settings} />
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300">
        💡 Company info saved here will automatically print on all customer invoices.
      </div>
    </div>
  );
}
