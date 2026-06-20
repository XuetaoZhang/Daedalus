import * as THREE from "three";
import type { SceneSpec, WorldStyle } from "../sceneSpec";
import type { StudioWorldLayout } from "../studioWorldLayout";
import type {
  HexCell,
  HexCellCoord,
  TerrainBiome,
  TerrainDirective,
  TerrainDirectiveRegion,
  TerrainDirectiveType,
  TerrainFeature,
  TerrainPlan,
  TerrainPlanCell,
  TerrainProfile,
  TerrainTile,
} from "./terrainTypes";

export const MODEL_HEX_HEIGHT = 1.154700517654419;
export const MODEL_HEX_SIDE = MODEL_HEX_HEIGHT / 2;
export const BASE_TILE_SCALE = 1.002;

const hexAssetPath = "/kenney_hexagon-kit/Models/GLB%20format/";

export function terrainProfileForPrompt(prompt: string): TerrainProfile {
  const normalized = prompt.toLowerCase();

  if (/(海|海边|海岸|coast|coastal|beach|bay)/i.test(prompt)) return "coastal";
  if (/(森林|林地|forest|woods)/i.test(prompt)) return "forest";
  if (/(山|山区|山地|mountain|mountains|highland)/i.test(prompt)) return "mountain";
  if (/(河|河流|river|stream)/i.test(prompt)) return "river";
  if (/(平原|草原|plain|plains|meadow)/i.test(prompt)) return "plain";
  if (normalized.includes("mixed")) return "mixed";

  return "mixed";
}

export function terrainSeedFromPrompt(prompt: string, fallback = 1701) {
  let hash = fallback;

  for (let index = 0; index < prompt.length; index += 1) {
    hash = (hash * 31 + prompt.charCodeAt(index)) % 100000;
  }

  return hash;
}

export function buildTerrainTiles(spec: SceneSpec, style: WorldStyle, layout: StudioWorldLayout): TerrainTile[] {
  const plan = buildTerrainPlan(spec, style, layout);
  return plan.cells.map((cell) => terrainCellToTile(cell, style));
}

export function buildTerrainPlan(spec: SceneSpec, style: WorldStyle, layout: StudioWorldLayout): TerrainPlan {
  const profile = spec.terrainProfile ?? "mixed";
  const seed = spec.terrainSeed ?? (style === "game" ? 17 : style === "animation" ? 29 : 41);
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
        noise: terrainNoise(q, r, seed),
        distance: Math.hypot(position[0], position[2]),
      });
    }
  }

  const zoneAnchors = layout.anchors;
  const stageAnchor = zoneAnchors.find((anchor) => anchor.zone.type === "main_stage") ?? zoneAnchors[0];
  const plazaCells = new Set<string>();
  const pathCells = new Set<string>();
  const riverCells = new Set<string>();
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

  const cells: TerrainPlanCell[] = [];

  for (const cell of cellMap.values()) {
    let feature: TerrainFeature | undefined;
    if (plazaCells.has(cell.key)) feature = "plaza";
    else if (pathCells.has(cell.key)) feature = "path";
    else if (riverCells.has(cell.key)) feature = "river";

    cells.push({
      ...cell,
      biome: feature
        ? protectedFeatureBiome(feature, cell)
        : applyTerrainDirectives(
            terrainBiomeForCell(cell, profile, layout),
            cell,
            layout,
            spec.terrainDirectives ?? [],
          ),
      feature,
    });
  }

  return { cells, profile, seed };
}

function terrainCellToTile(cell: TerrainPlanCell, style: WorldStyle): TerrainTile {
  const asset = assetForTerrainCell(cell);
  let tint: string | undefined;
  let tintStrength = 0;

  if (style === "animation" && !asset.includes("water") && !asset.includes("river") && !asset.includes("path")) {
    tint = "#B6E4DD";
    tintStrength = 0.12;
  }

  if (style === "voxel" && asset.includes("grass")) {
    tint = "#8DCB78";
    tintStrength = 0.15;
  }

  return {
    key: `base-${cell.key}`,
    url: asset,
    position: cell.position,
    rotation: [0, 0, 0],
    scale: BASE_TILE_SCALE,
    tint,
    tintStrength,
  };
}

