import { getSettings, saveSettings } from "@/app/actions/settings";
import { Building2, Phone, Mail, MapPin, KeyRound } from "lucide-react";

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
        <form action={saveSettings} className="space-y-4 sm:space-y-6">
          {/* Security / Secret Code */}
          <div className="p-4 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 space-y-2">
            <label htmlFor="secretAccessCode" className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-slate-100">
              <KeyRound size={15} className="text-primary" /> ERP Secret Access Code (Login PIN)
            </label>
            <input 
              type="text" 
              id="secretAccessCode" 
              name="secretAccessCode" 
              defaultValue={settings.secretAccessCode || "2026"}
              className="w-full px-3.5 py-2.5 text-sm font-bold tracking-wider text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. 2026" 
            />
            <p className="text-[11px] text-gray-500 dark:text-slate-400">
              This secret passcode is used to log into the ERP without entering an email address.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="companyName" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
              <Building2 size={14} className="text-gray-400 dark:text-slate-500" /> Company Name
            </label>
            <input 
              type="text" 
              id="companyName" 
              name="companyName" 
              defaultValue={settings.companyName}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Bhurjala Furniture" 
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
              <MapPin size={14} className="text-gray-400 dark:text-slate-500" /> Company Address
            </label>
            <textarea 
              id="address" 
              name="address" 
              defaultValue={settings.address} 
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="Full shop / factory address" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
                <Phone size={14} className="text-gray-400 dark:text-slate-500" /> Phone Number
              </label>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                defaultValue={settings.phone}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="+91 98765 43210" 
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
                <Mail size={14} className="text-gray-400 dark:text-slate-500" /> Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                defaultValue={settings.email}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                placeholder="info@example.com" 
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
            <label htmlFor="geminiApiKey" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
              <span className="p-1 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded">✨</span> Google Gemini API Key (Optional for AI Estimator)
            </label>
            <input 
              type="password" 
              id="geminiApiKey" 
              name="geminiApiKey" 
              defaultValue={settings.geminiApiKey}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none font-mono"
              placeholder="AIzaSy..." 
            />
            <p className="text-[11px] text-gray-400 dark:text-slate-500">
              Leave empty to use built-in smart algorithmic calculation engine. Provide your key for personalized AI recommendations.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark active:scale-98 rounded-lg transition-all shadow-sm"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300">
        💡 Company info saved here will automatically print on all customer invoices.
      </div>
    </div>
  );
}
