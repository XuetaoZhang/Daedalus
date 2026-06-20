export type TerrainProfile = "coastal" | "forest" | "mountain" | "river" | "plain" | "mixed";

export type TerrainDirectiveType = "water" | "forest" | "mountain" | "sand" | "plain";

export type TerrainDirectiveRegion =
  | "north"
  | "south"
  | "east"
  | "west"
  | "northwest"
  | "northeast"
  | "southwest"
  | "southeast"
  | "center_ring"
  | "outer_ring";

export type TerrainDirective = {
  type: TerrainDirectiveType;
  region: TerrainDirectiveRegion;
  shape?: "soft" | "crescent" | "linear" | "blob";
  density?: "light" | "medium" | "dense";
  size?: "small" | "medium" | "large";
};

export type TerrainBiome =
  | "grass"
  | "sand"
  | "forest"
  | "hill"
  | "stone"
  | "mountain"
  | "water"
  | "waterRocks";

export type TerrainFeature = "plaza" | "path" | "river";

export type TerrainTile = {
  key: string;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  tint?: string;
  tintStrength?: number;
};

export type HexCellCoord = {
  q: number;
  r: number;
};

export type HexCell = HexCellCoord & {
  key: string;
  position: [number, number, number];
  noise: number;
  distance: number;
};

export type TerrainPlanCell = HexCell & {
  biome: TerrainBiome;
  feature?: TerrainFeature;
};

export type TerrainPlan = {
  cells: TerrainPlanCell[];
  profile: TerrainProfile;
  seed: number;
};
