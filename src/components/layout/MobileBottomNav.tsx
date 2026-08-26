"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ReceiptText, 
  PlusCircle, 
  Box, 
  UsersRound, 
  Menu
} from "lucide-react";

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Bills", href: "/billing", icon: ReceiptText },
    { name: "Products", href: "/products", icon: Box },
    { name: "Staff", href: "/attendance", icon: UsersRound },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 px-2 py-1.5 shadow-lg safe-area-inset-bottom print:hidden transition-colors duration-150"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[56px] active:scale-95 ${
                isActive 
                  ? "text-primary font-bold" 
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-primary stroke-[2.5]" : "text-gray-500 dark:text-slate-400"}`} />
              <span className="text-[11px] leading-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* Full Menu / More Drawer Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-all min-w-[56px] active:scale-95"
          aria-label="Open all navigation items"
        >
          <Menu className="w-5 h-5 mb-0.5 text-gray-500 dark:text-slate-400" />
          <span className="text-[11px] leading-tight font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
