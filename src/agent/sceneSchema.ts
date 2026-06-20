import { z } from "zod";
import type { SceneSpec } from "../world/sceneSpec";
import { controllableLandmarkAliasMap, controllableLandmarkRegistry, controllableLandmarkTypes } from "../world/controllableAssets";
import type { TerrainDirective, TerrainDirectiveRegion, TerrainDirectiveType, TerrainProfile } from "../world/terrain/terrainTypes";

const hexColor = /^#([0-9a-fA-F]{6})$/;

const zoneTypeSchema = z.enum([
  "entrance",
  "main_stage",
  "track_zone",
  "project_booth",
  "sponsor_zone",
  "timeline",
  "nft_wall",
  "wallet_badge",
]);

const sceneConstraintSchema = z.enum([
  "browser_ready",
  "wallet_badge",
  "nft_proof_wall",
  "timeline_corridor",
  "sponsor_zone",
]);

const landmarkTypeSchema = z.enum(controllableLandmarkTypes);
const terrainProfileSchema = z.enum(["coastal", "forest", "mountain", "river", "plain", "mixed"]);
const terrainDirectiveTypeSchema = z.enum(["water", "forest", "mountain", "sand", "plain"]);
const terrainDirectiveRegionSchema = z.enum([
  "north",
  "south",
  "east",
  "west",
  "northwest",
  "northeast",
  "southwest",
  "southeast",
  "center_ring",
  "outer_ring",
]);
const terrainDirectiveSchema = z.object({
  type: terrainDirectiveTypeSchema,
  region: terrainDirectiveRegionSchema,
  shape: z.enum(["soft", "crescent", "linear", "blob"]).optional(),
  density: z.enum(["light", "medium", "dense"]).optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
});
const landmarkRegionSchema = z.enum([
  "north",
  "south",
  "east",
  "west",
  "northwest",
  "northeast",
  "southwest",
  "southeast",
  "center_ring",
  "outer_ring",
]);

const zoneSchema = z.object({
  id: z.string().min(2),
  type: zoneTypeSchema,
  title: z.string().min(2).max(48),
  subtitle: z.string().max(72).optional(),
  position: z.tuple([
    z.number().min(-8).max(8),
    z.number().min(-1).max(2),
    z.number().min(-8).max(8),
  ]),
  color: z.string().regex(hexColor),
  accent: z.string().regex(hexColor),
  interactions: z.array(z.string().min(2).max(32)).max(4).optional(),
});

const proofSchema = z.object({
  type: z.enum(["nft_wall", "wallet_badge", "chain_link"]),
  title: z.string().min(2).max(48),
  source: z.enum(["mock_metadata", "testnet", "manual"]),
});

const landmarkSchema = z.object({
  id: z.string().min(2),
  type: landmarkTypeSchema,
  title: z.string().min(2).max(48),
  region: landmarkRegionSchema,
});

export const sceneSpecSchema = z.object({
  title: z.string().min(4).max(72),
  summary: z.string().max(160).optional(),
  theme: z.enum(["futuristic", "minimal", "industrial"]),
  style: z.enum(["game", "animation", "voxel"]),
  worldType: z.enum(["web3_demo_day", "dao_hall", "nft_gallery"]),
  terrainSeed: z.number().int().min(0).max(99999).optional(),
  terrainProfile: terrainProfileSchema.optional(),
  terrainDirectives: z.array(terrainDirectiveSchema).max(8).optional(),
  constraints: z.array(sceneConstraintSchema).optional(),
  zones: z.array(zoneSchema).min(4).max(12),
  web3Proofs: z.array(proofSchema).min(1).max(4),
  landmarks: z.array(landmarkSchema).max(6).optional(),
});

type LooseRecord = Record<string, unknown>;

const zoneTypeAliases: Record<string, z.infer<typeof zoneTypeSchema>> = {
  entrance: "entrance",
  gate: "entrance",
  gateway: "entrance",
  main_stage: "main_stage",
  mainstage: "main_stage",
  stage: "main_stage",
  track_zone: "track_zone",
  track: "track_zone",
  trackzone: "track_zone",
  project_booth: "project_booth",
  projectbooth: "project_booth",
  booth: "project_booth",
  booths: "project_booth",
  sponsor_zone: "sponsor_zone",
  sponsor: "sponsor_zone",
  sponsorzone: "sponsor_zone",
  timeline: "timeline",
  timeline_corridor: "timeline",
  corridor: "timeline",
  nft_wall: "nft_wall",
  nftwall: "nft_wall",
  proof_wall: "nft_wall",
  wallet_badge: "wallet_badge",
  walletbadge: "wallet_badge",
  badge: "wallet_badge",
};

