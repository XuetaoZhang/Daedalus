import { Text, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { LandmarkSpec, SceneSpec, WorldStyle, ZoneSpec } from "./sceneSpec";
import { buildStudioWorldLayout, type StudioWorldLayout } from "./studioWorldLayout";
import { controllableLandmarkList, controllableLandmarkRegistry, getControllableLandmarkAsset } from "./controllableAssets";
import { BASE_TILE_SCALE, MODEL_HEX_SIDE, axialToWorld, buildTerrainTiles } from "./terrain/terrainGenerator";

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
    rim: "#3e4758",
    glow: "#5fd5ff",
    backdrop: "#d4c08d",
  },
  animation: {
    rim: "#586875",
    glow: "#7de7ff",
    backdrop: "#e6ddd0",
  },
  voxel: {
    rim: "#546068",
    glow: "#8da6ff",
    backdrop: "#bac195",
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

const DRAGON_ASSET_PATH = "/Dragon.glb";

export function WorldRenderer({ spec }: WorldRendererProps) {
  const palette = paletteByStyle[spec.style];
  const layout = useMemo(() => buildStudioWorldLayout(spec.zones, spec.landmarks ?? []), [spec.landmarks, spec.zones]);
  const routeNetwork = useMemo(() => buildRouteNetwork(layout), [layout]);
  const anchorByZoneId = useMemo(
    () => new Map(layout.anchors.map((anchor) => [anchor.zone.id, anchor.position])),
    [layout.anchors],
  );
  const landmarkAnchorById = useMemo(
    () => new Map(layout.landmarkAnchors.map((anchor) => [anchor.landmark.id, anchor.position])),
    [layout.landmarkAnchors],
  );
  const autoPatrolLoop = useMemo(() => buildAutoPatrolLoop(layout, spec), [layout, spec]);

  return (
    <group>
      <HexTerrain spec={spec} style={spec.style} rim={palette.rim} glow={palette.glow} layout={layout} />
      <RouteNetwork routeNetwork={routeNetwork} />
      {spec.zones.map((zone) => (
        <ZonePrefab key={zone.id} zone={zone} style={spec.style} overridePosition={anchorByZoneId.get(zone.id)} />
      ))}
      {(spec.landmarks ?? []).map((landmark) => (
        <LandmarkPrefab
          key={landmark.id}
          landmark={landmark}
          style={spec.style}
          position={landmarkAnchorById.get(landmark.id) ?? [0, 0, 0]}
        />
      ))}
      {autoPatrolLoop ? <AutoPatrolSoldier loop={autoPatrolLoop} /> : null}
      <SkyDragon layout={layout} />
    </group>
  );
}

function HexTerrain({
  spec,
  style,
  rim,
  glow,
  layout,
}: {
  spec: SceneSpec;
  style: WorldStyle;
  rim: string;
  glow: string;
  layout: StudioWorldLayout;
}) {
  const tiles = useMemo(() => buildTerrainTiles(spec, style, layout), [layout, spec, style]);

  return (
    <group>
      {tiles.map((tile) => (
        <PrefabModel
          key={tile.key}
          url={tile.url}
          position={tile.position}
          rotation={tile.rotation}
          scale={tile.scale}
          tint={tile.tint}
          tintStrength={tile.tintStrength}
        />
      ))}
      <mesh position={[0, -0.24, 0]} receiveShadow>
        <cylinderGeometry args={[layout.supportRadius + 0.14, layout.supportRadius + 0.38, 0.28, 96]} />
        <meshStandardMaterial color={rim} roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[Math.max(layout.supportRadius - 0.52, 0.8), layout.supportRadius - 0.24, 96]} />
        <meshBasicMaterial color={glow} transparent opacity={0.16} />
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

function AnimatedSoldierModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  tint,
  tintStrength = 0,
  clip = "walk",
}: Omit<ModelProps, "url"> & { clip?: string }) {
  const gltf = useGLTF(`${arenaAssetPath}character-soldier.glb`);
  const rootRef = useRef<THREE.Group>(null);

  const scene = useMemo(() => {
    const clone = cloneSkinned(gltf.scene) as THREE.Group;
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

  const { actions } = useAnimations(gltf.animations, rootRef);

  useEffect(() => {
    const preferredNames = [clip, "walk", "rotate", "spin", "idle", "animation", "Action"];
    const requested = preferredNames.map((name) => actions[name]).find(Boolean) ?? Object.values(actions)[0];
    if (!requested) return;

    requested.reset();
    requested.fadeIn(0.2);
    requested.play();
    requested.enabled = true;
    requested.clampWhenFinished = false;
    requested.timeScale = clip === "walk" ? 1.15 : 1;

    return () => {
      requested.fadeOut(0.2);
      requested.stop();
    };
  }, [actions, clip]);

  return <primitive ref={rootRef} object={scene} position={position} rotation={rotation} scale={scale} />;
}

function AnimatedLandmarkModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  tint,
  tintStrength = 0,
}: ModelProps) {
  const gltf = useGLTF(url);
  const rootRef = useRef<THREE.Group>(null);

  const scene = useMemo(() => {
    const clone = cloneSkinned(gltf.scene) as THREE.Group;
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

  const { actions } = useAnimations(gltf.animations, rootRef);

  useEffect(() => {
    const preferredNames = ["rotate", "spin", "idle", "animation", "Action"];
    const preferred = preferredNames.map((name) => actions[name]).find(Boolean);
    const fallback = Object.values(actions)[0];
    const clip = preferred ?? fallback;
    if (!clip) return;

    clip.reset();
    clip.fadeIn(0.2);
    clip.play();

    return () => {
      clip.fadeOut(0.2);
      clip.stop();
    };
  }, [actions]);

  return <primitive ref={rootRef} object={scene} position={position} rotation={rotation} scale={scale} />;
}

function AutoPatrolSoldier({ loop }: { loop: AutoPatrolLoop }) {
  const groupRef = useRef<THREE.Group>(null);
  const current = useMemo(() => new THREE.Vector3(), []);
  const next = useMemo(() => new THREE.Vector3(), []);
  const segmentIndexRef = useRef(0);
  const progressRef = useRef(0);
  const elapsedRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    elapsedRef.current += delta;
    const segment = loop.segments[segmentIndexRef.current];
    if (!segment) return;

    progressRef.current += delta / Math.max(segment.duration, 0.001);

    while (progressRef.current >= 1) {
      progressRef.current -= 1;
      segmentIndexRef.current = (segmentIndexRef.current + 1) % loop.segments.length;
    }

    const active = loop.segments[segmentIndexRef.current];
    const t = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const lookT = Math.min(1, t + 0.015);

    active.curve.getPointAt(t, current);
    active.curve.getPointAt(lookT, next);

    const bob = Math.sin(elapsedRef.current * 8) * 0.012;
    groupRef.current.position.set(current.x, current.y + bob, current.z);
    groupRef.current.rotation.y = Math.atan2(next.x - current.x, next.z - current.z + 0.0001);
  });

  return (
    <group ref={groupRef}>
      <AnimatedSoldierModel scale={0.34} tint="#FF8C5A" tintStrength={0.58} clip="walk" />
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={30}>
        <ringGeometry args={[0.06, 0.09, 16]} />
        <meshBasicMaterial color="#FFD056" transparent opacity={0.9} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SkyDragon({ layout }: { layout: StudioWorldLayout }) {
  const gltf = useGLTF(DRAGON_ASSET_PATH);
  const flightRef = useRef<THREE.Group>(null);
  const dragonRef = useRef<THREE.Group>(null);
  const scene = useMemo(() => cloneSkinned(gltf.scene) as THREE.Group, [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, dragonRef);

  const flightConfig = useMemo(() => {
    const halfSpan = Math.max(layout.supportRadius * 0.42, 4.6);
    return {
      leftX: -halfSpan,
      rightX: halfSpan,
      z: -Math.max(layout.supportRadius * 0.54, 5.1),
      baseY: Math.max(1.25, Math.min(1.9, layout.supportRadius * 0.06 + 1.02)),
      cycleDuration: 10.5,
    };
  }, [layout.supportRadius]);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = false;
    });
  }, [scene]);

  useEffect(() => {
    const allNames = Object.keys(actions);
    const preferredNames = [
      "Dragon_Flying",
      "dragon_flying",
      "Flying",
      "flying",
      "Fly",
      "fly",
      "flap",
      "idle",
      "animation",
      "Action",
    ];
    const directMatch = preferredNames.map((name) => actions[name]).find(Boolean);
    const fuzzyMatch = Object.entries(actions).find(([name]) =>
      preferredNames.some((preferred) => name.toLowerCase().includes(preferred.toLowerCase())),
    )?.[1];
    const clip = directMatch ?? fuzzyMatch ?? Object.values(actions)[0];
    if (!clip) return;

    if (allNames.length > 0) {
      console.info("Dragon animation selected:", clip.getClip().name, "available:", allNames.join(", "));
    }

    clip.reset();
    clip.fadeIn(0.2);
    clip.play();
    clip.enabled = true;
    clip.clampWhenFinished = false;
    clip.timeScale = 1;

    return () => {
      clip.fadeOut(0.2);
      clip.stop();
    };
  }, [actions]);

  useFrame((state) => {
    if (!flightRef.current) return;

    const phase = (state.clock.elapsedTime % flightConfig.cycleDuration) / flightConfig.cycleDuration;
    const pingPong = phase < 0.5 ? phase / 0.5 : 1 - (phase - 0.5) / 0.5;
    const x = THREE.MathUtils.lerp(flightConfig.leftX, flightConfig.rightX, pingPong);
    const movingRight = phase < 0.5;
    const t = state.clock.elapsedTime;
    const bob = Math.sin(t * 1.35) * 0.035 + Math.sin(t * 0.58 + 0.9) * 0.02;

    flightRef.current.position.set(x, flightConfig.baseY + bob, flightConfig.z);
    flightRef.current.rotation.set(
      -0.03 + Math.cos(t * 1.25) * 0.016,
      movingRight ? Math.PI / 2 : -Math.PI / 2,
      0,
    );

    if (dragonRef.current) {
      dragonRef.current.rotation.set(
        0,
        0,
        Math.sin(t * 0.95) * 0.035,
      );
    }
  });

  return (
    <group ref={flightRef}>
      <primitive ref={dragonRef} object={scene} scale={0.28} rotation={[0, 0, 0]} />
    </group>
  );
}

