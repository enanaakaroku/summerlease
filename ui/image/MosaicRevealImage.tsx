"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MosaicRevealImageProps = {
  src: string;
  alt?: string;
  className?: string;
  imageClassName?: string;

  rows?: number;
  cols?: number;
  duration?: number;
  triggerKey?: string | number;

  /**
   * 模糊强度，越大越糊
   */
  blur?: number;

  /**
   * 模糊层上叠加的颜色，用来模拟毛玻璃压暗/提亮
   */
  overlayColor?: string;

  /**
   * 颜色遮罩透明度
   */
  overlayOpacity?: number;

  /**
   * 是否加轻微噪点
   */
  noise?: boolean;

  /**
   * 图片填充方式
   */
  objectFit?: "cover" | "contain";
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

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));

    /**
     * 如果图片来自 public 本地路径，一般没问题。
     * 如果是远程图，服务端需要允许 CORS，否则 canvas 会被污染。
     */
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

/**
 * 模拟 object-fit: cover / contain 后的图片绘制区域
 */
function getImageDrawRect(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  objectFit: "cover" | "contain",
) {
  const imageRatio = imageWidth / imageHeight;
  const containerRatio = containerWidth / containerHeight;

  let drawWidth = containerWidth;
  let drawHeight = containerHeight;

  if (objectFit === "cover") {
    if (imageRatio > containerRatio) {
      drawHeight = containerHeight;
      drawWidth = containerHeight * imageRatio;
    } else {
      drawWidth = containerWidth;
      drawHeight = containerWidth / imageRatio;
    }
  } else {
    if (imageRatio > containerRatio) {
      drawWidth = containerWidth;
      drawHeight = containerWidth / imageRatio;
    } else {
      drawHeight = containerHeight;
      drawWidth = containerHeight * imageRatio;
    }
  }

  const drawX = (containerWidth - drawWidth) / 2;
  const drawY = (containerHeight - drawHeight) / 2;

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  };
}

export default function MosaicRevealImage({
  src,
  alt = "",
  className = "",
  imageClassName = "",

  rows = 18,
  cols = 32,
  duration = 0.8,
  triggerKey,

  blur = 14,
  overlayColor = "#000000",
  overlayOpacity = 0.16,
  noise = true,
  objectFit = "cover",
}: MosaicRevealImageProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const blurredCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const [showOverlay, setShowOverlay] = useState(true);

  const tiles = useMemo<Tile[]>(() => {
    return Array.from({ length: rows * cols }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const randomDelay = Math.random() * duration * 0.45;
      const diagonalDelay = ((row + col) / (rows + cols - 2)) * duration * 0.28;

      return {
        row,
        col,
        delay: randomDelay + diagonalDelay,
      };
    });
  }, [rows, cols, duration, triggerKey, src]);

  const stopAnimation = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const createBlurredCanvas = () => {
    const wrapper = wrapperRef.current;
    const image = imageRef.current;

    if (!wrapper || !image) return;

    const rect = wrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const width = rect.width;
    const height = rect.height;

    const offscreen = document.createElement("canvas");
    offscreen.width = Math.floor(width * dpr);
    offscreen.height = Math.floor(height * dpr);

    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const drawRect = getImageDrawRect(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      objectFit,
    );

    /**
     * 关键：这里是真正把图片模糊后画进 canvas
     */
    ctx.save();
    ctx.filter = `blur(${blur}px)`;

    /**
     * 为了避免 blur 边缘出现透明空隙，稍微把绘制区域放大一点
     */
    const expand = blur * 2;

    ctx.drawImage(
      image,
      drawRect.x - expand,
      drawRect.y - expand,
      drawRect.width + expand * 2,
      drawRect.height + expand * 2,
    );

    ctx.restore();

    /**
     * 叠加一层颜色，模拟毛玻璃的压暗/提亮
     */
    ctx.save();
    ctx.globalAlpha = overlayOpacity;
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    blurredCanvasRef.current = offscreen;
  };

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

    createBlurredCanvas();
  };

  const drawNoise = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number,
  ) => {
    const dotCount = Math.floor((width * height) / 260);

    ctx.save();
    ctx.globalAlpha = alpha * 0.12;

    for (let i = 0; i < dotCount; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;
      const value = Math.random() > 0.5 ? 255 : 0;

      ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
      ctx.fillRect(px, py, 1, 1);
    }

    ctx.restore();
  };

  const draw = (now: number) => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const blurredCanvas = blurredCanvasRef.current;

    if (!wrapper || !canvas || !blurredCanvas) return;

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
       * 初始显示模糊图片格子，最后消失露出清晰图片
       */
      const alpha = 1 - progress;

      if (alpha > 0.01) {
        allDone = false;
      }

      if (alpha <= 0.01) continue;

      const x = tile.col * tileWidth;
      const y = tile.row * tileHeight;

      const sx = x;
      const sy = y;
      const sw = tileWidth;
      const sh = tileHeight;

      ctx.save();
      ctx.globalAlpha = alpha;

      /**
       * 从模糊版图片里裁切同位置的格子，画到当前 canvas
       * 这就是“图片专用 backdrop-blur”的核心
       */
      ctx.drawImage(
        blurredCanvas,
        sx,
        sy,
        sw,
        sh,
        Math.floor(x),
        Math.floor(y),
        Math.ceil(tileWidth) + 1,
        Math.ceil(tileHeight) + 1,
      );

      ctx.restore();

      if (noise) {
        drawNoise(
          ctx,
          Math.floor(x),
          Math.floor(y),
          Math.ceil(tileWidth) + 1,
          Math.ceil(tileHeight) + 1,
          alpha,
        );
      }
    }

    if (allDone) {
      setShowOverlay(false);
      stopAnimation();
      return;
    }

    rafRef.current = requestAnimationFrame(draw);
  };

  const startReveal = () => {
    setShowOverlay(true);
    startTimeRef.current = performance.now();

    stopAnimation();
    rafRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    let disposed = false;

    setShowOverlay(true);
    stopAnimation();

    loadImage(src)
      .then((image) => {
        if (disposed) return;

        imageRef.current = image;

        requestAnimationFrame(() => {
          resizeCanvas();
          createBlurredCanvas();
          startReveal();
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      disposed = true;
      stopAnimation();
    };
  }, [src, triggerKey]);

  useEffect(() => {
    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();

      if (showOverlay) {
        startReveal();
      }
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      stopAnimation();
    };
  }, []);

  useEffect(() => {
    createBlurredCanvas();
    startReveal();

    return () => {
      stopAnimation();
    };
  }, [
    rows,
    cols,
    duration,
    blur,
    overlayColor,
    overlayOpacity,
    noise,
    objectFit,
  ]);

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`block h-full w-full ${
          objectFit === "cover" ? "object-cover" : "object-contain"
        } ${imageClassName}`}
      />

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
