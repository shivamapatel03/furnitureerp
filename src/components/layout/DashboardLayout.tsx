"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/logo/logo.png";
import { Menu, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/login") {
      router.push("/login");
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary"></div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Loading Bhurjala ERP...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col print:bg-white min-w-0 transition-colors duration-150">
      {/* Mobile Top App Bar (visible on < lg) */}
      <header className="lg:hidden sticky top-0 z-30 bg-primary text-white px-3.5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 rounded-b-lg shadow-md flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-white hover:bg-white/10 active:bg-white/20 rounded-md transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>
          <Link href="/" className="flex items-center">
            <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
              Bhurjala Furniture
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle variant="header" />
          <Link
            href="/billing/new"
            className="flex items-center gap-1.5 bg-white text-primary hover:bg-gray-50 active:scale-95 text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Bill</span>
          </Link>
        </div>
      </header>

      {/* Sidebar (Desktop fixed 64 (256px) + Mobile Drawer) */}
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Area: uses lg:pl-64 so it perfectly fits viewport without overflow */}
      <div className="flex-1 lg:pl-64 print:pl-0 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto min-w-0 print:p-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
    </div>
  );
}