function assetForTerrainCell(cell: TerrainPlanCell) {
  if (cell.feature === "path") return cell.noise > 0.52 ? `${hexAssetPath}sand.glb` : `${hexAssetPath}grass.glb`;
  if (cell.feature === "river") return cell.noise > 0.72 ? `${hexAssetPath}water-rocks.glb` : `${hexAssetPath}water.glb`;
  if (cell.feature === "plaza") return cell.noise > 0.54 ? `${hexAssetPath}sand.glb` : `${hexAssetPath}grass.glb`;

  switch (cell.biome) {
    case "sand":
      return cell.noise < 0.13 ? `${hexAssetPath}sand-rocks.glb` : `${hexAssetPath}sand.glb`;
    case "forest":
      return `${hexAssetPath}grass-forest.glb`;
    case "hill":
      return `${hexAssetPath}grass-hill.glb`;
    case "stone":
      return cell.noise > 0.72 ? `${hexAssetPath}stone-rocks.glb` : `${hexAssetPath}stone.glb`;
    case "mountain":
      return cell.noise > 0.62 ? `${hexAssetPath}stone-mountain.glb` : `${hexAssetPath}stone-hill.glb`;
    case "water":
      return `${hexAssetPath}water.glb`;
    case "waterRocks":
      return cell.noise > 0.58 ? `${hexAssetPath}water-rocks.glb` : `${hexAssetPath}water-island.glb`;
    case "grass":
    default:
      return cell.noise > 0.68 ? `${hexAssetPath}grass-hill.glb` : `${hexAssetPath}grass.glb`;
  }
}

function protectedFeatureBiome(feature: TerrainFeature, cell: HexCell): TerrainBiome {
  if (feature === "river") return cell.noise > 0.72 ? "waterRocks" : "water";
  if (feature === "path") return "sand";
  return cell.noise > 0.54 ? "sand" : "grass";
}

function applyTerrainDirectives(
  biome: TerrainBiome,
  cell: HexCell,
  layout: StudioWorldLayout,
  directives: TerrainDirective[],
): TerrainBiome {
  let nextBiome = biome;

  for (const directive of directives) {
    const influence = terrainDirectiveInfluence(cell, layout, directive);
    if (influence <= 0) continue;

    const threshold = directive.density === "dense" ? 0.24 : directive.density === "light" ? 0.52 : 0.38;
    const variation = directiveNoise(cell.q, cell.r, directive.type, directive.region);
    if (influence * 0.72 + variation * 0.28 < threshold) continue;

    nextBiome = biomeForDirective(directive.type, cell, influence);
  }

  return nextBiome;
}

function biomeForDirective(type: TerrainDirectiveType, cell: HexCell, influence: number): TerrainBiome {
  switch (type) {
    case "water":
      return cell.noise > 0.72 || influence < 0.42 ? "waterRocks" : "water";
    case "forest":
      return cell.noise > 0.86 && influence < 0.62 ? "hill" : "forest";
    case "mountain":
      return cell.noise > 0.42 || influence > 0.66 ? "mountain" : "stone";
    case "sand":
      return influence > 0.7 || cell.noise > 0.22 ? "sand" : "grass";
    case "plain":
    default:
      return cell.noise > 0.86 ? "hill" : "grass";
  }
}

function terrainDirectiveInfluence(cell: HexCell, layout: StudioWorldLayout, directive: TerrainDirective) {
  const [centerX, centerZ] = terrainRegionCenter(layout, directive.region);
  const radius = terrainDirectiveRadius(layout, directive);
  const distance = Math.hypot(cell.position[0] - centerX, cell.position[2] - centerZ);
  const base = 1 - THREE.MathUtils.clamp(distance / Math.max(radius, 0.001), 0, 1);

  if (base <= 0) return 0;

  if (directive.shape === "linear") {
    const axisDistance =
      directive.region === "north" || directive.region === "south"
        ? Math.abs(cell.position[0] - centerX)
        : Math.abs(cell.position[2] - centerZ);
    return base * (1 - THREE.MathUtils.clamp(axisDistance / Math.max(radius * 0.42, 0.001), 0, 1));
  }

  if (directive.shape === "crescent") {
    const innerDistance = Math.abs(distance - radius * 0.52);
    const crescent = 1 - THREE.MathUtils.clamp(innerDistance / Math.max(radius * 0.32, 0.001), 0, 1);
    return Math.max(base * 0.45, crescent * base);
  }

  if (directive.shape === "soft") {
    return base * base;
  }

  return base;
}

function terrainDirectiveRadius(layout: StudioWorldLayout, directive: TerrainDirective) {
  const base =
    directive.region === "center_ring"
      ? layout.supportRadius * 0.42
      : directive.region === "outer_ring"
        ? layout.supportRadius * 0.9
        : layout.supportRadius * 0.46;
  const sizeMultiplier = directive.size === "large" ? 1.22 : directive.size === "small" ? 0.72 : 1;
  return base * sizeMultiplier;
}

function terrainRegionCenter(layout: StudioWorldLayout, region: TerrainDirectiveRegion): [number, number] {
  const radius = layout.supportRadius * 0.62;
  const diagonalX = radius * 0.72;
  const diagonalZ = radius * 0.72;

  switch (region) {
    case "north":
      return [0, -radius];
    case "south":
      return [0, radius];
    case "east":
      return [radius, 0];
    case "west":
      return [-radius, 0];
    case "northwest":
      return [-diagonalX, -diagonalZ];
    case "northeast":
      return [diagonalX, -diagonalZ];
    case "southwest":
      return [-diagonalX, diagonalZ];
    case "southeast":
      return [diagonalX, diagonalZ];
    case "outer_ring":
      return [0, 0];
    case "center_ring":
    default:
      return [layout.bounds.centerX, layout.bounds.centerZ];
  }
}

