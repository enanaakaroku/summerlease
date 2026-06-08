"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { motion } from "motion/react";

type HoverTargetingReticleCardProps<T = any> = {
  children?: React.ReactNode;
  className?: string;
  onActiveValueChange?: (value: T) => void;
};

type HoverTargetingReticleCardItemProps<T = any> = {
  children?: React.ReactNode;
  className?: string;
  activeValue?: T;
};

type MousePoint = {
  x: number;
  y: number;
};

type TargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type HoverTargetingReticleCardContextValue = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  setTargetRect: (rect: TargetRect | null) => void;
  onActiveValueChange: (value: string | null) => void;
};

const CORNER_SIZE = 14;
const CURSOR_BOX_SIZE = 36;

const HoverTargetingReticleCardContext =
  createContext<HoverTargetingReticleCardContextValue | null>(null);

export function HoverTargetingReticleCard({
  children,
  className = "",
  onActiveValueChange = () => {},
}: HoverTargetingReticleCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [mouse, setMouse] = useState<MousePoint | null>(null);
  const [isMouseIn, setIsMouseIn] = useState(false);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMouse({ x, y });
    setIsMouseIn(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseIn) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMouse({ x, y });
  };

  const handleMouseLeave = () => {
    setIsMouseIn(false);
    setMouse(null);
  };

  const getCornerPositions = () => {
    if (!mouse) return null;
    if (targetRect) {
      const GAP = 8;

      return {
        tl: { x: targetRect.x - GAP, y: targetRect.y - GAP },
        tr: {
          x: targetRect.x + targetRect.width + GAP - CORNER_SIZE,
          y: targetRect.y - GAP,
        },
        bl: {
          x: targetRect.x - GAP,
          y: targetRect.y + targetRect.height - GAP,
        },
        br: {
          x: targetRect.x + targetRect.width + GAP - CORNER_SIZE,
          y: targetRect.y + targetRect.height - GAP,
        },
      };
    }

    const left = mouse.x - CURSOR_BOX_SIZE / 2;
    const top = mouse.y - CURSOR_BOX_SIZE / 2;

    return {
      tl: { x: left, y: top },
      tr: { x: left + CURSOR_BOX_SIZE - CORNER_SIZE, y: top },
      bl: { x: left, y: top + CURSOR_BOX_SIZE - CORNER_SIZE },
      br: {
        x: left + CURSOR_BOX_SIZE - CORNER_SIZE,
        y: top + CURSOR_BOX_SIZE - CORNER_SIZE,
      },
    };
  };

  const positions = getCornerPositions();

  return (
    <HoverTargetingReticleCardContext.Provider
      value={{
        cardRef,
        setTargetRect,
        onActiveValueChange,
      }}
    >
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={` relative aspect-square cursor-[url('/crosshair.svg')_10_10,crosshair] bg-zinc-950 ${className}`}
      >
        {positions && (
          <>
            <ReticleCorner position={positions.tl} type="tl"></ReticleCorner>
            <ReticleCorner position={positions.tr} type="tr"></ReticleCorner>
            <ReticleCorner position={positions.bl} type="bl"></ReticleCorner>
            <ReticleCorner position={positions.br} type="br"></ReticleCorner>
          </>
        )}

        {children}
      </div>
    </HoverTargetingReticleCardContext.Provider>
  );
}

function getCornerClass(type: "tl" | "tr" | "bl" | "br") {
  const base = "h-full w-full border-white";

  switch (type) {
    case "tl":
      return `${base} border-l-1 border-t-1`;
    case "tr":
      return `${base} border-r-1 border-t-1`;
    case "bl":
      return `${base} border-l-1 border-b-1`;
    case "br":
      return `${base} border-r-1 border-b-1`;
  }
}

function ReticleCorner({
  position,
  type,
}: {
  position: MousePoint;
  type: "tl" | "tr" | "bl" | "br";
}) {
  return (
    <motion.div
      className="pointer-events-none fixed z-50 h-3.5 w-3.5"
      initial={false}
      animate={{
        x: position.x,
        y: position.y,
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 36,
        mass: 0.5,
      }}
    >
      <div className={getCornerClass(type)} />
    </motion.div>
  );
}

export function HoverTargetingReticleCardItem({
  children,
  className = "",
  activeValue = null,
}: HoverTargetingReticleCardItemProps) {
  const context = useContext(HoverTargetingReticleCardContext);
  const itemRef = useRef<HTMLDivElement | null>(null);

  if (!context) {
    throw new Error(
      "HoverTargetingReticleCardItem must be used inside HoverTargetingReticleCard",
    );
  }
  const { cardRef, setTargetRect, onActiveValueChange } = context;

  const handleMouseEnter = () => {
    const cardEl = cardRef.current;
    const itemEl = itemRef.current;

    if (!cardEl || !itemEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    setTargetRect({
      x: itemRect.left - cardRect.left,
      y: itemRect.top - cardRect.top,
      width: itemRect.width,
      height: itemRect.height,
    });

    onActiveValueChange(activeValue);
  };

  const handleMouseLeave = () => {
    setTargetRect(null);
    onActiveValueChange(null);
  };

  return (
    <div
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className}`}
    >
      {children}
    </div>
  );
}
