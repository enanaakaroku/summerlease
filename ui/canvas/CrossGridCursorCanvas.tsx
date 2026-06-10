"use client";

import { useEffect, useRef } from "react";

type CrossGridCursorCanvasProps = {
  className?: string;

  crossBUrl?: string;
  crossSUrl?: string;
  crossPUrl?: string;

  /**
   * 每个正方形网格大小
   */
  cellSize?: number;

  /**
   * 鼠标内圈：显示 crossS
   */
  innerRadius?: number;

  /**
   * 鼠标过渡圈：显示 crossP
   */
  outerRadius?: number;

  /**
   * 鼠标基础圈：显示 crossB
   * 超过这个范围不显示任何图案
   */
  baseRadius?: number;

  /**
   * 图案占格子的比例
   * 1 = 填满格子
   * 0.6 = 留出明显 gap
   */
  iconScale?: number;

  /**
   * 是否显示调试圆
   */
  debug?: boolean;

  iconColor?: string;
  baseOpacity?: number;
  innerOpacity?: number;
  transitionOpacity?: number;
};

type MouseState = {
  x: number;
  y: number;
  active: boolean;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));

    image.src = src;
  });
}

export default function CrossGridCursorCanvas({
  className = "",
  crossBUrl = "/svg/crossB.svg",
  crossSUrl = "/svg/crossS.svg",
  crossPUrl = "/svg/crossP.svg",
  cellSize = 24,
  innerRadius = 80,
  outerRadius = 160,
  baseRadius = 260,
  iconScale = 0.62,
  debug = false,

  iconColor = "#333333",
  baseOpacity = 1,
  innerOpacity = 1,
  transitionOpacity = 1,
}: CrossGridCursorCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tintedCacheRef = useRef(new Map<string, HTMLCanvasElement>());

  const imagesRef = useRef<{
    crossB: HTMLImageElement | null;
    crossS: HTMLImageElement | null;
    crossP: HTMLImageElement | null;
  }>({
    crossB: null,
    crossS: null,
    crossP: null,
  });

  const mouseRef = useRef<MouseState>({
    x: 0,
    y: 0,
    active: false,
  });

  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
  });

  // 图片加载绘制
  useEffect(() => {
    let disposed = false;

    tintedCacheRef.current.clear();

    imagesRef.current = {
      crossB: null,
      crossS: null,
      crossP: null,
    };

    Promise.all([
      loadImage(crossBUrl),
      loadImage(crossSUrl),
      loadImage(crossPUrl),
    ])
      .then(([crossB, crossS, crossP]) => {
        if (disposed) return;

        imagesRef.current = {
          crossB,
          crossS,
          crossP,
        };

        requestAnimationFrame(() => {
          requestDraw();

          requestAnimationFrame(() => {
            requestDraw();
          });
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      disposed = true;
    };
  }, [crossBUrl, crossSUrl, crossPUrl]);

  // resize事件绘制
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) return;

    const resizeCanvas = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      sizeRef.current = {
        width: rect.width,
        height: rect.height,
        dpr,
      };

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      requestDraw();
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(wrapper);

    resizeCanvas();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // mouse事件绘制
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();

      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };

      requestDraw();
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      requestDraw();
    };

    wrapper.addEventListener("pointermove", handlePointerMove);
    wrapper.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      wrapper.removeEventListener("pointermove", handlePointerMove);
      wrapper.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  // props变化绘制
  useEffect(() => {
    tintedCacheRef.current.clear();
    requestDraw();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    cellSize,
    innerRadius,
    outerRadius,
    iconScale,
    debug,
    iconColor,
    baseOpacity,
    innerOpacity,
    transitionOpacity,
  ]);

  const requestDraw = () => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  };

  const getTintedIcon = (
    image: HTMLImageElement,
    size: number,
    color: string,
    opacity: number,
    key: string,
    dpr: number,
  ) => {
    const pixelSize = Math.ceil(size * dpr);
    const cacheKey = `${key}-${size}-${color}-${opacity}-${dpr}`;

    const cached = tintedCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const offscreen = document.createElement("canvas");
    offscreen.width = pixelSize;
    offscreen.height = pixelSize;
    offscreen.style.width = `${size}px`;
    offscreen.style.height = `${size}px`;

    const ctx = offscreen.getContext("2d");
    if (!ctx) return offscreen;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(image, 0, 0, size, size);

    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fillRect(0, 0, size, size);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    tintedCacheRef.current.set(cacheKey, offscreen);
    return offscreen;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { crossB, crossS, crossP } = imagesRef.current;
    if (!crossB || !crossS || !crossP) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const { width, height, dpr } = sizeRef.current;
    const mouse = mouseRef.current;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    // context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, width, height);

    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);

    const iconSize = cellSize * iconScale;
    const iconOffset = (cellSize - iconSize) / 2;

    const crossBIcon = getTintedIcon(
      crossB,
      iconSize,
      iconColor,
      baseOpacity,
      "crossB",
      dpr,
    );

    const crossSIcon = getTintedIcon(
      crossS,
      iconSize,
      iconColor,
      innerOpacity,
      "crossS",
      dpr,
    );

    const crossPIcon = getTintedIcon(
      crossP,
      iconSize,
      iconColor,
      transitionOpacity,
      "crossP",
      dpr,
    );

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellX = col * cellSize;
        const cellY = row * cellSize;

        const centerX = cellX + cellSize / 2;
        const centerY = cellY + cellSize / 2;

        /**
         * 鼠标没有进入时，不显示任何图案
         */
        if (!mouse.active) continue;

        const dx = centerX - mouse.x;
        const dy = centerY - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        /**
         * 超出鼠标基础范围，不显示任何图案
         */
        if (distance > baseRadius) continue;

        let icon: HTMLCanvasElement = crossBIcon;

        if (distance <= innerRadius) {
          icon = crossSIcon;
        } else if (distance <= outerRadius) {
          icon = crossPIcon;
        }

        context.drawImage(
          icon,
          cellX + iconOffset,
          cellY + iconOffset,
          iconSize,
          iconSize,
        );
      }
    }

    if (debug && mouse.active) {
      context.save();

      context.strokeStyle = "rgba(255, 255, 255, 0.18)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(mouse.x, mouse.y, baseRadius, 0, Math.PI * 2);
      context.stroke();

      context.strokeStyle = "rgba(255, 255, 255, 0.45)";
      context.beginPath();
      context.arc(mouse.x, mouse.y, innerRadius, 0, Math.PI * 2);
      context.stroke();

      context.strokeStyle = "rgba(255, 255, 255, 0.28)";
      context.beginPath();
      context.arc(mouse.x, mouse.y, outerRadius, 0, Math.PI * 2);
      context.stroke();

      context.restore();
    }
  };

  return (
    <div ref={wrapperRef} className={`relative h-full w-full ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
