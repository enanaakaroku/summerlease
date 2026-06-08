"use client";

import { useRef } from "react";

type HoverTiltShiftCardProps = {
  children: React.ReactNode;
  className?: string;
  focusSize?: number;
  featherSize?: number;
  blurClassName?: string;
  defaultFocusY?: number;
};

export default function HoverTiltShiftCard({
  children,
  className = "",
  focusSize = 10,
  featherSize = 18,
  blurClassName = "backdrop-blur-md",
  defaultFocusY = 50,
}: HoverTiltShiftCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percentY = (y / rect.height) * 100;

    card.style.setProperty("--focus-y", `${percentY}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--focus-y", `${defaultFocusY}%`);
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          "--focus-y": `${defaultFocusY}%`,
          "--focus-size": `${focusSize}%`,
          "--feather-size": `${featherSize}%`,
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <div
        className={`pointer-events-none absolute inset-0 z-10 ${blurClassName}`}
        style={{
          WebkitMaskImage: `
            linear-gradient(
              to bottom,
              black 0%,
              black calc(var(--focus-y) - var(--focus-size) - var(--feather-size)),
              transparent calc(var(--focus-y) - var(--focus-size)),
              transparent calc(var(--focus-y) + var(--focus-size)),
              black calc(var(--focus-y) + var(--focus-size) + var(--feather-size)),
              black 100%
            )
          `,
          maskImage: `
            linear-gradient(
              to bottom,
              black 0%,
              black calc(var(--focus-y) - var(--focus-size) - var(--feather-size)),
              transparent calc(var(--focus-y) - var(--focus-size)),
              transparent calc(var(--focus-y) + var(--focus-size)),
              black calc(var(--focus-y) + var(--focus-size) + var(--feather-size)),
              black 100%
            )
          `,
        }}
      />
    </div>
  );
}
