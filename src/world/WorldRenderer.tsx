import { Text, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { SceneSpec, WorldStyle, ZoneSpec } from "./sceneSpec";
import { buildStudioWorldLayout, type StudioWorldLayout } from "./studioWorldLayout";

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

type TerrainTile = {
  key: string;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  tint?: string;
  tintStrength?: number;
};

type HexCellCoord = {
  q: number;
  r: number;
};

type HexCell = HexCellCoord & {
  key: string;
  position: [number, number, number];
  noise: number;
  distance: number;
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

const MODEL_HEX_HEIGHT = 1.154700517654419;
const MODEL_HEX_SIDE = MODEL_HEX_HEIGHT / 2;
const BASE_TILE_SCALE = 1.002;

export function WorldRenderer({ spec }: WorldRendererProps) {
  const palette = paletteByStyle[spec.style];
  const layout = useMemo(() => buildStudioWorldLayout(spec.zones), [spec.zones]);
  const routeNetwork = useMemo(() => buildRouteNetwork(layout), [layout]);
  const anchorByZoneId = useMemo(
    () => new Map(layout.anchors.map((anchor) => [anchor.zone.id, anchor.position])),
    [layout.anchors],
  );
  const mainStageAnchor = layout.anchors.find((anchor) => anchor.zone.type === "main_stage");
  const trackAnchor = layout.anchors.find((anchor) => anchor.zone.type === "track_zone");

  return (
    <group>
      <HexTerrain spec={spec} style={spec.style} rim={palette.rim} glow={palette.glow} layout={layout} />
      <RouteNetwork routeNetwork={routeNetwork} />
      {mainStageAnchor && trackAnchor ? (
        <TransitSoldier
          startPosition={[mainStageAnchor.position[0] + 0.72, 0.24, mainStageAnchor.position[2] + 2.4]}
          endPosition={[trackAnchor.position[0] - 0.58, 0.24, trackAnchor.position[2] + 1.12]}
          tint="#FF6B3D"
          tintStrength={0.9}
          scale={0.96}
          speed={0.14}
        />
      ) : null}
      {spec.zones.map((zone) => (
        <ZonePrefab key={zone.id} zone={zone} style={spec.style} overridePosition={anchorByZoneId.get(zone.id)} />
      ))}
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
    const requested = actions[clip] ?? actions.walk ?? actions.idle;
    if (!requested) return;

    requested.reset();
    requested.fadeIn(0.2);
    requested.play();
    requested.timeScale = clip === "walk" ? 1.15 : 1;

    return () => {
      requested.fadeOut(0.2);
      requested.stop();
    };
  }, [actions, clip]);

  return <primitive ref={rootRef} object={scene} position={position} rotation={rotation} scale={scale} />;
}

function TransitSoldier({
  startPosition,
  endPosition,
  tint,
  tintStrength,
  scale,
  speed,
}: {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  tint: string;
  tintStrength: number;
  scale: number;
  speed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const start = useMemo(() => new THREE.Vector3(...startPosition), [startPosition]);
  const end = useMemo(() => new THREE.Vector3(...endPosition), [endPosition]);
  const current = useMemo(() => new THREE.Vector3(), []);
  const lookAhead = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const base = (Math.sin(state.clock.elapsedTime * speed * Math.PI * 2) + 1) / 2;
    const next = (Math.sin((state.clock.elapsedTime + 0.05) * speed * Math.PI * 2) + 1) / 2;
    const bob = Math.sin(state.clock.elapsedTime * speed * Math.PI * 8) * 0.018;

    current.lerpVectors(start, end, base);
    lookAhead.lerpVectors(start, end, next);

    groupRef.current.position.set(current.x, current.y + bob, current.z);
    groupRef.current.rotation.y = Math.atan2(lookAhead.x - current.x, lookAhead.z - current.z + 0.0001);
  });

  return (
    <group ref={groupRef}>
      <AnimatedSoldierModel
        position={[0, 0, 0]}
        scale={scale}
        tint={tint}
        tintStrength={tintStrength}
        clip="walk"
      />
      <mesh position={[0, 1.5, 0]} renderOrder={30}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#FFD056" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={29}>
        <ringGeometry args={[0.42, 0.58, 32]} />
        <meshBasicMaterial color="#FFD056" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} color="#FFD056" intensity={1.4} distance={3.8} />
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
            url={`${hexAssetPath}building-castle.glb`}
            position={[0, 0.22, 0]}
            rotation={[0, Math.PI / 6, 0]}
            scale={1.06}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}building-walls.glb`}
            position={[0, 0.19, -1.18]}
            rotation={[0, Math.PI / 6, 0]}
            scale={0.64}
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
            url={`${hexAssetPath}building-archery.glb`}
            position={[0, 0.18, 0]}
            rotation={[0, -0.28, 0]}
            scale={0.84}
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
            url={`${hexAssetPath}building-market.glb`}
            position={[-0.42, 0.18, 0.12]}
            rotation={[0, -0.34, 0]}
            scale={0.74}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}building-cabin.glb`}
            position={[0.58, 0.18, 0.18]}
            rotation={[0, 0.38, 0]}
            scale={0.64}
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
            url={`${hexAssetPath}building-village.glb`}
            position={[-0.1, 0.18, 0.1]}
            rotation={[0, -0.2, 0]}
            scale={0.72}
            tint={tint}
            tintStrength={tintStrength}
          />
          <PrefabModel
            url={`${hexAssetPath}building-tower.glb`}
            position={[0.86, 0.18, 0.64]}
            rotation={[0, 0.24, 0]}
            scale={0.62}
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
            url={`${hexAssetPath}bridge.glb`}
            position={[0, 0.18, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.86}
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
          width={0.2}
          color="#7D5731"
          coreColor="#D7B27A"
        />
      ))}
      <RouteRibbon
        points={routeNetwork.riverRoute}
        y={0.1}
        width={0.26}
        color="#2B6798"
        coreColor="#84D8FF"
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
            <boxGeometry args={[segment.length, 0.018, width]} />
            <meshStandardMaterial color={color} roughness={0.94} metalness={0} transparent opacity={0.92} />
          </mesh>
          <mesh position={[segment.midX, y + 0.002, segment.midZ]} rotation={[0, segment.yaw, 0]} receiveShadow renderOrder={15}>
            <boxGeometry args={[segment.length * 0.98, 0.01, width * 0.62]} />
            <meshStandardMaterial color={coreColor} roughness={0.88} metalness={0} transparent opacity={0.94} />
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

