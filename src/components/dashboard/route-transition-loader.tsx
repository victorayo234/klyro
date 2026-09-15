"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KlyroGlyph } from "@/components/ui/logo";

interface RouteTransitionContextType {
  isNavigating: boolean;
  startTransition: (targetPath?: string) => void;
}

const RouteTransitionContext = React.createContext<RouteTransitionContextType>({
  isNavigating: false,
  startTransition: () => {},
});

export const useRouteTransition = () => React.useContext(RouteTransitionContext);

function NavigationWatcher({ onNavigated }: { onNavigated: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    onNavigated();
  }, [pathname, searchParams, onNavigated]);

  return null;
}

export function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const targetPathRef = React.useRef<string | null>(null);

  const handleNavigated = React.useCallback(() => {
    setIsNavigating(false);
    targetPathRef.current = null;
  }, []);

  const startTransition = React.useCallback(
    (targetPath?: string) => {
      if (targetPath && targetPath === pathname) return;
      targetPathRef.current = targetPath || null;
      setIsNavigating(true);

      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 4000);
      return () => clearTimeout(timer);
    },
    [pathname]
  );

  return (
    <RouteTransitionContext.Provider value={{ isNavigating, startTransition }}>
      <React.Suspense fallback={null}>
        <NavigationWatcher onNavigated={handleNavigated} />
      </React.Suspense>
      {children}

      <AnimatePresence>
        {isNavigating && (
          <motion.div
            key="route-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/70 backdrop-blur-xs pointer-events-none select-none"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl"
            >
              {/* Sleek Animated K Logomark */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                    opacity: [0.95, 1, 0.95],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <KlyroGlyph size={36} />
                </motion.div>
              </div>

              {/* Slim Indeterminate Progress Line */}
              <div className="w-24 h-0.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                <motion.div
                  className="absolute inset-y-0 w-12 bg-indigo-600 rounded-full"
                  animate={{
                    x: [-24, 96],
                  }}
                  transition={{
                    duration: 0.85,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RouteTransitionContext.Provider>
  );
}
