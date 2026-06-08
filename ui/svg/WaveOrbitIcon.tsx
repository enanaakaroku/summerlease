"use client";

import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useMemo, useState } from "react";

type Point = {
  x: number;
  y: number;
};

function makeWaveCirclePath({
  cx = 80,
  cy = 80,
  radius,
  amplitude,
  phase = 0,
  waves = 6,
  points = 32,
}: {
  cx?: number;
  cy?: number;
  radius: number;
  amplitude: number;
  phase?: number;
  waves?: number;
  points?: number;
}) {
  const pts: Point[] = [];

  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    const wave = Math.sin(angle * waves + phase) * amplitude;
    const r = radius + wave;

    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  // Catmull-Rom to Cubic Bezier，闭合曲线
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];

    const cp1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };

    const cp2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };

    d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(
      2,
    )} ${cp2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return `${d} Z`;
}

export default function WaveOrbitIcon() {
  const [isHovered, setIsHovered] = useState(false);

  const outerRotate = useMotionValue(0);
  const innerRotate = useMotionValue(-35);

  const paths = useMemo(() => {
    return {
      outerWave: makeWaveCirclePath({
        radius: 60,
        amplitude: 5,
        phase: 0,
        waves: 6,
        points: 40,
      }),
      outerCircle: makeWaveCirclePath({
        radius: 60,
        amplitude: 0,
        phase: 0,
        waves: 6,
        points: 40,
      }),
      innerWave: makeWaveCirclePath({
        radius: 44,
        amplitude: 4,
        phase: Math.PI * 0.8,
        waves: 5,
        points: 40,
      }),
      innerCircle: makeWaveCirclePath({
        radius: 44,
        amplitude: 0,
        phase: Math.PI * 0.8,
        waves: 5,
        points: 40,
      }),
    };
  }, []);

  useAnimationFrame((_, delta) => {
    if (isHovered) return;

    outerRotate.set(outerRotate.get() - delta * 0.03);
    innerRotate.set(innerRotate.get() - delta * 0.045);
  });

  return (
    <motion.svg
      className="h-20 w-20 cursor-pointer overflow-visible"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* 外层波浪 / 圆 */}
      <motion.g
        style={{
          rotate: outerRotate,
          transformOrigin: "80px 80px",
        }}
      >
        <motion.path
          d={paths.outerWave}
          animate={{
            d: isHovered ? paths.outerCircle : paths.outerWave,
            strokeOpacity: isHovered ? 1 : 0.9,
            strokeWidth: isHovered ? 2.5 : 3,
          }}
          transition={{
            d: {
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            },
            strokeOpacity: {
              duration: 0.3,
            },
            strokeWidth: {
              duration: 0.3,
            },
          }}
          className="fill-none stroke-white"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* 内层波浪 / 圆，错位 */}
      <motion.g
        style={{
          rotate: innerRotate,
          transformOrigin: "80px 80px",
        }}
      >
        <motion.path
          d={paths.innerWave}
          animate={{
            d: isHovered ? paths.innerCircle : paths.innerWave,
            strokeOpacity: isHovered ? 0.85 : 0.6,
            strokeWidth: isHovered ? 2.5 : 3,
          }}
          transition={{
            d: {
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            },
            strokeOpacity: {
              duration: 0.3,
            },
            strokeWidth: {
              duration: 0.3,
            },
          }}
          className="fill-none stroke-white"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* 中心呼吸描边圆：永远不填充 */}
      <motion.circle
        cx="80"
        cy="80"
        r="18"
        fill="none"
        className="stroke-white stroke-[3]"
        animate={
          isHovered
            ? {
                scale: 1,
                opacity: 1,
              }
            : {
                scale: [0.88, 1.08, 0.88],
                opacity: [0.55, 1, 0.55],
              }
        }
        transition={
          isHovered
            ? {
                duration: 0.25,
                ease: "easeOut",
              }
            : {
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        style={{
          transformOrigin: "80px 80px",
        }}
      />

      {/* 中心填充圆：只在 hover 时出现 */}
      <motion.circle
        cx="80"
        cy="80"
        r="18"
        className="fill-white"
        initial={false}
        animate={{
          scale: isHovered ? 1 : 0.88,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        style={{
          transformOrigin: "80px 80px",
        }}
      />
    </motion.svg>
  );
}
