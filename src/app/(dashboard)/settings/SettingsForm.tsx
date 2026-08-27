"use client";

import { useState } from "react";
import { saveSettings } from "@/app/actions/settings";
import { Building2, Phone, Mail, MapPin, KeyRound, Ruler, CheckCircle2, X, Sparkles, Loader2 } from "lucide-react";

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveSettings(formData);

    setSaving(false);

    if (result && result.success) {
      setShowSuccessModal(true);
    } else {
      setErrorMsg(result?.error || "Failed to save settings. Please try again.");
    }
  };

  return (
    <div className="relative">
      {/* Success Popup Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Green Animated Badge */}
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1.5">
              Saved Successfully!
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              Your company profile, base rates, and security preferences have been updated across the ERP system.
            </p>

            <button 
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl active:scale-98 transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Security / Secret Code */}
        <div className="p-4 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 space-y-2">
          <label htmlFor="secretAccessCode" className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-slate-100">
            <KeyRound size={15} className="text-primary" /> ERP Secret Access Code (Login PIN)
          </label>
          <input 
            type="text" 
            id="secretAccessCode" 
            name="secretAccessCode" 
            defaultValue={initialSettings.secretAccessCode || "2026"}
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
            defaultValue={initialSettings.companyName}
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
            defaultValue={initialSettings.address} 
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
              defaultValue={initialSettings.phone}
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
              defaultValue={initialSettings.email}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="info@example.com" 
            />
          </div>
        </div>

        {/* Square Feet Rate Setting */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
          <label htmlFor="defaultSqftRate" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
            <Ruler size={14} className="text-primary" /> Default Square Feet Rate (₹ / sqft)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
            <input 
              type="number" 
              id="defaultSqftRate" 
              name="defaultSqftRate" 
              min="0"
              step="any"
              defaultValue={initialSettings.defaultSqftRate || "850"}
              className="w-full pl-8 pr-3.5 py-2.5 text-sm font-semibold border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. 850" 
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">
            Standard base rate used automatically when calculating custom furniture by square feet (sqft) in the billing section.
          </p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
          <label htmlFor="geminiApiKey" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300">
            <span className="p-1 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded">
              <Sparkles size={12} className="inline" />
            </span> Google Gemini API Key (Optional for AI Estimator)
          </label>
          <input 
            type="password" 
            id="geminiApiKey" 
            name="geminiApiKey" 
            defaultValue={initialSettings.geminiApiKey}
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
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark active:scale-98 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