function buildTerrainTiles(spec: SceneSpec, style: WorldStyle, layout: StudioWorldLayout): TerrainTile[] {
  const tileSize = MODEL_HEX_SIDE;
  const cellMap = new Map<string, HexCell>();
  const searchRadius = layout.tileRadius;
  const supportRadiusWithBleed = layout.supportRadius + MODEL_HEX_HEIGHT * 0.62;

  for (let q = -searchRadius; q <= searchRadius; q += 1) {
    for (let r = -searchRadius; r <= searchRadius; r += 1) {
      const position = axialToWorld(q, r, tileSize);
      if (Math.hypot(position[0], position[2]) > supportRadiusWithBleed) continue;

      cellMap.set(hexKey(q, r), {
        q,
        r,
        key: hexKey(q, r),
        position,
        noise: terrainNoise(q, r, style),
        distance: Math.hypot(position[0], position[2]),
      });
    }
  }

  const zoneAnchors = layout.anchors;
  const stageAnchor = zoneAnchors.find((anchor) => anchor.zone.type === "main_stage") ?? zoneAnchors[0];
  const plazaCells = new Set<string>();
  const pathCells = new Set<string>();
  const riverCells = new Set<string>();
  const forestCells = new Set<string>();
  const stoneCells = new Set<string>();
  const sandCells = new Set<string>();
  const pathEdges = new Set<string>();
  const riverEdges = new Set<string>();

  for (const anchor of zoneAnchors) {
    const plazaRadius = anchor.zone.type === "main_stage" ? 2 : 1;
    for (const cell of hexDisk(anchor.cell, plazaRadius)) {
      if (cellMap.has(hexKey(cell.q, cell.r))) {
        plazaCells.add(hexKey(cell.q, cell.r));
      }
    }
  }

  for (const anchor of zoneAnchors) {
    if (anchor === stageAnchor) continue;
    addPathToEdgeSet(pathEdges, hexLine(stageAnchor.cell, anchor.cell));
  }

  for (const anchor of zoneAnchors) {
    const plazaRadius = anchor.zone.type === "main_stage" ? 2 : 1;
    const route = hexLine(stageAnchor.cell, anchor.cell);
    const lastRouteCell = route[route.length - 1];
    if (!lastRouteCell) continue;

    const connectedNeighbor = nearestCellInDisk(lastRouteCell, hexDisk(anchor.cell, plazaRadius), (candidate) =>
      cellMap.has(hexKey(candidate.q, candidate.r)),
    );

    if (connectedNeighbor) {
      pathEdges.add(edgeKey(lastRouteCell, connectedNeighbor));
    }
  }

  for (const cellKey of edgeCellsFromSet(pathEdges)) {
    if (!plazaCells.has(cellKey) && cellMap.has(cellKey)) {
      pathCells.add(cellKey);
    }
  }

  const riverWaypoints = [
    nearestExistingCell(cellMap, { q: -Math.max(4, Math.floor(searchRadius * 0.7)), r: 3 }),
    nearestExistingCell(cellMap, { q: -3, r: 2 }),
    nearestExistingCell(cellMap, { q: -1, r: 0 }),
    nearestExistingCell(cellMap, { q: 2, r: -1 }),
    nearestExistingCell(cellMap, { q: Math.max(4, Math.floor(searchRadius * 0.72)), r: -3 }),
  ];

  for (let index = 0; index < riverWaypoints.length - 1; index += 1) {
    addPathToEdgeSet(riverEdges, hexLine(riverWaypoints[index], riverWaypoints[index + 1]));
  }

  for (const cellKey of edgeCellsFromSet(riverEdges)) {
    if (!plazaCells.has(cellKey) && cellMap.has(cellKey)) {
      riverCells.add(cellKey);
    }
  }

  for (const cell of cellMap.values()) {
    if (plazaCells.has(cell.key) || pathCells.has(cell.key) || riverCells.has(cell.key)) continue;

    if (cell.distance > layout.supportRadius - 1.75 && cell.noise > 0.66) forestCells.add(cell.key);
    else if (cell.distance > layout.supportRadius - 1.35 && cell.noise > 0.52) stoneCells.add(cell.key);
    else if (cell.noise < 0.16) sandCells.add(cell.key);
  }

  const tiles: TerrainTile[] = [];

  for (const cell of cellMap.values()) {
    let asset = `${hexAssetPath}grass.glb`;
    let tint: string | undefined;
    let tintStrength = 0;

    if (plazaCells.has(cell.key)) {
      asset = cell.noise > 0.5 ? `${hexAssetPath}sand.glb` : `${hexAssetPath}grass.glb`;
    } else if (forestCells.has(cell.key)) {
      asset = `${hexAssetPath}grass-forest.glb`;
    } else if (stoneCells.has(cell.key)) {
      asset = cell.noise > 0.74 ? `${hexAssetPath}stone-mountain.glb` : `${hexAssetPath}stone-rocks.glb`;
    } else if (sandCells.has(cell.key)) {
      asset = cell.noise < 0.07 ? `${hexAssetPath}sand-rocks.glb` : `${hexAssetPath}sand.glb`;
    } else if (cell.noise > 0.63) {
      asset = `${hexAssetPath}grass-hill.glb`;
    }

    if (style === "animation" && !asset.includes("water") && !asset.includes("path")) {
      tint = "#B6E4DD";
      tintStrength = 0.12;
    }

    if (style === "voxel" && asset.includes("grass")) {
      tint = "#8DCB78";
      tintStrength = 0.15;
    }

    tiles.push({
      key: `base-${cell.key}`,
      url: asset,
      position: cell.position,
      rotation: [0, 0, 0],
      scale: BASE_TILE_SCALE,
      tint,
      tintStrength,
    });

    void pathCells;
    void riverCells;
    void pathEdges;
    void riverEdges;
    void plazaCells;
  }

  return tiles;
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

function axialToWorld(q: number, r: number, size: number): [number, number, number] {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const z = size * 1.5 * r;
  return [x, 0, z];
}

function roundAxial(q: number, r: number) {
  const x = q;
  const z = r;
  const y = -x - z;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: rz };
}

