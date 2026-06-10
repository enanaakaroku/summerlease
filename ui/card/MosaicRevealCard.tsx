"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MosaicCanvasRevealCardProps = {
  children: React.ReactNode;
  className?: string;
  rows?: number;
  cols?: number;
  duration?: number;
  triggerKey?: string | number;

  /**
   * 模拟毛玻璃方块的颜色
   */
  tileColor?: string;

  /**
   * 方块最大透明度
   */
  tileOpacity?: number;

  /**
   * 是否加噪点
   */
  noise?: boolean;
};

type Tile = {
  row: number;
  col: number;
  delay: number;
};

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function MosaicCanvasRevealCard({
  children,
  className = "",
  rows = 18,
  cols = 32,
  duration = 0.8,
  triggerKey,
  tileColor = "#d7d7d7",
  tileOpacity = 0.22,
  noise = true,
}: MosaicCanvasRevealCardProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const [showOverlay, setShowOverlay] = useState(true);

  const tiles = useMemo<Tile[]>(() => {
    return Array.from({ length: rows * cols }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const randomDelay = Math.random() * duration * 0.42;
      const diagonalDelay = ((row + col) / (rows + cols - 2)) * duration * 0.28;

      return {
        row,
        col,
        delay: randomDelay + diagonalDelay,
      };
    });
  }, [rows, cols, duration, triggerKey]);

  const resizeCanvas = () => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) return;

    const rect = wrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(performance.now());
  };

  const drawNoise = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number,
  ) => {
    const dotCount = Math.floor((width * height) / 180);

    ctx.save();
    ctx.globalAlpha = alpha * 0.18;

    for (let i = 0; i < dotCount; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;

      const value = Math.random() > 0.5 ? 255 : 0;

      ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
      ctx.fillRect(px, py, 1, 1);
    }

    ctx.restore();
  };

  const drawFrostedTile = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number,
  ) => {
    ctx.save();

    /**
     * 基础半透明遮罩，模拟“被模糊后亮度统一”的感觉
     */
    ctx.globalAlpha = alpha * tileOpacity;
    ctx.fillStyle = tileColor;
    ctx.fillRect(x, y, width, height);

    /**
     * 再叠一层暗色，让它更像被压平的毛玻璃块
     */
    ctx.globalAlpha = alpha * 0.16;
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, width, height);

    /**
     * 边缘细线，增强格子感
     */
    // ctx.globalAlpha = alpha * 0.18;
    // ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    // ctx.lineWidth = 1;
    // ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

    /**
     * 中心轻微高光，模拟玻璃表面的漫反射
     */
    const gradient = ctx.createRadialGradient(
      x + width * 0.5,
      y + height * 0.5,
      0,
      x + width * 0.5,
      y + height * 0.5,
      Math.max(width, height) * 0.7,
    );

    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.16})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    if (noise) {
      drawNoise(ctx, x, y, width, height, alpha);
    }

    ctx.restore();
  };

  const draw = (now: number) => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = wrapper.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const elapsed = (now - startTimeRef.current) / 1000;

    const tileWidth = width / cols;
    const tileHeight = height / rows;

    let allDone = true;

    for (const tile of tiles) {
      const rawProgress = clamp01((elapsed - tile.delay) / (duration * 0.45));
      const progress = easeOutCubic(rawProgress);

      /**
       * alpha: 1 -> 0
       * 初始显示毛玻璃格子，最后消失
       */
      const alpha = 1 - progress;

      if (alpha > 0.01) {
        allDone = false;
      }

      if (alpha <= 0.01) continue;

      const x = tile.col * tileWidth;
      const y = tile.row * tileHeight;

      drawFrostedTile(
        ctx,
        Math.floor(x),
        Math.floor(y),
        Math.ceil(tileWidth) + 1,
        Math.ceil(tileHeight) + 1,
        alpha,
      );
    }

    if (allDone) {
      setShowOverlay(false);
      return;
    }

    rafRef.current = requestAnimationFrame(draw);
  };

  const startReveal = () => {
    setShowOverlay(true);
    startTimeRef.current = performance.now();

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    rafRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    startReveal();

    const frame = requestAnimationFrame(() => {
      resizeCanvas();
      startReveal();
    });

    return () => {
      cancelAnimationFrame(frame);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [triggerKey, rows, cols, duration, tileColor, tileOpacity, noise]);

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      {children}

      {showOverlay && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-10 block h-full w-full"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
