"use client";

import Link from "next/link";
import Image from "next/image";
import logoImg from "@/logo/logo.png";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Box, 
  Briefcase, 
  Hammer, 
  UsersRound, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  X,
  Sparkles
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "AI Estimator", href: "/estimator", icon: Sparkles, isAi: true },
  { name: "Billing", href: "/billing", icon: ReceiptText },
  { name: "Products / Materials", href: "/products", icon: Box },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Material Usage", href: "/material-usage", icon: Hammer },
  { name: "Staff Attendance", href: "/attendance", icon: UsersRound },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3, adminOnly: true },
  { name: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export function Sidebar({ 
  isOpen = false, 
  onClose 
}: { 
  isOpen?: boolean; 
  onClose?: () => void; 
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin);

  // Close drawer on path change
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navigationList = (
    <div className="flex-1 min-h-0 py-3 overflow-y-auto px-3 space-y-1">
      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Main Navigation</p>
      {filteredNav.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              isActive 
                ? "bg-primary/10 text-primary dark:bg-primary/20" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary stroke-[2.2]" : (item as any).isAi ? "text-amber-500" : "text-gray-400 dark:text-slate-400"}`} />
            <span className="truncate flex-1">{item.name}</span>
            {(item as any).isAi && (
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-md shadow-xs tracking-wider">
                AI
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  const userFooter = (
    <div className="p-3.5 border-t border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/90 shrink-0">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold text-sm shrink-0">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{session?.user?.name || "Administrator"}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{session?.user?.role === "ADMIN" ? "Master Admin" : "Staff"}</p>
          </div>
        </div>
        <ThemeToggle variant="sidebar" iconSize={16} />
      </div>
      <button 
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-950/70 dark:text-red-400 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 256px wide, no scroll cutoffs) */}
      <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 z-30 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col justify-between print:hidden">
        {/* Header / Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <Link href="/" className="flex items-center">
            <Image 
              src={logoImg} 
              alt="Bhurjala Furniture" 
              width={100} 
              height={28} 
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain h-7 w-auto dark:brightness-0 dark:invert"
              priority
            />
          </Link>
        </div>
        
        {/* Navigation list */}
        {navigationList}

        {/* User Footer */}
        {userFooter}
      </aside>

      {/* Mobile Drawer (Slide-over with Backdrop) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex print:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
          />
          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col justify-between max-w-xs w-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-2xl z-10 h-full transition-transform animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <Link href="/" className="flex items-center">
                <Image 
                  src={logoImg} 
                  alt="Bhurjala Furniture" 
                  width={100} 
                  height={28} 
                  style={{ width: 'auto', height: 'auto' }}
                  className="object-contain h-7 w-auto dark:brightness-0 dark:invert"
                  priority
                />
              </Link>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {navigationList}

            {userFooter}
          </div>
        </div>
      )}
    </>
  );
}
