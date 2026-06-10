"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const TILE_DURATION = 280;
const MAX_DELAY = 220;

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider",
    );
  }

  return context;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

type Tile = {
  id: number;
  row: number;
  col: number;
  delay: number;
};

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const statusRef = useRef<TransitionStatus>("idle");

  const [status, setStatus] = useState<TransitionStatus>("idle");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const tiles = useMemo<Tile[]>(() => {
    return Array.from({ length: ROWS * COLS }, (_, index) => {
      const row = Math.floor(index / COLS);
      const col = index % COLS;

      const diagonalProgress = (row + col) / (ROWS + COLS - 2);

      return {
        id: index,
        row,
        col,
        delay: diagonalProgress * MAX_DELAY,
      };
    });
  }, []);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(performance.now());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    context.clearRect(0, 0, width, height);
  };

  const drawFrame = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const currentStatus = statusRef.current;

    const width = window.innerWidth;
    const height = window.innerHeight;

    context.clearRect(0, 0, width, height);

    if (currentStatus === "idle") {
      return;
    }

    const elapsed = now - startTimeRef.current;
    const tileWidth = width / COLS;
    const tileHeight = height / ROWS;

    for (const tile of tiles) {
      const delay =
        currentStatus === "exit" ? tile.delay : MAX_DELAY - tile.delay;

      const rawProgress = clamp01((elapsed - delay) / TILE_DURATION);
      const progress = easeOutCubic(rawProgress);

      let alpha = 0;

      if (currentStatus === "exit") {
        /**
         * exit:
         * 透明 -> 半透明 -> 黑
         */
        alpha = progress;
      } else if (currentStatus === "enter") {
        /**
         * enter:
         * 黑 -> 透明
         */
        alpha = 1 - progress;
      }

      if (alpha <= 0) continue;

      const x = tile.col * tileWidth;
      const y = tile.row * tileHeight;

      context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      context.fillRect(
        Math.floor(x),
        Math.floor(y),
        Math.ceil(tileWidth) + 1,
        Math.ceil(tileHeight) + 1,
      );
    }
  };

  const stopAnimation = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const animate = () => {
    stopAnimation();

    const loop = (now: number) => {
      drawFrame(now);

      const currentStatus = statusRef.current;

      if (currentStatus === "idle") {
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const setTransitionStatus = (nextStatus: TransitionStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    startTimeRef.current = performance.now();

    if (nextStatus === "idle") {
      stopAnimation();
      clearCanvas();
      return;
    }

    animate();
  };

  const startTransition = (href: string) => {
    if (href === pathname || isTransitioning) return;

    setIsTransitioning(true);
    setTransitionStatus("exit");

    window.setTimeout(() => {
      router.push(href);
    }, EXIT_DURATION);
  };

  useEffect(() => {
    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (!isTransitioning) return;

    setTransitionStatus("enter");

    const timer = window.setTimeout(() => {
      setTransitionStatus("idle");
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

      <canvas
        ref={canvasRef}
        className="
          pointer-events-none
          fixed inset-0 z-9999
          block
        "
        style={{
          opacity: status === "idle" ? 0 : 1,
        }}
        aria-hidden="true"
      />
    </PageTransitionContext.Provider>
  );
}
