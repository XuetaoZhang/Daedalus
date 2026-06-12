import { Text, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { SceneSpec, WorldStyle, ZoneSpec } from "./sceneSpec";

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

export function WorldRenderer({ spec }: WorldRendererProps) {
  const palette = paletteByStyle[spec.style];

  return (
    <group>
      <HexTerrain spec={spec} style={spec.style} rim={palette.rim} glow={palette.glow} />
      {spec.zones.map((zone) => (
        <ZonePrefab key={zone.id} zone={zone} style={spec.style} />
      ))}
    </group>
  );
}

type TerrainTile = {
  key: string;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  tint?: string;
  tintStrength?: number;
};

function HexTerrain({ spec, style, rim, glow }: { spec: SceneSpec; style: WorldStyle; rim: string; glow: string }) {
  const tiles = useMemo(() => buildTerrainTiles(spec, style), [spec, style]);

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
        <cylinderGeometry args={[7.5, 7.86, 0.28, 96]} />
        <meshStandardMaterial color={rim} roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[6.65, 6.86, 96]} />
        <meshBasicMaterial color={glow} transparent opacity={0.2} />
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

type HexCell = {
  q: number;
  r: number;
  key: string;
  position: [number, number, number];
  noise: number;
  distance: number;
};

const HEX_DIRECTIONS: Array<{ q: number; r: number }> = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

const MODEL_HEX_HEIGHT = 1.154700517654419;
const MODEL_HEX_SIDE = MODEL_HEX_HEIGHT / 2;
const BASE_TILE_SCALE = 1.002;
const OVERLAY_TILE_Y = 0.012;

function buildTerrainTiles(spec: SceneSpec, style: WorldStyle): TerrainTile[] {
  const tileRadius = 4;
  const tileSize = MODEL_HEX_SIDE;
  const cellMap = new Map<string, HexCell>();

  for (let q = -tileRadius; q <= tileRadius; q += 1) {
    for (let r = -tileRadius; r <= tileRadius; r += 1) {
      const s = -q - r;
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > tileRadius) continue;

      const position = axialToWorld(q, r, tileSize);
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

  const zoneAnchors = spec.zones.map((zone) => {
    const axial = worldToAxial(zone.position[0], zone.position[2], tileSize);
    const cell = roundAxial(axial.q, axial.r);
    return {
      zone,
      cell,
    };
  });

  const stageAnchor = zoneAnchors.find((anchor) => anchor.zone.type === "main_stage") ?? zoneAnchors[0];
  const plazaCells = new Set<string>();
  const pathCells = new Set<string>();
  const riverCells = new Set<string>();
  const forestCells = new Set<string>();
  const stoneCells = new Set<string>();
  const sandCells = new Set<string>();

  for (const anchor of zoneAnchors) {
    const plazaRadius = anchor.zone.type === "main_stage" ? 2 : 1;
    for (const cell of hexDisk(anchor.cell, plazaRadius)) {
      plazaCells.add(hexKey(cell.q, cell.r));
    }
    for (const cell of hexRing(anchor.cell, plazaRadius + 1)) {
      pathCells.add(hexKey(cell.q, cell.r));
    }
  }

  for (const anchor of zoneAnchors) {
    if (anchor === stageAnchor) continue;
    for (const cell of hexLine(stageAnchor.cell, anchor.cell)) {
      pathCells.add(hexKey(cell.q, cell.r));
    }
  }

  for (const cell of hexLine({ q: -tileRadius, r: 1 }, { q: tileRadius - 1, r: -2 })) {
    const key = hexKey(cell.q, cell.r);
    if (!plazaCells.has(key)) riverCells.add(key);
  }

  for (const cell of cellMap.values()) {
    if (plazaCells.has(cell.key) || pathCells.has(cell.key) || riverCells.has(cell.key)) continue;

    if (cell.distance > 4.6 && cell.noise > 0.68) forestCells.add(cell.key);
    else if (cell.distance > 4.4 && cell.noise > 0.52) stoneCells.add(cell.key);
    else if (cell.noise < 0.18) sandCells.add(cell.key);
  }

  const tiles: TerrainTile[] = [];

  for (const cell of cellMap.values()) {
    let asset = `${hexAssetPath}grass.glb`;
    let tint: string | undefined;
    let tintStrength = 0;

    if (plazaCells.has(cell.key)) {
      asset = cell.noise > 0.52 ? `${hexAssetPath}sand.glb` : `${hexAssetPath}grass.glb`;
    } else if (forestCells.has(cell.key)) {
      asset = `${hexAssetPath}grass-forest.glb`;
    } else if (stoneCells.has(cell.key)) {
      asset = cell.noise > 0.72 ? `${hexAssetPath}stone-mountain.glb` : `${hexAssetPath}stone-rocks.glb`;
    } else if (sandCells.has(cell.key)) {
      asset = cell.noise < 0.08 ? `${hexAssetPath}sand-rocks.glb` : `${hexAssetPath}sand.glb`;
    } else if (cell.noise > 0.62) {
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

    if (riverCells.has(cell.key)) {
      const mask = neighborMask(cell, riverCells);
      const riverTile = selectTileFromMask(mask, "river");
      if (riverTile !== "water") {
        tiles.push({
          key: `river-${cell.key}`,
          url: `${hexAssetPath}${riverTile}.glb`,
          position: [cell.position[0], OVERLAY_TILE_Y, cell.position[2]],
          rotation: [0, tileRotationFromMask(mask), 0],
          scale: 1,
        });
      }
    } else if (pathCells.has(cell.key)) {
      const mask = neighborMask(cell, pathCells, plazaCells);
      const pathTile = selectTileFromMask(mask, "path");
      tiles.push({
        key: `path-${cell.key}`,
        url: pathTile === "path-square" ? `${hexAssetPath}path-square.glb` : `${hexAssetPath}${pathTile}.glb`,
        position: [cell.position[0], OVERLAY_TILE_Y, cell.position[2]],
        rotation: [0, tileRotationFromMask(mask), 0],
        scale: 1,
      });
    }
  }

  return tiles;
}

function axialToWorld(q: number, r: number, size: number): [number, number, number] {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const z = size * 1.5 * r;
  return [x, 0, z];
}

function worldToAxial(x: number, z: number, size: number) {
  return {
    q: (Math.sqrt(3) / 3 * x - 1 / 3 * z) / size,
    r: (2 / 3 * z) / size,
  };
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

function hexDisk(center: { q: number; r: number }, radius: number) {
  const cells: Array<{ q: number; r: number }> = [];
  for (let dq = -radius; dq <= radius; dq += 1) {
    for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr += 1) {
      cells.push({ q: center.q + dq, r: center.r + dr });
    }
  }
  return cells;
}

function hexRing(center: { q: number; r: number }, radius: number) {
  if (radius <= 0) return [center];
  const cells: Array<{ q: number; r: number }> = [];
  let current = {
    q: center.q + HEX_DIRECTIONS[4].q * radius,
    r: center.r + HEX_DIRECTIONS[4].r * radius,
  };
  for (let side = 0; side < 6; side += 1) {
    for (let step = 0; step < radius; step += 1) {
      cells.push({ ...current });
      current = {
        q: current.q + HEX_DIRECTIONS[side].q,
        r: current.r + HEX_DIRECTIONS[side].r,
      };
    }
  }
  return cells;
}

function hexLine(a: { q: number; r: number }, b: { q: number; r: number }) {
  const distance = hexDistance(a, b);
  const cells: Array<{ q: number; r: number }> = [];
  for (let step = 0; step <= distance; step += 1) {
    const t = distance === 0 ? 0 : step / distance;
    cells.push(roundAxial(THREE.MathUtils.lerp(a.q, b.q, t), THREE.MathUtils.lerp(a.r, b.r, t)));
  }
  return dedupeCells(cells);
}

function hexDistance(a: { q: number; r: number }, b: { q: number; r: number }) {
  const as = -a.q - a.r;
  const bs = -b.q - b.r;
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(as - bs));
}

function dedupeCells(cells: Array<{ q: number; r: number }>) {
  const seen = new Set<string>();
  return cells.filter((cell) => {
    const key = hexKey(cell.q, cell.r);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function neighborMask(cell: { q: number; r: number }, primary: Set<string>, secondary?: Set<string>) {
  const mask: number[] = [];
  for (let index = 0; index < HEX_DIRECTIONS.length; index += 1) {
    const direction = HEX_DIRECTIONS[index];
    const key = hexKey(cell.q + direction.q, cell.r + direction.r);
    if (primary.has(key) || secondary?.has(key)) {
      mask.push(index);
    }
  }
  return mask;
}

function selectTileFromMask(mask: number[], family: "path" | "river") {
  if (mask.length >= 3) return `${family}-crossing`;
  if (mask.length === 2) {
    const [a, b] = [...mask].sort((left, right) => left - right);
    const diff = (b - a + 6) % 6;
    return diff === 3 ? `${family}-straight` : `${family}-corner`;
  }
  if (mask.length === 1) return `${family}-end`;
  return family === "path" ? "path-square" : "water";
}

function tileRotationFromMask(mask: number[]) {
  if (mask.length === 0) return 0;
  const sorted = [...mask].sort((a, b) => a - b);
  if (mask.length === 2) {
    const diff = (sorted[1] - sorted[0] + 6) % 6;
    if (diff === 3) {
      return (Math.PI / 3) * sorted[0];
    }
  }
  return (Math.PI / 3) * sorted[0];
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
