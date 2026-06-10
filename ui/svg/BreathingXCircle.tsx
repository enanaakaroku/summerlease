"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

type CrossAsciiCircleProps = {
  size?: number;
  cellSize?: number;

  /**
   * 内半径：这个范围内显示 crossS
   */
  innerRadius?: number;

  /**
   * 外半径：这个范围内显示 crossB，超过外半径不显示
   */
  outerRadius?: number;

  crossSUrl?: string;
  crossBUrl?: string;
  crossSColor?: string;
  crossBColor?: string;

  followMouse?: boolean;
  zIndex?: number;
  className?: string;
};

type SymbolItem = {
  id: string;
  href: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
};

export default function CrossAsciiCircle({
  size = 500,
  cellSize = 16,

  innerRadius = 160,
  outerRadius = 200,

  crossSUrl = "/svg/crossS.svg",
  crossBUrl = "/svg/crossB.svg",
  crossSColor = "#cccccc",
  crossBColor = "#cccccc",

  followMouse = true,
  zIndex = 50,
  className = "",
}: CrossAsciiCircleProps) {
  const reactId = useId().replace(/:/g, "");

  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);

  const x = useSpring(mouseX, {
    stiffness: 260,
    damping: 30,
    mass: 0.35,
  });

  const y = useSpring(mouseY, {
    stiffness: 260,
    damping: 30,
    mass: 0.35,
  });

  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    if (!followMouse) return;

    const handlePointerMove = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      setHasMoved(true);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [followMouse, mouseX, mouseY]);

  const symbols = useMemo<SymbolItem[]>(() => {
    const center = size / 2;
    const cols = Math.floor(size / cellSize);
    const rows = Math.floor(size / cellSize);

    const nextSymbols: SymbolItem[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const symbolCenterX = col * cellSize + cellSize / 2;
        const symbolCenterY = row * cellSize + cellSize / 2;

        const dx = symbolCenterX - center;
        const dy = symbolCenterY - center;
        const distance = Math.sqrt(dx * dx + dy * dy);

        /**
         * 超过外径，不显示任何符号
         */
        if (distance > outerRadius) continue;

        const isInner = distance <= innerRadius;

        const href = isInner ? crossSUrl : crossBUrl;
        const color = isInner ? crossSColor : crossBColor;

        /**
         * 你可以在这里分别控制内外符号尺寸
         */
        const symbolSize = isInner ? 14 : 10;

        /**
         * 外边缘透明过渡
         */
        const outerFadeStart = outerRadius * 0.88;
        const isOuterEdge = distance > outerFadeStart;

        // const opacity = isOuterEdge ? 0.22 : 0.33;
        const opacity = 0.22;

        nextSymbols.push({
          id: `${row}-${col}`,
          href,
          x: symbolCenterX - symbolSize / 2,
          y: symbolCenterY - symbolSize / 2,
          size: symbolSize,
          opacity,
          color,
        });
      }
    }

    return nextSymbols;
  }, [
    size,
    cellSize,
    innerRadius,
    outerRadius,
    crossSUrl,
    crossBUrl,
    crossSColor,
    crossBColor,
  ]);

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {symbols.map((symbol) => {
          const maskId = `cross-mask-${reactId}-${symbol.id}`;

          return (
            <mask
              key={maskId}
              id={maskId}
              maskUnits="userSpaceOnUse"
              x={symbol.x}
              y={symbol.y}
              width={symbol.size}
              height={symbol.size}
              style={{ maskType: "alpha" }}
            >
              <image
                href={symbol.href}
                x={symbol.x}
                y={symbol.y}
                width={symbol.size}
                height={symbol.size}
                preserveAspectRatio="xMidYMid meet"
              />
            </mask>
          );
        })}
      </defs>

      {symbols.map((symbol) => {
        const maskId = `cross-mask-${reactId}-${symbol.id}`;

        return (
          <rect
            key={symbol.id}
            x={symbol.x}
            y={symbol.y}
            width={symbol.size}
            height={symbol.size}
            fill={symbol.color}
            opacity={symbol.opacity}
            mask={`url(#${maskId})`}
          />
        );
      })}
    </svg>
  );

  if (!followMouse) {
    return <div className={className}>{svg}</div>;
  }

  return (
    <motion.div
      className={`pointer-events-none fixed left-0 top-0 ${className}`}
      style={{
        x,
        y,
        width: size,
        height: size,
        translateX: "-50%",
        translateY: "-50%",
        opacity: hasMoved ? 1 : 0,
        zIndex,
      }}
    >
      {svg}
    </motion.div>
  );
}
