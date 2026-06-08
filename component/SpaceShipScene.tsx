"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import InteractiveSpaceshipModel from "./InteractiveSatelliteModel";
import CRTPostProcessing from "@/ui/effect/CRTPostProcessing";

type HotspotData = {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
};

const hotspots: HotspotData[] = [
  {
    id: "engine",
    position: [0, -0.55, 0],
    title: "Engine Core",
    description: "主推进引擎区域，负责飞船主要动力输出。",
  },
  {
    id: "cockpit",
    position: [0, 0.75, 0],
    title: "Cockpit",
    description: "驾驶舱与导航系统集中区域。",
  },
  {
    id: "left-wing",
    position: [-1.15, 0, 0],
    title: "polySurfac_3",
    description: "左侧稳定翼，用于姿态控制。",
  },
  {
    id: "right-wing",
    position: [1.15, 0, 0],
    title: "Right Stabilizer",
    description: "右侧稳定翼，用于姿态控制。",
  },
];

export default function SpaceShipScene() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Canvas
        camera={{
          position: [0, 0, 25],
          fov: 45,
        }}
      >
        <color attach="background" args={["#020617"]} />

        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 3, 5]} intensity={2} />

        <group>
          <InteractiveSpaceshipModel />

          {/* {hotspots.map((hotspot) => (
            <Hotspot key={hotspot.id} data={hotspot} />
          ))} */}
        </group>
        <OrbitControls />

        <CRTPostProcessing
          curvature={0.12}
          rgbOffset={0.0025}
          scanlineIntensity={0.16}
          noiseIntensity={0.035}
          vignetteIntensity={0.42}
          tearIntensity={0.008}
        />
      </Canvas>
    </div>
  );
}

function SpaceShipWireframe() {
  return (
    <group>
      {/* 飞船主体：线框锥体 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 1.6, 0.8]}>
        <coneGeometry args={[0.7, 2.2, 4, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>

      {/* 中央舱体 */}
      <mesh scale={[0.55, 0.9, 0.55]}>
        <boxGeometry args={[1, 1.8, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>

      {/* 左翼 */}
      <mesh
        position={[-0.9, 0, 0]}
        rotation={[0, 0, 0.35]}
        scale={[1.2, 0.15, 0.5]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>

      {/* 右翼 */}
      <mesh
        position={[0.9, 0, 0]}
        rotation={[0, 0, -0.35]}
        scale={[1.2, 0.15, 0.5]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
    </group>
  );
}

function Hotspot({ data }: { data: HotspotData }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={data.position}>
      <mesh
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshBasicMaterial color={hovered ? "#38bdf8" : "#ffffff"} />
      </mesh>

      {/* 外圈提示圆 */}
      <mesh>
        <ringGeometry args={[0.09, 0.105, 32]} />
        <meshBasicMaterial
          color={hovered ? "#38bdf8" : "#ffffff"}
          side={THREE.DoubleSide}
          transparent
          opacity={hovered ? 0.95 : 0.45}
        />
      </mesh>

      {hovered && (
        <Html
          center
          distanceFactor={8}
          position={[0.55, 0.35, 0]}
          className="pointer-events-none"
        >
          <div className="w-56 rounded-xl border border-white/20 bg-black/70 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="text-sm font-semibold text-sky-300">
              {data.title}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-white/70">
              {data.description}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function SpaceShipModel() {
  const gltf = useGLTF("/model/Apollo_Soyuz.glb");

  useEffect(() => {
    gltf.scene.traverse((object) => {
      console.log(object.name);
      if (object instanceof THREE.Mesh) {
        object.material = new THREE.MeshBasicMaterial({
          color: "#ffffff",
          wireframe: true,
          transparent: true,
          opacity: 0.85,
        });
      }
    });
  }, [gltf.scene]);

  return (
    <primitive object={gltf.scene} scale={1.4} rotation={[0.2, Math.PI, 0]} />
  );
}