function ZonePrefab({
  zone,
  style,
  overridePosition,
}: {
  zone: ZoneSpec;
  style: WorldStyle;
  overridePosition?: [number, number, number];
}) {
  const palette = paletteByStyle[style];
  const radius = zoneRadiusByType[zone.type];
  const tintStrength = style === "game" ? 0.16 : style === "animation" ? 0.3 : 0.5;
  const markerColor = mixHexColors(zone.color, palette.backdrop, style === "voxel" ? 0.54 : 0.4);

  return (
    <group position={overridePosition ?? zone.position}>
      <ZoneMarker radius={radius} color={markerColor} accent={zone.accent} />
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

function LandmarkPrefab({
  landmark,
  style,
  position,
}: {
  landmark: LandmarkSpec;
  style: WorldStyle;
  position: [number, number, number];
}) {
  const tintStrength = style === "game" ? 0.1 : style === "animation" ? 0.22 : 0.34;
  const tint = style === "animation" ? "#8AD6FF" : style === "voxel" ? "#8BC779" : "#5E6B84";
  const asset = getControllableLandmarkAsset(landmark.type);
  if (!asset) return null;

  const modelProps = {
    url: `${hexAssetPath}${asset.type}.glb`,
    position: [0, 0, 0] as [number, number, number],
    rotation: embeddedHexLandmarkRotation(landmark),
    scale: BASE_TILE_SCALE,
    tint,
    tintStrength,
  };

  return (
    <group position={position}>
      {asset.animated ? <AnimatedLandmarkModel {...modelProps} /> : <PrefabModel {...modelProps} />}
    </group>
  );
}

function embeddedHexLandmarkRotation(landmark: LandmarkSpec): [number, number, number] {
  if (landmark.type === "bridge" || landmark.type.startsWith("building-")) {
    return [0, 0, 0];
  }

  return [0, 0, 0];
}

function ZoneMarker({ radius, color, accent }: { radius: number; color: string; accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[radius * 0.88, radius * 0.94, 0.04, 6]} />
        <meshStandardMaterial color={color} roughness={0.84} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, 0.006, 0]} receiveShadow>
        <cylinderGeometry args={[radius * 1.08, radius * 1.12, 0.012, 6]} />
        <meshStandardMaterial color={accent} transparent opacity={0.26} roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.028, 0]} receiveShadow>
        <cylinderGeometry args={[radius * 0.56, radius * 0.58, 0.012, 6]} />
        <meshStandardMaterial color="#fff7eb" transparent opacity={0.24} roughness={0.72} />
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
          <PrefabModel
            url={`${arenaAssetPath}wall-gate.glb`}
            position={[0, 0.22, 0.1]}
            rotation={[0, Math.PI, 0]}
            scale={0.72}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}path-straight.glb`}
            position={[0, 0.14, -0.8]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.48}
            tint={accent}
            tintStrength={0.12}
          />
          <BannerPair tint={accent} height={0.92} spread={0.92} />
          <SoldierLine tint={tint} origin={[0, 0.18, -0.86]} spacing={0.44} count={3} />
        </group>
      );
    case "main_stage":
      return (
        <group>
          <PrefabModel
            url={`${hexAssetPath}unit-mansion.glb`}
            position={[0, 0.2, 0]}
            scale={2.15}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}unit-wall-tower.glb`}
            position={[-0.58, 0.18, -0.76]}
            scale={0.88}
            tint={tint}
            tintStrength={tintStrength * 0.9}
          />
          <PrefabModel
            url={`${hexAssetPath}unit-wall-tower.glb`}
            position={[0.58, 0.18, -0.76]}
            scale={0.88}
            tint={tint}
            tintStrength={tintStrength * 0.9}
          />
          <PrefabModel
            url={`${hexAssetPath}unit-wall-tower.glb`}
            position={[-1.0, 0.2, 0.76]}
            scale={0.58}
            tint={accent}
            tintStrength={tintStrength * 0.9}
          />
          <PrefabModel
            url={`${hexAssetPath}unit-wall-tower.glb`}
            position={[1.0, 0.2, 0.76]}
            rotation={[0, Math.PI, 0]}
            scale={0.58}
            tint={accent}
            tintStrength={tintStrength * 0.9}
          />
          <BannerPair tint={accent} height={1.38} spread={1.08} />
        </group>
      );
    case "track_zone":
      return (
        <group>
          <PrefabModel
            url={`${arenaAssetPath}weapon-rack.glb`}
            position={[0, 0.2, -0.04]}
            scale={0.92}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}path-straight.glb`}
            position={[0, 0.14, 0.92]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.48}
            tint={accent}
            tintStrength={0.14}
          />
          <BannerPair tint={accent} height={0.94} spread={0.78} />
        </group>
      );
    case "project_booth":
      return (
        <group>
          <PrefabModel
            url={`${hexAssetPath}unit-house.glb`}
            position={[-0.46, 0.2, 0.1]}
            rotation={[0, -0.28, 0]}
            scale={1.05}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}unit-house.glb`}
            position={[0.5, 0.2, 0.18]}
            rotation={[0, 0.38, 0]}
            scale={0.96}
            tint={accent}
            tintStrength={tintStrength * 0.88}
          />
          <PrefabModel
            url={`${hexAssetPath}path-square.glb`}
            position={[0.05, 0.14, -0.68]}
            rotation={[0, Math.PI / 6, 0]}
            scale={0.44}
            tint={accent}
            tintStrength={0.12}
          />
          <BannerPair tint={accent} height={0.84} spread={0.92} />
        </group>
      );
    case "sponsor_zone":
      return (
        <group>
          <PrefabModel
            url={`${hexAssetPath}unit-house.glb`}
            position={[-0.34, 0.2, 0.04]}
            rotation={[0, -0.2, 0]}
            scale={1.08}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}unit-tower.glb`}
            position={[0.62, 0.2, 0.42]}
            rotation={[0, 0.24, 0]}
            scale={0.9}
            tint={accent}
            tintStrength={tintStrength * 0.92}
          />
          <BannerPair tint={accent} height={1.06} spread={0.9} />
        </group>
      );
    case "timeline":
      return (
        <group>
          <PrefabModel
            url={`${arenaAssetPath}stairs.glb`}
            position={[0, 0.2, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.82}
            tint={tint}
            tintStrength={tintStrength * 0.75}
          />
          <PrefabModel
            url={`${hexAssetPath}path-straight.glb`}
            position={[0, 0.14, -0.96]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.44}
            tint={accent}
            tintStrength={0.14}
          />
          <PrefabModel
            url={`${hexAssetPath}path-straight.glb`}
            position={[0, 0.14, 0.96]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.44}
            tint={accent}
            tintStrength={0.14}
          />
          <PrefabModel
            url={`${arenaAssetPath}banner.glb`}
            position={[0, 0.82, 0]}
            scale={0.2}
            tint={accent}
            tintStrength={0.64}
          />
        </group>
      );
    case "nft_wall":
      return (
        <group>
          <PrefabModel
            url={`${arenaAssetPath}wall.glb`}
            position={[0, 0.18, 0.18]}
            rotation={[0, Math.PI, 0]}
            scale={0.7}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${arenaAssetPath}column.glb`}
            position={[-0.88, 0.16, -0.04]}
            scale={0.46}
            tint={accent}
            tintStrength={tintStrength * 0.85}
          />
          <PrefabModel
            url={`${arenaAssetPath}column.glb`}
            position={[0.88, 0.16, -0.04]}
            scale={0.46}
            tint={accent}
            tintStrength={tintStrength * 0.85}
          />
          <PrefabModel
            url={`${arenaAssetPath}banner.glb`}
            position={[0, 0.98, 0.1]}
            scale={0.24}
            tint={accent}
            tintStrength={0.68}
          />
        </group>
      );
    case "wallet_badge":
      return (
        <group>
          <PrefabModel
            url={`${arenaAssetPath}statue.glb`}
            position={[0, 0.18, 0.06]}
            rotation={[0, -0.3, 0]}
            scale={0.72}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${arenaAssetPath}column.glb`}
            position={[-0.84, 0.14, 0.2]}
            scale={0.38}
            tint={accent}
            tintStrength={tintStrength * 0.82}
          />
          <PrefabModel
            url={`${arenaAssetPath}column.glb`}
            position={[0.84, 0.14, 0.2]}
            scale={0.38}
            tint={accent}
            tintStrength={tintStrength * 0.82}
          />
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
      <PrefabModel
        url={`${arenaAssetPath}banner.glb`}
        position={[-spread, height, 0]}
        scale={0.2}
        tint={tint}
        tintStrength={0.72}
      />
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

type RouteNetworkShape = {
  pathRoutes: Array<Array<[number, number, number]>>;
  riverRoute: Array<[number, number, number]>;
};

function RouteNetwork({ routeNetwork }: { routeNetwork: RouteNetworkShape }) {
  return (
    <group>
      {routeNetwork.pathRoutes.map((route, index) => (
        <RouteRibbon
          key={`path-route-${index}`}
          points={route}
          y={0.12}
          width={0.12}
          color="#C9B38F"
          coreColor="#F2DFC0"
        />
      ))}
      <RouteRibbon
        points={routeNetwork.riverRoute}
        y={0.1}
        width={0.18}
        color="#6FB9C7"
        coreColor="#BFEAF2"
      />
    </group>
  );
}

function RouteRibbon({
  points,
  y,
  width,
  color,
  coreColor,
}: {
  points: Array<[number, number, number]>;
  y: number;
  width: number;
  color: string;
  coreColor: string;
}) {
  return (
    <>
      {buildRouteSegments(sampleSmoothPath(points)).map((segment, index) => (
        <group key={`${color}-${index}`}>
          <mesh position={[segment.midX, y - 0.004, segment.midZ]} rotation={[0, segment.yaw, 0]} receiveShadow renderOrder={14}>
            <boxGeometry args={[segment.length, 0.01, width]} />
            <meshStandardMaterial color={color} roughness={0.94} metalness={0} transparent opacity={0.48} />
          </mesh>
          <mesh position={[segment.midX, y + 0.002, segment.midZ]} rotation={[0, segment.yaw, 0]} receiveShadow renderOrder={15}>
            <boxGeometry args={[segment.length * 0.98, 0.006, width * 0.54]} />
            <meshStandardMaterial color={coreColor} roughness={0.88} metalness={0} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function mixHexColors(a: string, b: string, amount: number) {
  const colorA = new THREE.Color(a);
  const colorB = new THREE.Color(b);
  colorA.lerp(colorB, amount);
  return `#${colorA.getHexString()}`.toUpperCase();
}

