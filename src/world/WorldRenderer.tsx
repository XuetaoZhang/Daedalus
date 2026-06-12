import { Text, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { SceneSpec, ZoneSpec } from "./sceneSpec";

type WorldRendererProps = {
  spec: SceneSpec;
};

type ModelProps = {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  tint?: string;
  tintStrength?: number;
};

const hexAssetPath = "/kenney_hexagon-kit/Models/GLB%20format/";
const arenaAssetPath = "/kenney_mini-arena/Models/GLB%20format/";

const paletteByStyle = {
  game: {
    base: "#121722",
    plate: "#192130",
    ring: "#7ea2ff",
    glow: "#5fd5ff",
    backdrop: "#d4c08d",
    label: "#f7fbff",
  },
  animation: {
    base: "#163445",
    plate: "#21475c",
    ring: "#ffab8a",
    glow: "#7de7ff",
    backdrop: "#e6ddd0",
    label: "#fff6ee",
  },
  voxel: {
    base: "#28313d",
    plate: "#323d4b",
    ring: "#82d46b",
    glow: "#8da6ff",
    backdrop: "#bac195",
    label: "#f5f8ff",
  },
} as const;

const zoneRadiusByType: Record<ZoneSpec["type"], number> = {
  entrance: 1.28,
  main_stage: 1.7,
  track_zone: 1.2,
  project_booth: 1.22,
  sponsor_zone: 1.26,
  timeline: 1.34,
  nft_wall: 1.2,
  wallet_badge: 1.18,
};

export function WorldRenderer({ spec }: WorldRendererProps) {
  const palette = paletteByStyle[spec.style];

  return (
    <group>
      <ArenaFloor base={palette.base} plate={palette.plate} ring={palette.ring} glow={palette.glow} />
      {spec.zones.map((zone) => (
        <ZonePrefab key={zone.id} zone={zone} style={spec.style} />
      ))}
      <Text
        position={[0, 3.4, -1]}
        fontSize={0.52}
        color={palette.label}
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
      >
        {spec.title}
      </Text>
    </group>
  );
}

function ArenaFloor({
  base,
  plate,
  ring,
  glow,
}: {
  base: string;
  plate: string;
  ring: string;
  glow: string;
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[10.1, 10.35, 0.42, 96]} />
        <meshStandardMaterial color={base} roughness={0.72} metalness={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[9.45, 96]} />
        <meshStandardMaterial color={plate} roughness={0.66} metalness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[3.65, 3.82, 96]} />
        <meshBasicMaterial color={glow} transparent opacity={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[7.25, 7.42, 128]} />
        <meshBasicMaterial color={ring} transparent opacity={0.54} />
      </mesh>
    </group>
  );
}

function PrefabModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  tint,
  tintStrength = 0,
}: ModelProps) {
  const gltf = useGLTF(url);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const tintColor = tint ? new THREE.Color(tint) : null;

    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const nextMaterials = materials.map((material) => {
        const nextMaterial = material.clone();
        if (tintColor && "color" in nextMaterial && nextMaterial.color instanceof THREE.Color) {
          nextMaterial.color.lerp(tintColor, tintStrength);
        }
        return nextMaterial;
      });

      mesh.material = Array.isArray(mesh.material) ? nextMaterials : nextMaterials[0];
    });

    return clone;
  }, [gltf.scene, tint, tintStrength]);

  return <primitive object={scene} position={position} rotation={rotation} scale={scale} />;
}

function ZonePrefab({ zone, style }: { zone: ZoneSpec; style: WorldStyle }) {
  const palette = paletteByStyle[style];
  const radius = zoneRadiusByType[zone.type];
  const tintStrength = style === "game" ? 0.16 : style === "animation" ? 0.3 : 0.5;
  const platformColor = mixHexColors(zone.color, palette.backdrop, style === "voxel" ? 0.46 : 0.32);

  return (
    <group position={zone.position}>
      <ZonePad radius={radius} color={platformColor} accent={zone.accent} />
      <PrefabCluster zone={zone} tintStrength={tintStrength} />
      <Text
        position={[0, radius > 1.5 ? 2.3 : 1.75, 0.05]}
        fontSize={0.23}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {zone.title}
      </Text>
      {zone.subtitle ? (
        <Text
          position={[0, radius > 1.5 ? 1.98 : 1.43, 0.06]}
          fontSize={0.12}
          color={zone.accent}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8}
        >
          {zone.subtitle}
        </Text>
      ) : null}
    </group>
  );
}

