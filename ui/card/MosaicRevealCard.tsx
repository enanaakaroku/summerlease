"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type MosaicShaderRevealCardProps = {
  children: React.ReactNode;
  className?: string;
  rows?: number;
  cols?: number;
  duration?: number;
  coverColor?: string;
  triggerKey?: string | number;
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;

  uniform float uProgress;
  uniform vec2 uGrid;
  uniform vec3 uColor;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    if (uProgress >= 0.999) {
        discard;
    }

    vec2 cell = floor(vUv * uGrid);
    float rand = random(cell);

    /*
      uProgress: 0 -> 1
      rand 小于 progress 的格子会逐渐透明
    */
    float edge = 0.035;
    float alpha = smoothstep(uProgress - edge, uProgress + edge, rand);

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function MosaicShaderPlane({
  rows,
  cols,
  duration,
  coverColor,
  triggerKey,
}: {
  rows: number;
  cols: number;
  duration: number;
  coverColor: string;
  triggerKey?: string | number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const startTimeRef = useRef(0);

  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uGrid: { value: new THREE.Vector2(cols, rows) },
      uColor: { value: new THREE.Color(coverColor) },
    }),
    [cols, rows, coverColor],
  );

  useEffect(() => {
    startTimeRef.current = performance.now();

    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = 0;
      materialRef.current.uniforms.uGrid.value.set(cols, rows);
      materialRef.current.uniforms.uColor.value.set(coverColor);
    }
  }, [triggerKey, cols, rows, coverColor]);

  useFrame(() => {
    if (!materialRef.current) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    materialRef.current.uniforms.uProgress.value = progress;
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function MosaicShaderRevealCard({
  children,
  className = "",
  rows = 18,
  cols = 32,
  duration = 0.8,
  coverColor = "#000000",
  triggerKey,
}: MosaicShaderRevealCardProps) {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    setShowOverlay(true);

    const timer = window.setTimeout(
      () => {
        setShowOverlay(false);
      },
      duration * 1000 + 120,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [triggerKey, duration]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}

      {showOverlay && (
        <div className="pointer-events-none absolute inset-0 z-10">
          <Canvas
            orthographic
            gl={{
              alpha: true,
              antialias: false,
            }}
            camera={{
              position: [0, 0, 1],
              zoom: 100,
            }}
          >
            <MosaicShaderPlane
              rows={rows}
              cols={cols}
              duration={duration}
              coverColor={coverColor}
              triggerKey={triggerKey}
            />
          </Canvas>
        </div>
      )}
    </div>
  );
}
