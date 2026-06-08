"use client";

import { useEffect, useRef } from "react";

type HoverTiltShiftGlitchCardProps = {
  children: React.ReactNode;
  className?: string;
  focusSize?: number;
  featherSize?: number;
  defaultFocusX?: number;
  blurClassName?: string;
  blockColor?: string;
  blockCount?: number;
};

type GlitchBlock = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
};

export default function HoverTiltShiftGlitchCard({
  children,
  className = "",
  focusSize = 10,
  featherSize = 18,
  defaultFocusX = 50,
  blurClassName = "backdrop-blur-lg bg-white/5",
  blockColor = "255,255,255",
  blockCount = 18,
}: HoverTiltShiftGlitchCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const blocksRef = useRef<GlitchBlock[]>([]);
  const isMovingRef = useRef(false);
  const moveTimerRef = useRef<number | null>(null);

  const updateCanvasSize = () => {
    const card = cardRef.current;
    const canvas = canvasRef.current;

    if (!card || !canvas) return;

    const rect = card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawnBlocks = () => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    for (let i = 0; i < blockCount; i++) {
      const size = randomBetween(8, 42);
      const life = randomBetween(10, 28);

      blocksRef.current.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size,
        alpha: randomBetween(0.08, 0.28),
        life,
        maxLife: life,
      });
    }

    // 避免数组无限变大
    if (blocksRef.current.length > 120) {
      blocksRef.current = blocksRef.current.slice(-120);
    }
  };

  const drawBlocks = () => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = card.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    blocksRef.current = blocksRef.current
      .map((block) => {
        const progress = 1 - block.life / block.maxLife;
        const fade = Math.sin(progress * Math.PI);

        ctx.fillStyle = `rgba(${blockColor}, ${block.alpha * fade})`;
        ctx.fillRect(block.x, block.y, block.size, block.size);

        return {
          ...block,
          life: block.life - 1,
        };
      })
      .filter((block) => block.life > 0);
  };

  const animate = () => {
    drawBlocks();

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentX = (x / rect.width) * 100;

    card.style.setProperty("--focus-x", `${percentX}%`);

    isMovingRef.current = true;
    spawnBlocks();

    if (moveTimerRef.current) {
      window.clearTimeout(moveTimerRef.current);
    }

    moveTimerRef.current = window.setTimeout(() => {
      isMovingRef.current = false;
    }, 80);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--focus-x", `${defaultFocusX}%`);
  };

  useEffect(() => {
    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);

    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (moveTimerRef.current) {
        window.clearTimeout(moveTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          "--focus-x": `${defaultFocusX}%`,
          "--focus-size": `${focusSize}%`,
          "--feather-size": `${featherSize}%`,
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* 竖向移轴模糊层 */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 ${blurClassName}`}
        style={{
          WebkitMaskImage: `
            linear-gradient(
              to right,
              black 0%,
              black calc(var(--focus-x) - var(--focus-size) - var(--feather-size)),
              transparent calc(var(--focus-x) - var(--focus-size)),
              transparent calc(var(--focus-x) + var(--focus-size)),
              black calc(var(--focus-x) + var(--focus-size) + var(--feather-size)),
              black 100%
            )
          `,
          maskImage: `
            linear-gradient(
              to right,
              black 0%,
              black calc(var(--focus-x) - var(--focus-size) - var(--feather-size)),
              transparent calc(var(--focus-x) - var(--focus-size)),
              transparent calc(var(--focus-x) + var(--focus-size)),
              black calc(var(--focus-x) + var(--focus-size) + var(--feather-size)),
              black 100%
            )
          `,
        }}
      />

      {/* 随机闪烁方块层 */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        style={{
          WebkitMaskImage: `
            linear-gradient(
              to right,
              black 0%,
              black calc(var(--focus-x) - var(--focus-size)),
              transparent calc(var(--focus-x) - var(--focus-size) / 2),
              transparent calc(var(--focus-x) + var(--focus-size) / 2),
              black calc(var(--focus-x) + var(--focus-size)),
              black 100%
            )
          `,
          maskImage: `
            linear-gradient(
              to right,
              black 0%,
              black calc(var(--focus-x) - var(--focus-size)),
              transparent calc(var(--focus-x) - var(--focus-size) / 2),
              transparent calc(var(--focus-x) + var(--focus-size) / 2),
              black calc(var(--focus-x) + var(--focus-size)),
              black 100%
            )
          `,
        }}
      />
    </div>
  );
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
