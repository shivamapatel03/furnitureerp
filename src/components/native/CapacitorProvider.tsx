"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    let cleanupBackListener: (() => void) | undefined;

    async function initCapacitor() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        
        if (!Capacitor.isNativePlatform()) {
          return;
        }

        // Hide splash screen after Next.js hydration
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();

        // Android Hardware Back Button listener
        const { App } = await import("@capacitor/app");
        const backListener = await App.addListener("backButton", ({ canGoBack }) => {
          if (pathname === "/" || pathname === "/login") {
            App.exitApp();
          } else if (canGoBack) {
            router.back();
          } else {
            router.push("/");
          }
        });

        cleanupBackListener = () => {
          backListener.remove();
        };
      } catch (err) {
        console.warn("Capacitor native integration initialized in web mode:", err);
      }
    }

    initCapacitor();

    return () => {
      if (cleanupBackListener) {
        cleanupBackListener();
      }
    };
  }, [pathname, router]);

  // Sync Native Status Bar with Web Theme
  useEffect(() => {
    async function syncStatusBar() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        if (theme === "dark") {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: "#0f172a" });
        } else {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: "#DC4041" });
        }
      } catch {
        // Fallback for web
      }
    }

    syncStatusBar();
  }, [theme]);

  return <>{children}</>;
}