function terrainBiomeForCell(cell: HexCell, profile: TerrainProfile, layout: StudioWorldLayout): TerrainBiome {
  const edgeRatio = THREE.MathUtils.clamp(cell.distance / Math.max(layout.supportRadius, 0.001), 0, 1);
  const directional = directionalNoise(cell.q, cell.r);
  const profileNoise = cell.noise;

  switch (profile) {
    case "coastal":
      return coastalBiome(cell, edgeRatio, directional, profileNoise);
    case "forest":
      return forestBiome(edgeRatio, directional, profileNoise);
    case "mountain":
      return mountainBiome(edgeRatio, directional, profileNoise);
    case "river":
      return riverProfileBiome(cell, edgeRatio, directional, profileNoise);
    case "plain":
      return plainBiome(edgeRatio, directional, profileNoise);
    case "mixed":
    default:
      return mixedBiome(edgeRatio, directional, profileNoise);
  }
}

function coastalBiome(cell: HexCell, edgeRatio: number, directional: number, noise: number): TerrainBiome {
  const southernCoast = cell.position[2] > 0 && edgeRatio > 0.63 + directional * 0.12;
  const westernBay = cell.position[0] < -1.2 && cell.position[2] > 0.6 && edgeRatio > 0.55 + noise * 0.12;

  if (southernCoast || westernBay) {
    if (noise > 0.68) return "waterRocks";
    return "water";
  }

  if (cell.position[2] > 0 && edgeRatio > 0.47) return noise > 0.5 ? "sand" : "grass";
  if (noise > 0.76 && edgeRatio > 0.45) return "forest";
  if (noise > 0.88) return "hill";
  return "grass";
}

function forestBiome(edgeRatio: number, directional: number, noise: number): TerrainBiome {
  if (noise + directional * 0.24 > 0.48) return "forest";
  if (edgeRatio > 0.78 && noise > 0.34) return "forest";
  if (noise < 0.1 && edgeRatio > 0.72) return "sand";
  if (noise > 0.78) return "hill";
  return "grass";
}

function mountainBiome(edgeRatio: number, directional: number, noise: number): TerrainBiome {
  if (edgeRatio > 0.64 && noise + directional * 0.18 > 0.36) return "mountain";
  if (noise > 0.78) return "stone";
  if (noise > 0.58 && edgeRatio > 0.34) return "hill";
  if (noise < 0.08 && edgeRatio > 0.76) return "sand";
  return "grass";
}

function riverProfileBiome(cell: HexCell, edgeRatio: number, directional: number, noise: number): TerrainBiome {
  const channel = Math.abs(cell.r + Math.round(cell.q * 0.45) - 1);
  if (channel <= 1 && edgeRatio > 0.28 && noise + directional * 0.2 > 0.18) {
    return noise > 0.72 ? "waterRocks" : "water";
  }
  if (channel === 2 && noise > 0.36) return noise > 0.64 ? "forest" : "sand";
  if (noise > 0.74) return "forest";
  if (noise > 0.58) return "hill";
  return "grass";
}

function plainBiome(edgeRatio: number, directional: number, noise: number): TerrainBiome {
  if (edgeRatio > 0.84 && noise > 0.72) return "forest";
  if (edgeRatio > 0.86 && noise < 0.22) return "sand";
  if (noise + directional * 0.08 > 0.82) return "hill";
  return "grass";
}

function mixedBiome(edgeRatio: number, directional: number, noise: number): TerrainBiome {
  if (edgeRatio > 0.82 && noise > 0.66) return "forest";
  if (edgeRatio > 0.74 && noise > 0.52) return noise > 0.74 ? "mountain" : "stone";
  if (noise < 0.16) return noise < 0.07 ? "sand" : "sand";
  if (noise + directional * 0.08 > 0.63) return "hill";
  return "grass";
}

export function axialToWorld(q: number, r: number, size: number): [number, number, number] {
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

function terrainNoise(q: number, r: number, seed: number) {
  const raw = Math.sin(q * 12.9898 + r * 78.233 + seed) * 43758.5453;
  return raw - Math.floor(raw);
}

function directionalNoise(q: number, r: number) {
  const raw = Math.sin(q * 3.19 - r * 2.47 + q * r * 0.071) * 0.5 + 0.5;
  return raw - 0.5;
}

function directiveNoise(q: number, r: number, type: TerrainDirectiveType, region: TerrainDirectiveRegion) {
  const typeSeed = type.charCodeAt(0) * 13 + type.length * 17;
  const regionSeed = region.charCodeAt(0) * 19 + region.length * 23;
  const raw = Math.sin(q * 8.127 + r * 31.73 + typeSeed + regionSeed) * 24634.6345;
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
    cells.push(roundAxial(lerp(a.q, b.q, t), lerp(a.r, b.r, t)));
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
