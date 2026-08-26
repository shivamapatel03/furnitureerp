"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle({ 
  className, 
  iconSize = 18,
  variant = "default"
}: { 
  className?: string; 
  iconSize?: number;
  variant?: "default" | "header" | "sidebar";
}) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={className || "p-2 rounded-lg"}
        style={{ width: iconSize + 16, height: iconSize + 16 }}
      />
    );
  }

  const defaultClasses = variant === "sidebar"
    ? "p-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 transition-all flex items-center justify-center border border-gray-200/80 dark:border-slate-700"
    : "p-2 rounded-lg text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={className || defaultClasses}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun size={iconSize} className="text-amber-400 dark:text-amber-300 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={iconSize} className={variant === "header" ? "text-white" : "text-gray-700 dark:text-slate-300 transition-transform duration-200"} />
      )}
    </button>
  );
}
