"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "@/logo/logo.png";
import { KeyRound, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the secret code");
      return;
    }

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      code: code.trim(),
    });

    if (res?.error) {
      setError("Invalid secret access code. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/80 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-7 sm:p-9 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-2 bg-gray-50 rounded-2xl border border-gray-100">
            <Image 
              src={logoImg} 
              alt="Bhurjala Furniture" 
              width={160} 
              height={55} 
              className="object-contain max-h-12 w-auto"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-xs font-extrabold text-primary mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure System Access</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ERP Passcode Access
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Enter your secret access code to unlock the ERP
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-xs sm:text-sm border border-red-100 font-medium text-center animate-in fade-in duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Secret Access Code
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <KeyRound size={18} />
              </div>
              <input
                type={showCode ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                placeholder="Enter secret access code"
                className="w-full pl-11 pr-11 py-3 text-sm font-semibold text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all tracking-wide"
                required
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Toggle code visibility"
              >
                {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-primary hover:bg-primary-dark active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-sm sm:text-base mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying Access...
              </span>
            ) : (
              <>
                <span>Unlock ERP</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
