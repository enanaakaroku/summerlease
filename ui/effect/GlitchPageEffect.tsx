"use client";

type GlitchPageEffectProps = {
  children: React.ReactNode;
  intensity?: "low" | "medium" | "high";
};

export default function GlitchPageEffect({
  children,
  intensity = "medium",
}: GlitchPageEffectProps) {
  return (
    <div className={`glitch-page glitch-page-${intensity}`}>
      <div className="glitch-content">{children}</div>

      {/* RGB 色差层 */}
      <div className="glitch-rgb glitch-rgb-red" />
      <div className="glitch-rgb glitch-rgb-blue" />

      {/* 扫描线 */}
      <div className="glitch-scanlines" />

      {/* 横向撕裂条 */}
      <div className="glitch-tear glitch-tear-1" />
      <div className="glitch-tear glitch-tear-2" />
    </div>
  );
}