function ZonePad({ radius, color, accent }: { radius: number; color: string; accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.08, 0.22, 28]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.8, radius * 0.9, 40]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.225, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.0, radius * 1.06, 40]} />
        <meshBasicMaterial color="#fff7eb" transparent opacity={0.24} />
      </mesh>
    </group>
  );
}

function PrefabCluster({
  zone,
  tintStrength,
}: {
  zone: ZoneSpec;
  tintStrength: number;
}) {
  const tint = zone.color;
  const accent = zone.accent;

  switch (zone.type) {
    case "entrance":
      return (
        <group>
          <PrefabModel url={`${arenaAssetPath}wall-gate.glb`} position={[0, 0.22, 0.1]} rotation={[0, Math.PI, 0]} scale={0.72} tint={tint} tintStrength={tintStrength} />
          <PrefabModel url={`${hexAssetPath}path-straight.glb`} position={[0, 0.14, -0.8]} rotation={[0, Math.PI / 2, 0]} scale={0.48} tint={accent} tintStrength={0.12} />
          <BannerPair tint={accent} height={0.92} spread={0.92} />
          <SoldierLine tint={tint} origin={[0, 0.18, -0.86]} spacing={0.44} count={3} />
        </group>
      );
    case "main_stage":
      return (
        <group>
          <PrefabModel url={`${hexAssetPath}building-castle.glb`} position={[0, 0.22, 0]} rotation={[0, Math.PI / 6, 0]} scale={1.06} tint={tint} tintStrength={tintStrength} />
          <PrefabModel url={`${hexAssetPath}building-walls.glb`} position={[0, 0.19, -0.95]} rotation={[0, Math.PI / 6, 0]} scale={0.72} tint={tint} tintStrength={tintStrength * 0.9} />
          <PrefabModel url={`${hexAssetPath}unit-wall-tower.glb`} position={[-1.0, 0.2, 0.76]} scale={0.58} tint={accent} tintStrength={tintStrength * 0.9} />
          <PrefabModel url={`${hexAssetPath}unit-wall-tower.glb`} position={[1.0, 0.2, 0.76]} rotation={[0, Math.PI, 0]} scale={0.58} tint={accent} tintStrength={tintStrength * 0.9} />
          <BannerPair tint={accent} height={1.38} spread={1.08} />
          <SoldierLine tint={accent} origin={[0, 0.18, 1.02]} spacing={0.46} count={4} />
        </group>
      );
    case "track_zone":
      return (
        <group>
          <PrefabModel url={`${hexAssetPath}building-archery.glb`} position={[0, 0.18, 0]} rotation={[0, -0.28, 0]} scale={0.84} tint={tint} tintStrength={tintStrength} />
          <PrefabModel url={`${hexAssetPath}path-straight.glb`} position={[0, 0.14, 0.92]} rotation={[0, Math.PI / 2, 0]} scale={0.48} tint={accent} tintStrength={0.14} />
          <BannerPair tint={accent} height={0.94} spread={0.78} />
        </group>
      );
    case "project_booth":
      return (
        <group>
          <PrefabModel url={`${hexAssetPath}building-market.glb`} position={[-0.42, 0.18, 0.12]} rotation={[0, -0.34, 0]} scale={0.74} tint={tint} tintStrength={tintStrength} />
          <PrefabModel url={`${hexAssetPath}building-cabin.glb`} position={[0.58, 0.18, 0.18]} rotation={[0, 0.38, 0]} scale={0.64} tint={accent} tintStrength={tintStrength * 0.88} />
          <PrefabModel url={`${hexAssetPath}path-square.glb`} position={[0.05, 0.14, -0.68]} rotation={[0, Math.PI / 6, 0]} scale={0.44} tint={accent} tintStrength={0.12} />
          <BannerPair tint={accent} height={0.84} spread={0.92} />
        </group>
      );
    case "sponsor_zone":
      return (
        <group>
          <PrefabModel url={`${hexAssetPath}building-village.glb`} position={[-0.1, 0.18, 0.1]} rotation={[0, -0.2, 0]} scale={0.72} tint={tint} tintStrength={tintStrength} />
          <PrefabModel url={`${hexAssetPath}building-tower.glb`} position={[0.86, 0.18, 0.64]} rotation={[0, 0.24, 0]} scale={0.62} tint={accent} tintStrength={tintStrength * 0.92} />
          <BannerPair tint={accent} height={1.06} spread={0.9} />
        </group>
      );
    case "timeline":
      return (
        <group>
          <PrefabModel url={`${hexAssetPath}bridge.glb`} position={[0, 0.18, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.86} tint={tint} tintStrength={tintStrength * 0.75} />
          <PrefabModel url={`${hexAssetPath}path-straight.glb`} position={[0, 0.14, -0.96]} rotation={[0, Math.PI / 2, 0]} scale={0.44} tint={accent} tintStrength={0.14} />
          <PrefabModel url={`${hexAssetPath}path-straight.glb`} position={[0, 0.14, 0.96]} rotation={[0, Math.PI / 2, 0]} scale={0.44} tint={accent} tintStrength={0.14} />
          <PrefabModel url={`${arenaAssetPath}banner.glb`} position={[0, 0.82, 0]} scale={0.2} tint={accent} tintStrength={0.64} />
        </group>
      );
    case "nft_wall":
      return (
        <group>
          <PrefabModel url={`${arenaAssetPath}wall.glb`} position={[0, 0.18, 0.18]} rotation={[0, Math.PI, 0]} scale={0.7} tint={tint} tintStrength={tintStrength} />
          <PrefabModel url={`${arenaAssetPath}column.glb`} position={[-0.88, 0.16, -0.04]} scale={0.46} tint={accent} tintStrength={tintStrength * 0.85} />
          <PrefabModel url={`${arenaAssetPath}column.glb`} position={[0.88, 0.16, -0.04]} scale={0.46} tint={accent} tintStrength={tintStrength * 0.85} />
          <PrefabModel url={`${arenaAssetPath}banner.glb`} position={[0, 0.98, 0.1]} scale={0.24} tint={accent} tintStrength={0.68} />
        </group>
      );
    case "wallet_badge":
      return (
        <group>
          <PrefabModel url={`${arenaAssetPath}statue.glb`} position={[0, 0.18, 0.06]} rotation={[0, -0.3, 0]} scale={0.72} tint={tint} tintStrength={tintStrength} />
          <PrefabModel url={`${arenaAssetPath}column.glb`} position={[-0.84, 0.14, 0.2]} scale={0.38} tint={accent} tintStrength={tintStrength * 0.82} />
          <PrefabModel url={`${arenaAssetPath}column.glb`} position={[0.84, 0.14, 0.2]} scale={0.38} tint={accent} tintStrength={tintStrength * 0.82} />
          <BannerPair tint={accent} height={0.98} spread={0.72} />
        </group>
      );
    default:
      return null;
  }
}

function BannerPair({ tint, height, spread }: { tint: string; height: number; spread: number }) {
  return (
    <>
      <PrefabModel url={`${arenaAssetPath}banner.glb`} position={[-spread, height, 0]} scale={0.2} tint={tint} tintStrength={0.72} />
      <PrefabModel
        url={`${arenaAssetPath}banner.glb`}
        position={[spread, height, 0]}
        rotation={[0, Math.PI, 0]}
        scale={0.2}
        tint={tint}
        tintStrength={0.72}
      />
    </>
  );
}

function SoldierLine({
  tint,
  origin,
  spacing,
  count,
}: {
  tint: string;
  origin: [number, number, number];
  spacing: number;
  count: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const xOffset = (index - (count - 1) / 2) * spacing;
        return (
          <PrefabModel
            key={`${origin.join("-")}-${index}`}
            url={`${arenaAssetPath}character-soldier.glb`}
            position={[origin[0] + xOffset, origin[1], origin[2]]}
            rotation={[0, index % 2 === 0 ? 0.16 : -0.16, 0]}
            scale={0.36}
            tint={tint}
            tintStrength={0.62}
          />
        );
      })}
    </>
  );
}

function mixHexColors(a: string, b: string, amount: number) {
  const colorA = new THREE.Color(a);
  const colorB = new THREE.Color(b);
  colorA.lerp(colorB, amount);
  return `#${colorA.getHexString()}`.toUpperCase();
}

[
  `${hexAssetPath}building-castle.glb`,
  `${hexAssetPath}building-walls.glb`,
  `${hexAssetPath}unit-wall-tower.glb`,
  `${hexAssetPath}building-archery.glb`,
  `${hexAssetPath}building-market.glb`,
  `${hexAssetPath}building-cabin.glb`,
  `${hexAssetPath}building-village.glb`,
  `${hexAssetPath}building-tower.glb`,
  `${hexAssetPath}path-straight.glb`,
  `${hexAssetPath}path-square.glb`,
  `${hexAssetPath}bridge.glb`,
  `${arenaAssetPath}wall-gate.glb`,
  `${arenaAssetPath}banner.glb`,
  `${arenaAssetPath}wall.glb`,
  `${arenaAssetPath}column.glb`,
  `${arenaAssetPath}statue.glb`,
  `${arenaAssetPath}character-soldier.glb`,
].forEach((assetUrl) => useGLTF.preload(assetUrl));