const themeAliases: Record<string, SceneSpec["theme"]> = {
  futuristic: "futuristic",
  sci_fi: "futuristic",
  scifi: "futuristic",
  cyberpunk: "futuristic",
  minimal: "minimal",
  clean: "minimal",
  industrial: "industrial",
  brutalist: "industrial",
};

const styleAliases: Record<string, SceneSpec["style"]> = {
  game: "game",
  game_style: "game",
  "game-style": "game",
  animation: "animation",
  animated: "animation",
  cartoon: "animation",
  voxel: "voxel",
  minecraft: "voxel",
  blocky: "voxel",
};

const worldTypeAliases: Record<string, SceneSpec["worldType"]> = {
  web3_demo_day: "web3_demo_day",
  demo_day: "web3_demo_day",
  hackathon_arena: "web3_demo_day",
  dao_hall: "dao_hall",
  dao: "dao_hall",
  nft_gallery: "nft_gallery",
  gallery: "nft_gallery",
};

const terrainProfileAliases: Record<string, TerrainProfile> = {
  coastal: "coastal",
  coast: "coastal",
  beach: "coastal",
  bay: "coastal",
  seaside: "coastal",
  sea: "coastal",
  ocean: "coastal",
  forest: "forest",
  woods: "forest",
  woodland: "forest",
  mountain: "mountain",
  mountains: "mountain",
  highland: "mountain",
  river: "river",
  stream: "river",
  plain: "plain",
  plains: "plain",
  meadow: "plain",
  mixed: "mixed",
  海边: "coastal",
  海岸: "coastal",
  海湾: "coastal",
  森林: "forest",
  山区: "mountain",
  山地: "mountain",
  河流: "river",
  河边: "river",
  平原: "plain",
  草原: "plain",
};

const terrainDirectiveTypeAliases: Record<string, TerrainDirectiveType> = {
  water: "water",
  waters: "water",
  lake: "water",
  lakes: "water",
  sea: "water",
  ocean: "water",
  coast: "water",
  coastal: "water",
  beach: "sand",
  bay: "water",
  river: "water",
  stream: "water",
  forest: "forest",
  woods: "forest",
  woodland: "forest",
  tree: "forest",
  trees: "forest",
  mountain: "mountain",
  mountains: "mountain",
  hill: "mountain",
  hills: "mountain",
  rock: "mountain",
  rocky: "mountain",
  sand: "sand",
  desert: "sand",
  plain: "plain",
  plains: "plain",
  grass: "plain",
  meadow: "plain",
  水域: "water",
  水: "water",
  湖: "water",
  湖泊: "water",
  海: "water",
  海边: "water",
  海岸: "water",
  海湾: "water",
  河: "water",
  河流: "water",
  森林: "forest",
  树林: "forest",
  林地: "forest",
  山: "mountain",
  山区: "mountain",
  山地: "mountain",
  山脉: "mountain",
  沙地: "sand",
  沙滩: "sand",
  沙漠: "sand",
  平原: "plain",
  草地: "plain",
  草原: "plain",
};

const terrainDirectiveRegionAliases: Record<string, TerrainDirectiveRegion> = {
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  northwest: "northwest",
  northeast: "northeast",
  southwest: "southwest",
  southeast: "southeast",
  north_west: "northwest",
  north_east: "northeast",
  south_west: "southwest",
  south_east: "southeast",
  top_left: "northwest",
  upper_left: "northwest",
  left_top: "northwest",
  top_right: "northeast",
  upper_right: "northeast",
  right_top: "northeast",
  bottom_left: "southwest",
  lower_left: "southwest",
  left_bottom: "southwest",
  bottom_right: "southeast",
  lower_right: "southeast",
  right_bottom: "southeast",
  center: "center_ring",
  center_ring: "center_ring",
  middle: "center_ring",
  outer: "outer_ring",
  outer_ring: "outer_ring",
  edge: "outer_ring",
  左上: "northwest",
  右上: "northeast",
  左下: "southwest",
  右下: "southeast",
  上方: "north",
  下方: "south",
  左侧: "west",
  右侧: "east",
  北侧: "north",
  北边: "north",
  南侧: "south",
  南边: "south",
  东侧: "east",
  东边: "east",
  西侧: "west",
  西边: "west",
  东北: "northeast",
  西北: "northwest",
  东南: "southeast",
  西南: "southwest",
};

