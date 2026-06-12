import type { ZoneSpec } from "./sceneSpec";

type HexCellCoord = {
  q: number;
  r: number;
};

type ZoneAnchor = {
  zone: ZoneSpec;
  cell: HexCellCoord;
  position: [number, number, number];
};

export type StudioWorldLayout = {
  anchors: ZoneAnchor[];
  tileRadius: number;
  supportRadius: number;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    centerX: number;
    centerZ: number;
  };
};

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

const HEX_DIRECTIONS: HexCellCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

const MODEL_HEX_HEIGHT = 1.154700517654419;
const MODEL_HEX_SIDE = MODEL_HEX_HEIGHT / 2;

export function buildStudioWorldLayout(zones: ZoneSpec[]): StudioWorldLayout {
  const zoneByType = new Map(zones.map((zone) => [zone.type, zone] as const));
  const ordered = [
    zoneByType.get("main_stage"),
    zoneByType.get("entrance"),
    zoneByType.get("project_booth"),
    zoneByType.get("sponsor_zone"),
    zoneByType.get("track_zone"),
    zoneByType.get("timeline"),
    zoneByType.get("nft_wall"),
    zoneByType.get("wallet_badge"),
  ].filter((zone): zone is ZoneSpec => Boolean(zone));

  const defaultCells: Record<string, HexCellCoord> = {
    main_stage: { q: 0, r: 0 },
    entrance: { q: 0, r: 5 },
    project_booth: { q: -4, r: 1 },
    sponsor_zone: { q: 4, r: -1 },
    track_zone: { q: 4, r: 2 },
    timeline: { q: -4, r: 4 },
    nft_wall: { q: 2, r: 5 },
    wallet_badge: { q: -2, r: 5 },
  };

  const used = new Set<string>();
  const anchors: ZoneAnchor[] = [];

  for (const zone of ordered) {
    const preferred = defaultCells[zone.type] ?? { q: 0, r: 0 };
    const cell = findNearestFreeCell(preferred, used, 6);
    used.add(hexKey(cell.q, cell.r));
    anchors.push({
      zone,
      cell,
      position: axialToWorld(cell.q, cell.r, MODEL_HEX_SIDE),
    });
  }

  const bounds = anchors.reduce(
    (accumulator, anchor) => {
      const radius = zoneRadiusByType[anchor.zone.type] + 1.1;
      accumulator.minX = Math.min(accumulator.minX, anchor.position[0] - radius);
      accumulator.maxX = Math.max(accumulator.maxX, anchor.position[0] + radius);
      accumulator.minZ = Math.min(accumulator.minZ, anchor.position[2] - radius);
      accumulator.maxZ = Math.max(accumulator.maxZ, anchor.position[2] + radius);
      return accumulator;
    },
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minZ: Number.POSITIVE_INFINITY,
      maxZ: Number.NEGATIVE_INFINITY,
    },
  );

  if (!Number.isFinite(bounds.minX)) {
    bounds.minX = -4;
    bounds.maxX = 4;
    bounds.minZ = -4;
    bounds.maxZ = 4;
  }

  const supportRadius =
    anchors.reduce(
      (maxDistance, anchor) =>
        Math.max(
          maxDistance,
          Math.hypot(anchor.position[0], anchor.position[2]) + zoneRadiusByType[anchor.zone.type] + 1.6,
        ),
      5.6,
    ) + 0.35;
  const tileRadius = Math.max(8, Math.ceil(supportRadius / MODEL_HEX_SIDE) + 1);

  return {
    anchors,
    tileRadius,
    supportRadius,
    bounds: {
      ...bounds,
      centerX: (bounds.minX + bounds.maxX) / 2,
      centerZ: (bounds.minZ + bounds.maxZ) / 2,
    },
  };
}

function findNearestFreeCell(start: HexCellCoord, used: Set<string>, maxRadius: number) {
  if (!used.has(hexKey(start.q, start.r))) return start;
  for (let radius = 1; radius <= maxRadius; radius += 1) {
    for (const candidate of hexRing(start, radius)) {
      if (!used.has(hexKey(candidate.q, candidate.r))) {
        return candidate;
      }
    }
  }
  return start;
}

function axialToWorld(q: number, r: number, size: number): [number, number, number] {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const z = size * 1.5 * r;
  return [x, 0, z];
}

function hexKey(q: number, r: number) {
  return `${q}:${r}`;
}

function hexRing(center: HexCellCoord, radius: number) {
  if (radius <= 0) return [center];

  const cells: HexCellCoord[] = [];
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