function buildRouteNetwork(layout: StudioWorldLayout): RouteNetworkShape {
  const stageAnchor = layout.anchors.find((anchor) => anchor.zone.type === "main_stage") ?? layout.anchors[0];
  if (!stageAnchor) {
    return { pathRoutes: [], riverRoute: [] };
  }

  const stageFront: [number, number, number] = [
    stageAnchor.position[0],
    0.12,
    stageAnchor.position[2] + 1.46,
  ];

  const pathRoutes = layout.anchors
    .filter((anchor) => anchor.zone.id !== stageAnchor.zone.id)
    .map((anchor) => {
      const target: [number, number, number] = [anchor.position[0], 0.12, anchor.position[2]];
      const dx = target[0] - stageAnchor.position[0];
      const dz = target[2] - stageAnchor.position[2];
      const horizontalBias = Math.abs(dx) > Math.abs(dz) * 0.8;
      const exit: [number, number, number] = horizontalBias
        ? [stageAnchor.position[0] + Math.sign(dx || 1) * 0.9, 0.12, stageAnchor.position[2] + 0.55]
        : [stageAnchor.position[0], 0.12, stageAnchor.position[2] + Math.sign(dz || 1) * 0.95];
      const control: [number, number, number] = [
        stageAnchor.position[0] + dx * 0.52,
        0.12,
        stageAnchor.position[2] + dz * 0.46 + (horizontalBias ? 0.28 : 0),
      ];
      const entry: [number, number, number] = [
        target[0] - Math.sign(dx || 1) * 0.2,
        0.12,
        target[2] - Math.sign(dz || 1) * 0.2,
      ];

      return [stageFront, exit, control, entry, target];
    });

  const riverWaypoints = [
    axialToWorld(-6, 1, MODEL_HEX_SIDE),
    axialToWorld(-4, 0, MODEL_HEX_SIDE),
    axialToWorld(-2, -1, MODEL_HEX_SIDE),
    axialToWorld(1, -2, MODEL_HEX_SIDE),
    axialToWorld(4, -2, MODEL_HEX_SIDE),
    axialToWorld(6, -1, MODEL_HEX_SIDE),
  ].map((position) => [position[0], 0.1, position[2]] as [number, number, number]);

  return {
    pathRoutes,
    riverRoute: riverWaypoints,
  };
}

