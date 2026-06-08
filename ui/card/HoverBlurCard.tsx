"use client";

import { useRef } from "react";

export default function HoverBlurCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const layerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const layer = layerRef.current;
    if (!layer) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    layer.style.setProperty("--x", `${x}px`);
    layer.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      <div
        ref={layerRef}
        className="
          pointer-events-none
          absolute inset-0 z-10
          backdrop-blur-[10px]
          mask-[radial-gradient(circle_180px_at_var(--x,50%)_var(--y,50%),transparent_0%,transparent_55%,black_100%)]
          [-webkit-mask-image:radial-gradient(circle_180px_at_var(--x,50%)_var(--y,50%),transparent_0%,transparent_55%,black_100%)]
        "
      />
    </div>
  );
}