function terrainNoise(q: number, r: number, style: WorldStyle) {
  const seed = style === "game" ? 17 : style === "animation" ? 29 : 41;
  const raw = Math.sin(q * 12.9898 + r * 78.233 + seed) * 43758.5453;
  return raw - Math.floor(raw);
}

function hexKey(q: number, r: number) {
  return `${q}:${r}`;
}

function hexDisk(center: HexCellCoord, radius: number) {
  const cells: HexCellCoord[] = [];
  for (let dq = -radius; dq <= radius; dq += 1) {
    for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr += 1) {
      cells.push({ q: center.q + dq, r: center.r + dr });
    }
  }
  return cells;
}

function hexLine(a: HexCellCoord, b: HexCellCoord) {
  const distance = hexDistance(a, b);
  const cells: HexCellCoord[] = [];

  for (let step = 0; step <= distance; step += 1) {
    const t = distance === 0 ? 0 : step / distance;
    cells.push(roundAxial(THREE.MathUtils.lerp(a.q, b.q, t), THREE.MathUtils.lerp(a.r, b.r, t)));
  }

  return dedupeCells(cells);
}

function hexDistance(a: HexCellCoord, b: HexCellCoord) {
  const as = -a.q - a.r;
  const bs = -b.q - b.r;
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(as - bs));
}