type AutoPatrolLoop = {
  segments: Array<{
    curve: THREE.CatmullRomCurve3;
    duration: number;
  }>;
};

function buildAutoPatrolLoop(layout: StudioWorldLayout, spec: SceneSpec): AutoPatrolLoop | null {
  const anchors = buildRouteAnchorMap(layout, spec);
  const mainStage = anchors.get("main-stage");
  const village = anchors.get("village");
  const windmill = anchors.get("windmill");
  const sponsorZone = anchors.get("sponsor-zone") ?? anchors.get("red-castle");
  const entrance = anchors.get("entrance");

  if (!mainStage || !village || !windmill || !sponsorZone || !entrance) return null;

  const routePairs: Array<[[number, number, number], [number, number, number]]> = [
    [mainStage, village],
    [village, windmill],
    [windmill, sponsorZone],
    [sponsorZone, entrance],
    [entrance, mainStage],
  ];

  return {
    segments: routePairs.map(([from, to]) => {
      const curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(from[0], from[1] + 0.2, from[2]),
          new THREE.Vector3(THREE.MathUtils.lerp(from[0], to[0], 0.35), 0.2, THREE.MathUtils.lerp(from[2], to[2], 0.35)),
          new THREE.Vector3(THREE.MathUtils.lerp(from[0], to[0], 0.7), 0.2, THREE.MathUtils.lerp(from[2], to[2], 0.7)),
          new THREE.Vector3(to[0], to[1] + 0.2, to[2]),
        ],
        false,
        "catmullrom",
        0.08,
      );
      return { curve, duration: Math.max(curve.getLength() / 1.35, 2.2) };
    }),
  };
}

