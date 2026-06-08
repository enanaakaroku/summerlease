"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

type TransitionStatus = "idle" | "exit" | "enter";

type PageTransitionContextValue = {
  startTransition: (href: string) => void;
  isTransitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

const ROWS = 9;
const COLS = 16;
const EXIT_DURATION = 500;
const ENTER_DURATION = 500;

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider",
    );
  }

  return context;
}

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<TransitionStatus>("idle");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const tiles = useMemo(() => {
    return Array.from({ length: ROWS * COLS }, (_, index) => {
      const row = Math.floor(index / COLS);
      const col = index % COLS;

      const diagonalProgress = (row + col) / (ROWS + COLS - 2);

      return {
        id: index,
        row,
        col,
        delay: diagonalProgress * 0.22,
      };
    });
  }, []);

  const startTransition = (href: string) => {
    if (href === pathname || isTransitioning) return;

    setIsTransitioning(true);
    setStatus("exit");

    window.setTimeout(() => {
      router.push(href);
    }, EXIT_DURATION);
  };

  useEffect(() => {
    if (!isTransitioning) return;

    setStatus("enter");

    const timer = window.setTimeout(() => {
      setStatus("idle");
      setIsTransitioning(false);
    }, ENTER_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <PageTransitionContext.Provider
      value={{
        startTransition,
        isTransitioning,
      }}
    >
      {children}

      <div
        className="
          pointer-events-none
          fixed inset-0 z-[9999]
          grid
          grid-cols-16
        "
        style={{
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        }}
        aria-hidden="true"
      >
        {tiles.map((tile) => {
          const isExit = status === "exit";
          const isEnter = status === "enter";
          const isIdle = status === "idle";

          return (
            <motion.div
              key={tile.id}
              className="backdrop-blur-md"
              initial={false}
              animate={
                isIdle
                  ? {
                      opacity: 0,
                      backgroundColor: "rgba(0, 0, 0, 0)",
                      backdropFilter: "blur(0px)",
                    }
                  : isExit
                    ? {
                        opacity: [0, 1, 1],
                        backgroundColor: [
                          "rgba(0, 0, 0, 0)",
                          "rgba(0, 0, 0, 0.35)",
                          "rgba(0, 0, 0, 1)",
                        ],
                        backdropFilter: [
                          "blur(0px)",
                          "blur(14px)",
                          "blur(14px)",
                        ],
                      }
                    : isEnter
                      ? {
                          opacity: [1, 1, 0],
                          backgroundColor: [
                            "rgba(0, 0, 0, 1)",
                            "rgba(0, 0, 0, 0.35)",
                            "rgba(0, 0, 0, 0)",
                          ],
                          backdropFilter: [
                            "blur(14px)",
                            "blur(14px)",
                            "blur(0px)",
                          ],
                        }
                      : {}
              }
              transition={{
                duration: 0.28,
                delay: isExit ? tile.delay : 0.22 - tile.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </div>
    </PageTransitionContext.Provider>
  );
}