const constraintAliases: Record<string, z.infer<typeof sceneConstraintSchema>> = {
  browser_ready: "browser_ready",
  browser: "browser_ready",
  wallet_badge: "wallet_badge",
  badge: "wallet_badge",
  nft_proof_wall: "nft_proof_wall",
  proof_wall: "nft_proof_wall",
  timeline_corridor: "timeline_corridor",
  timeline: "timeline_corridor",
  sponsor_zone: "sponsor_zone",
  sponsor: "sponsor_zone",
};

const landmarkTypeAliases: Record<string, z.infer<typeof landmarkTypeSchema>> = controllableLandmarkAliasMap;

const landmarkRegionAliases: Record<string, z.infer<typeof landmarkRegionSchema>> = {
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  northwest: "northwest",
  northeast: "northeast",
  southwest: "southwest",
  southeast: "southeast",
  top_left: "northwest",
  upper_left: "northwest",
  left_top: "northwest",
  top_right: "northeast",
  upper_right: "northeast",
  right_top: "northeast",
  bottom_left: "southwest",
  lower_left: "southwest",
  left_bottom: "southwest",
  bottom_right: "southeast",
  lower_right: "southeast",
  right_bottom: "southeast",
  center: "center_ring",
  center_ring: "center_ring",
  middle: "center_ring",
  outer: "outer_ring",
  outer_ring: "outer_ring",
  edge: "outer_ring",
  north_west: "northwest",
  north_east: "northeast",
  south_west: "southwest",
  south_east: "southeast",
  左上: "northwest",
  右上: "northeast",
  左下: "southwest",
  右下: "southeast",
  上方: "north",
  下方: "south",
  左侧: "west",
  右侧: "east",
  北侧: "north",
  南侧: "south",
  东侧: "east",
  西侧: "west",
  东北: "northeast",
  西北: "northwest",
  东南: "southeast",
  西南: "southwest",
};

const zoneDefaultColors: Record<z.infer<typeof zoneTypeSchema>, string> = {
  entrance: "#2B3F58",
  main_stage: "#4A2B6B",
  track_zone: "#2B5364",
  project_booth: "#3A4C62",
  sponsor_zone: "#64412B",
  timeline: "#235445",
  nft_wall: "#533055",
  wallet_badge: "#374467",
};

const proofTypeAliases: Record<string, z.infer<typeof proofSchema.shape.type>> = {
  nft_wall: "nft_wall",
  nftwall: "nft_wall",
  proof_wall: "nft_wall",
  wallet_badge: "wallet_badge",
  walletbadge: "wallet_badge",
  badge: "wallet_badge",
  chain_link: "chain_link",
  chain: "chain_link",
};