function buildRouteAnchorMap(layout: StudioWorldLayout, spec: SceneSpec) {
  const anchors = new Map<string, [number, number, number]>();

  for (const zoneAnchor of layout.anchors) {
    const key = zoneAnchor.zone.id.toLowerCase();
    anchors.set(zoneAnchor.zone.id, zoneAnchor.position);
    anchors.set(key, zoneAnchor.position);
    anchors.set(zoneAnchor.zone.type.replace(/_/g, "-"), zoneAnchor.position);
  }

  for (const landmarkAnchor of layout.landmarkAnchors) {
    const key = landmarkAnchor.landmark.id.toLowerCase();
    anchors.set(landmarkAnchor.landmark.id, landmarkAnchor.position);
    anchors.set(key, landmarkAnchor.position);
    anchors.set(landmarkAnchor.landmark.type.replace(/_/g, "-"), landmarkAnchor.position);
  }

  const entrance = layout.anchors.find((anchor) => anchor.zone.type === "entrance");
  const mainStage = layout.anchors.find((anchor) => anchor.zone.type === "main_stage");
  const sponsorZone = layout.anchors.find((anchor) => anchor.zone.type === "sponsor_zone");
  const trackZone = layout.anchors.find((anchor) => anchor.zone.type === "track_zone");
  const villageLandmark = (spec.landmarks ?? []).find((landmark) => controllableLandmarkRegistry[landmark.type]?.routeAlias === "village");
  const windmillLandmark = (spec.landmarks ?? []).find((landmark) => controllableLandmarkRegistry[landmark.type]?.routeAlias === "windmill");

  if (entrance) anchors.set("entrance", entrance.position);
  if (mainStage) anchors.set("main-stage", mainStage.position);
  if (sponsorZone) anchors.set("sponsor-zone", sponsorZone.position);
  if (trackZone) anchors.set("track-zone", trackZone.position);
  if (villageLandmark) anchors.set("village", anchors.get(villageLandmark.id) ?? mainStage?.position ?? entrance?.position ?? [0, 0, 0]);
  if (windmillLandmark) anchors.set("windmill", anchors.get(windmillLandmark.id) ?? trackZone?.position ?? mainStage?.position ?? [0, 0, 0]);

  if (!anchors.has("village") && entrance) anchors.set("village", entrance.position);
  if (!anchors.has("windmill") && trackZone) anchors.set("windmill", trackZone.position);
  if (mainStage) anchors.set("red-castle", mainStage.position);

  return anchors;
}

