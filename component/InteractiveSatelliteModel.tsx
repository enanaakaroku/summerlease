"use client";

import { Html, useGLTF } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type PartInfo = {
  title: string;
  description: string;
};

const partInfoMap: Record<string, PartInfo> = {
  polySurfac_1: {
    title: "polySurfac_1",
    description: "to be continue...",
  },
  polySurfac_2: {
    title: "polySurfac_2",
    description: "to be continue...",
  },
  polySurfac_3: {
    title: "polySurfac_3",
    description: "to be continue...",
  },
  polySurfac_4: {
    title: "polySurfac_4",
    description: "to be continue...",
  },
  polySurfac_5: {
    title: "polySurfac_5",
    description: "to be continue...",
  },
  polySurfac_6: {
    title: "polySurfac_6",
    description: "to be continue...",
  },
  polySurfac_7: {
    title: "polySurfac_7",
    description: "to be continue...",
  },
  polySurfac_8: {
    title: "polySurfac_8",
    description: "to be continue...",
  },
  polySurfac_9: {
    title: "polySurfac_9",
    description: "to be continue...",
  },
  polySurfac_10: {
    title: "polySurfac_10",
    description: "to be continue...",
  },
  polySurfac_11: {
    title: "polySurfac_11",
    description: "to be continue...",
  },
  polySurfac_12: {
    title: "polySurfac_12",
    description: "to be continue...",
  },
  polySurfac_13: {
    title: "polySurfac_13",
    description: "to be continue...",
  },
  polySurfac_14: {
    title: "polySurfac_14",
    description: "to be continue...",
  },
  polySurfac_15: {
    title: "polySurfac_15",
    description: "to be continue...",
  },
  polySurfac_16: {
    title: "polySurfac_16",
    description: "to be continue...",
  },
  polySurfac_17: {
    title: "polySurfac_17",
    description: "to be continue...",
  },
  polySurfac_18: {
    title: "polySurfac_18",
    description: "to be continue...",
  },
};

export default function InteractiveSpaceshipModel() {
  const gltf = useGLTF("/model/Apollo_Soyuz.glb");

  const groupRef = useRef<THREE.Group | null>(null);
  const axis = useRef(new THREE.Vector3(1, 0, 0).normalize());

  const [activePartId, setActivePartId] = useState<string | null>(null);

  const [activePart, setActivePart] = useState<{
    name: string;
    position: THREE.Vector3;
    info: PartInfo;
  } | null>(null);

  /**
   * 两份 clone：
   * wireScene：线框层
   * solidScene：实体层
   */
  const wireScene = useMemo(() => {
    return clone(gltf.scene) as THREE.Object3D;
  }, [gltf.scene]);

  const solidScene = useMemo(() => {
    return clone(gltf.scene) as THREE.Object3D;
  }, [gltf.scene]);

  const wireMeshesRef = useRef<THREE.Mesh[]>([]);
  const solidMeshesRef = useRef<THREE.Mesh[]>([]);

  const wireframeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#ffffff",
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    const wireMeshes: THREE.Mesh[] = [];
    const solidMeshes: THREE.Mesh[] = [];

    /**
     * 线框层：负责显示线框 + 接收鼠标事件
     */
    wireScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.material = wireframeMaterial;
      object.userData.partId = getPartId(object.name);

      wireMeshes.push(object);
    });

    /**
     * 实体层：只负责淡入显示，不参与鼠标检测
     */
    solidScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.userData.partId = getPartId(object.name);

      // 关键：实体层不要参与 raycast，否则会挡住线框层的 hover
      object.raycast = () => null;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const clonedMaterials = materials.map((material) => {
        const cloned = material.clone();

        cloned.transparent = true;
        cloned.opacity = 0;

        // 透明材质建议关闭 depthWrite，避免挡住后面的线框或产生奇怪深度问题
        cloned.depthWrite = false;

        cloned.needsUpdate = true;

        return cloned;
      });

      object.material = Array.isArray(object.material)
        ? clonedMaterials
        : clonedMaterials[0];

      solidMeshes.push(object);
    });

    wireMeshesRef.current = wireMeshes;
    solidMeshesRef.current = solidMeshes;
  }, [wireScene, solidScene, wireframeMaterial]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    /**
     * 自转
     */
    groupRef.current.rotateOnAxis(axis.current, delta * 0.5);

    /**
     * 材质淡入淡出
     */
    const speed = 8;
    const t = 1 - Math.exp(-speed * delta);

    solidMeshesRef.current.forEach((mesh) => {
      const partId = mesh.userData.partId as string;
      const targetOpacity = activePartId === partId ? 1 : 0;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(
          material.opacity,
          targetOpacity,
          t,
        );

        material.transparent = true;
        material.needsUpdate = true;
      });
    });

    wireMeshesRef.current.forEach((mesh) => {
      const partId = mesh.userData.partId as string;
      const targetOpacity = activePartId === partId ? 0.25 : 0.75;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(
          material.opacity,
          targetOpacity,
          t,
        );

        material.transparent = true;
        material.needsUpdate = true;
      });
    });
  });

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    const object = event.object;

    if (!(object instanceof THREE.Mesh)) return;

    const partId = getPartId(object.name);
    const info = partInfoMap[partId];

    if (!info) return;

    const worldPosition = event.point.clone();
    // object.getWorldPosition(worldPosition);

    setActivePartId(partId);

    setActivePart({
      name: partId,
      position: worldPosition,
      info,
    });

    document.body.style.cursor = "pointer";
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    setActivePartId(null);
    setActivePart(null);

    document.body.style.cursor = "default";
  };

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 4]} scale={0.8}>
      <group rotation={[0.2, Math.PI, 0]}>
        {/* 线框层：接收鼠标事件 */}
        <primitive
          object={wireScene}
          scale={1}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        />

        {/* 实体层：不接收鼠标事件，只负责淡入显示 */}
        <primitive object={solidScene} scale={1} />
      </group>

      {activePart && (
        <Html
          position={[
            activePart.position.x,
            activePart.position.y + 0.4,
            activePart.position.z,
          ]}
          center
          distanceFactor={8}
          className="pointer-events-none"
        >
          <div className="w-60 rounded-xl border border-white/20 bg-black/70 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="text-sm font-semibold text-sky-300">
              {activePart.info.title}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-white/70">
              {activePart.info.description}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function getPartId(name: string) {
  return name;
}