function dedupeCells(cells: HexCellCoord[]) {
  const seen = new Set<string>();
  return cells.filter((cell) => {
    const key = hexKey(cell.q, cell.r);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function nearestExistingCell(cellMap: Map<string, HexCell>, preferred: HexCellCoord) {
  if (cellMap.has(hexKey(preferred.q, preferred.r))) return preferred;

  let bestCell: HexCellCoord | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const cell of cellMap.values()) {
    const distance = hexDistance(cell, preferred);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestCell = { q: cell.q, r: cell.r };
    }
  }

  return bestCell ?? preferred;
}

function nearestCellInDisk(origin: HexCellCoord, candidates: HexCellCoord[], predicate: (candidate: HexCellCoord) => boolean) {
  let best: HexCellCoord | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (!predicate(candidate)) continue;
    const distance = hexDistance(origin, candidate);
    if (distance > 0 && distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best;
}

function edgeKey(a: HexCellCoord, b: HexCellCoord) {
  const aKey = hexKey(a.q, a.r);
  const bKey = hexKey(b.q, b.r);
  return aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
}

function addPathToEdgeSet(edgeSet: Set<string>, cells: HexCellCoord[]) {
  for (let index = 0; index < cells.length - 1; index += 1) {
    edgeSet.add(edgeKey(cells[index], cells[index + 1]));
  }
}

function edgeCellsFromSet(edgeSet: Set<string>) {
  const cells = new Set<string>();
  for (const edge of edgeSet) {
    const [a, b] = edge.split("|");
    cells.add(a);
    cells.add(b);
  }
  return cells;
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
  `${hexAssetPath}building-walls.glb`,
  `${hexAssetPath}unit-wall-tower.glb`,
  `${hexAssetPath}building-archery.glb`,
  `${hexAssetPath}building-market.glb`,
  `${hexAssetPath}building-cabin.glb`,
  `${hexAssetPath}building-village.glb`,
  `${hexAssetPath}building-tower.glb`,
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
  `${hexAssetPath}bridge.glb`,
  `${arenaAssetPath}wall-gate.glb`,
  `${arenaAssetPath}banner.glb`,
  `${arenaAssetPath}wall.glb`,
  `${arenaAssetPath}column.glb`,
  `${arenaAssetPath}statue.glb`,
  `${arenaAssetPath}character-soldier.glb`,
].forEach((assetUrl) => useGLTF.preload(assetUrl));