function buildRouteSegments(points: Array<[number, number, number]>) {
  const segments: Array<{ midX: number; midZ: number; length: number; yaw: number }> = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const [ax, , az] = points[index];
    const [bx, , bz] = points[index + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const length = Math.hypot(dx, dz);
    if (length < 0.001) continue;

    segments.push({
      midX: (ax + bx) / 2,
      midZ: (az + bz) / 2,
      length,
      yaw: Math.atan2(dz, dx),
    });
  }

  return segments;
}

function sampleSmoothPath(points: Array<[number, number, number]>) {
  if (points.length <= 2) return points;

  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(point[0], point[1], point[2])));
  const divisions = Math.max(16, points.length * 8);
  const sampled = curve.getPoints(divisions);

  return sampled.map((point) => [point.x, point.y, point.z] as [number, number, number]);
}

[
  `${hexAssetPath}grass.glb`,
  `${hexAssetPath}grass-forest.glb`,
  `${hexAssetPath}grass-hill.glb`,
  `${hexAssetPath}sand.glb`,
  `${hexAssetPath}sand-rocks.glb`,
  `${hexAssetPath}stone-hill.glb`,
  `${hexAssetPath}stone-rocks.glb`,
  `${hexAssetPath}stone-mountain.glb`,
  `${hexAssetPath}water.glb`,
  `${hexAssetPath}water-island.glb`,
  `${hexAssetPath}river-straight.glb`,
  `${hexAssetPath}river-corner.glb`,
  `${hexAssetPath}river-end.glb`,
  `${hexAssetPath}river-start.glb`,
  `${hexAssetPath}river-crossing.glb`,
  `${hexAssetPath}river-intersectionA.glb`,
  `${hexAssetPath}river-intersectionB.glb`,
  `${hexAssetPath}river-intersectionC.glb`,
  `${hexAssetPath}river-intersectionD.glb`,
  `${hexAssetPath}river-intersectionE.glb`,
  `${hexAssetPath}river-intersectionF.glb`,
  `${hexAssetPath}river-intersectionG.glb`,
  `${hexAssetPath}river-intersectionH.glb`,
  `${hexAssetPath}building-castle.glb`,
  `${hexAssetPath}bridge.glb`,
  `${hexAssetPath}building-archery.glb`,
  `${hexAssetPath}building-cabin.glb`,
  `${hexAssetPath}building-dock.glb`,
  `${hexAssetPath}building-farm.glb`,
  `${hexAssetPath}building-house.glb`,
  `${hexAssetPath}building-market.glb`,
  `${hexAssetPath}building-mill.glb`,
  `${hexAssetPath}building-mine.glb`,
  `${hexAssetPath}building-port.glb`,
  `${hexAssetPath}building-sheep.glb`,
  `${hexAssetPath}building-smelter.glb`,
  `${hexAssetPath}building-tower.glb`,
  `${hexAssetPath}building-village.glb`,
  `${hexAssetPath}building-wall.glb`,
  `${hexAssetPath}building-walls.glb`,
  `${hexAssetPath}building-watermill.glb`,
  `${hexAssetPath}building-wizard-tower.glb`,
  `${hexAssetPath}unit-wall-tower.glb`,
  `${hexAssetPath}path-straight.glb`,
  `${hexAssetPath}path-corner.glb`,
  `${hexAssetPath}path-end.glb`,
  `${hexAssetPath}path-crossing.glb`,
  `${hexAssetPath}path-intersectionA.glb`,
  `${hexAssetPath}path-intersectionB.glb`,
  `${hexAssetPath}path-intersectionC.glb`,
  `${hexAssetPath}path-intersectionD.glb`,
  `${hexAssetPath}path-intersectionE.glb`,
  `${hexAssetPath}path-intersectionF.glb`,
  `${hexAssetPath}path-intersectionG.glb`,
  `${hexAssetPath}path-intersectionH.glb`,
  `${hexAssetPath}path-square.glb`,
  `${arenaAssetPath}wall-gate.glb`,
  `${arenaAssetPath}banner.glb`,
  `${arenaAssetPath}wall.glb`,
  `${arenaAssetPath}column.glb`,
  `${arenaAssetPath}statue.glb`,
  `${arenaAssetPath}character-soldier.glb`,
  DRAGON_ASSET_PATH,
  ...controllableLandmarkList.map((asset) => `${hexAssetPath}${asset.type}.glb`),
].forEach((assetUrl) => useGLTF.preload(assetUrl));