function asRecord(input: unknown): LooseRecord {
  return typeof input === "object" && input !== null ? (input as LooseRecord) : {};
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

function titleFromZoneType(type: z.infer<typeof zoneTypeSchema>) {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseAlias<T extends string>(value: unknown, aliases: Record<string, T>, fallback: T): T {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return aliases[normalized] ?? fallback;
}

function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();

  if (hexColor.test(trimmed)) return trimmed.toUpperCase();

  const shortHex = trimmed.match(/^#([0-9a-fA-F]{3})$/);
  if (shortHex) {
    const [r, g, b] = shortHex[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lightenHexColor(color: string, amount: number) {
  const match = color.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return color;

  const source = match[1];
  const channels = [0, 2, 4].map((offset) => Number.parseInt(source.slice(offset, offset + 2), 16));
  const next = channels
    .map((channel) => Math.round(channel + (255 - channel) * amount))
    .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, "0"))
    .join("");

  return `#${next}`.toUpperCase();
}

function normalizePosition(value: unknown): [number, number, number] {
  if (!Array.isArray(value)) return [0, 0, 0];

  const numeric = value.map((entry) => (typeof entry === "number" ? entry : Number(entry)));
  const x = Number.isFinite(numeric[0]) ? clamp(numeric[0], -8, 8) : 0;
  const y = Number.isFinite(numeric[1]) ? clamp(numeric[1], -1, 2) : 0;
  const zIndex = numeric.length >= 3 ? 2 : 1;
  const z = Number.isFinite(numeric[zIndex]) ? clamp(numeric[zIndex], -8, 8) : 0;

  return [x, y, z];
}

function normalizeTerrainSeed(value: unknown) {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric)) return undefined;
  return Math.round(clamp(numeric, 0, 99999));
}

function inferProofSource(record: LooseRecord): z.infer<typeof proofSchema.shape.source> {
  const direct = record.source;
  if (direct === "mock_metadata" || direct === "testnet" || direct === "manual") return direct;

  if (typeof record.network === "string") {
    const network = record.network.toLowerCase();
    if (network.includes("test") || network === "sepolia" || network === "mumbai") {
      return "testnet";
    }
  }

  return "manual";
}

function ensureAccent(color: string, accent: unknown) {
  return normalizeHexColor(accent, lightenHexColor(color, 0.32));
}

function normalizeZone(input: unknown, index: number) {
  const record = asRecord(input);
  const type = parseAlias(record.type ?? record.kind ?? record.zoneType, zoneTypeAliases, "project_booth");
  const title =
    typeof record.title === "string"
      ? record.title.trim()
      : typeof record.label === "string"
        ? record.label.trim()
        : titleFromZoneType(type);
  const color = normalizeHexColor(record.color, zoneDefaultColors[type]);
  const interactions = Array.isArray(record.interactions)
    ? record.interactions.filter((entry): entry is string => typeof entry === "string" && entry.trim().length >= 2).slice(0, 4)
    : Array.isArray(record.actions)
      ? record.actions.filter((entry): entry is string => typeof entry === "string" && entry.trim().length >= 2).slice(0, 4)
      : undefined;

  return {
    id:
      typeof record.id === "string" && record.id.trim().length >= 2
        ? slugify(record.id)
        : `${slugify(title || titleFromZoneType(type)) || type}-${index + 1}`,
    type,
    title: title || titleFromZoneType(type),
    subtitle:
      typeof record.subtitle === "string"
        ? record.subtitle.trim().slice(0, 72)
        : typeof record.description === "string"
          ? record.description.trim().slice(0, 72)
          : undefined,
    position: normalizePosition(record.position),
    color,
    accent: ensureAccent(color, record.accent),
    interactions: interactions && interactions.length > 0 ? interactions : undefined,
  };
}

function normalizeProof(input: unknown, fallbackType?: z.infer<typeof proofSchema.shape.type>) {
  const record = asRecord(input);
  const type = parseAlias(record.type ?? record.kind, proofTypeAliases, fallbackType ?? "nft_wall");

  return {
    type,
    title:
      typeof record.title === "string"
        ? record.title.trim()
        : typeof record.label === "string"
          ? record.label.trim()
          : type === "wallet_badge"
            ? "Wallet Badge"
            : type === "chain_link"
              ? "Chain Link"
              : "NFT Proof Wall",
    source: inferProofSource(record),
  };
}

function normalizeLandmark(input: unknown, index: number) {
  const record = asRecord(input);
  const type = parseAlias(record.type ?? record.kind ?? record.assetType, landmarkTypeAliases, "building-castle");
  const asset = controllableLandmarkRegistry[type];
  const title =
    typeof record.title === "string"
      ? record.title.trim()
      : asset.title;
  const region = parseAlias(record.region ?? record.area ?? record.anchor, landmarkRegionAliases, asset.defaultRegion);

  return {
    id:
      typeof record.id === "string" && record.id.trim().length >= 2
        ? slugify(record.id)
        : `${slugify(title) || type}-${index + 1}`,
    type,
    title,
    region,
  };
}

function normalizeTerrainDirective(input: unknown): TerrainDirective | null {
  const record = asRecord(input);
  const type = parseAlias(
    record.type ?? record.kind ?? record.biome ?? record.terrainType,
    terrainDirectiveTypeAliases,
    "plain",
  );
  const region = parseAlias(
    record.region ?? record.area ?? record.location ?? record.direction,
    terrainDirectiveRegionAliases,
    "outer_ring",
  );
  const shape = parseAlias(record.shape, { soft: "soft", crescent: "crescent", linear: "linear", blob: "blob" }, "soft");
  const density = parseAlias(record.density ?? record.intensity, { light: "light", medium: "medium", dense: "dense" }, "medium");
  const size = parseAlias(record.size ?? record.scale, { small: "small", medium: "medium", large: "large" }, "medium");

  return {
    type,
    region,
    shape,
    density,
    size,
  };
}

function normalizeTerrainDirectives(input: unknown) {
  const source = Array.isArray(input) ? input : [];
  const directives = source
    .map((entry) => normalizeTerrainDirective(entry))
    .filter((entry): entry is TerrainDirective => Boolean(entry));
  const seen = new Set<string>();

  return directives
    .filter((directive) => {
      const key = `${directive.region}:${directive.type}:${directive.shape}:${directive.size}:${directive.density}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function normalizeWeb3Proofs(input: unknown, zones: Array<ReturnType<typeof normalizeZone>>) {
  const proofs: Array<ReturnType<typeof normalizeProof>> = [];

  if (Array.isArray(input)) {
    proofs.push(...input.map((entry) => normalizeProof(entry)));
  } else {
    const record = asRecord(input);
    for (const [key, value] of Object.entries(record)) {
      if (value === false || value === null || value === undefined) continue;
      proofs.push(normalizeProof(value, parseAlias(key, proofTypeAliases, key.includes("wallet") ? "wallet_badge" : "nft_wall")));
    }
  }

  const seen = new Set(proofs.map((proof) => proof.type));

  for (const zone of zones) {
    if ((zone.type === "nft_wall" || zone.type === "wallet_badge") && !seen.has(zone.type)) {
      proofs.push(
        normalizeProof(
          {
            type: zone.type,
            title: zone.title,
            source: "manual",
          },
          zone.type,
        ),
      );
      seen.add(zone.type);
    }
  }

  if (proofs.length === 0) {
    proofs.push({
      type: "chain_link",
      title: "Scene Link",
      source: "manual",
    });
  }

  return proofs.slice(0, 4);
}

export function normalizeSceneSpecInput(input: unknown): SceneSpec {
  const record = asRecord(input);
  const zonesSource = Array.isArray(record.zones)
    ? record.zones
    : Array.isArray(record.modules)
      ? record.modules
      : Array.isArray(record.areas)
        ? record.areas
        : [];
  const zones = zonesSource.map((zone, index) => normalizeZone(zone, index));
  const landmarkSource = Array.isArray(record.landmarks)
    ? record.landmarks
    : Array.isArray(record.extras)
      ? record.extras
      : Array.isArray(record.landmarkModules)
        ? record.landmarkModules
        : [];
  const terrainPlan = asRecord(record.terrainPlan);
  const terrainDirectiveSource = Array.isArray(record.terrainDirectives)
    ? record.terrainDirectives
    : Array.isArray(record.directives)
      ? record.directives
      : Array.isArray(terrainPlan.directives)
        ? terrainPlan.directives
        : Array.isArray(terrainPlan.terrainDirectives)
          ? terrainPlan.terrainDirectives
          : [];

  return {
    title:
      typeof record.title === "string" && record.title.trim().length > 0
        ? record.title.trim().slice(0, 72)
        : "Generated World",
    summary:
      typeof record.summary === "string" && record.summary.trim().length > 0
        ? record.summary.trim().slice(0, 160)
        : undefined,
    theme: parseAlias(record.theme, themeAliases, "futuristic"),
    style: parseAlias(record.style, styleAliases, "game"),
    worldType: parseAlias(record.worldType ?? record.sceneType, worldTypeAliases, "web3_demo_day"),
    terrainSeed: normalizeTerrainSeed(record.terrainSeed ?? record.seed),
    terrainProfile: parseAlias(record.terrainProfile ?? record.terrain ?? record.biomeProfile, terrainProfileAliases, "mixed"),
    terrainDirectives: normalizeTerrainDirectives(terrainDirectiveSource),
    constraints: Array.isArray(record.constraints)
      ? record.constraints
          .map((constraint) => parseAlias(constraint, constraintAliases, "browser_ready"))
          .filter((constraint, index, list) => list.indexOf(constraint) === index)
      : undefined,
    zones,
    web3Proofs: normalizeWeb3Proofs(record.web3Proofs, zones),
    landmarks: landmarkSource.map((landmark, index) => normalizeLandmark(landmark, index)).slice(0, 6),
  };
}

export function parseSceneSpec(input: unknown): SceneSpec {
  return sceneSpecSchema.parse(normalizeSceneSpecInput(input));
}
