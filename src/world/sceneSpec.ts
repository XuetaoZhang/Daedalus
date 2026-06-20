import type { ControllableLandmarkType } from "./controllableAssets";
import type { TerrainDirective, TerrainProfile } from "./terrain/terrainTypes";

export type ZoneType =
  | "entrance"
  | "main_stage"
  | "track_zone"
  | "project_booth"
  | "sponsor_zone"
  | "timeline"
  | "nft_wall"
  | "wallet_badge";

export type LandmarkType = ControllableLandmarkType;

export type LandmarkRegion =
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

export type WorldStyle = "game" | "animation" | "voxel";

export type SceneTheme = "futuristic" | "minimal" | "industrial";

export type WorldType = "web3_demo_day" | "dao_hall" | "nft_gallery";

export type SceneConstraint =
  | "browser_ready"
  | "wallet_badge"
  | "nft_proof_wall"
  | "timeline_corridor"
  | "sponsor_zone";

export type ZoneSpec = {
  id: string;
  type: ZoneType;
  title: string;
  subtitle?: string;
  position: [number, number, number];
  color: string;
  accent: string;
  interactions?: string[];
};

export type Web3ProofSpec = {
  type: "nft_wall" | "wallet_badge" | "chain_link";
  title: string;
  source: "mock_metadata" | "testnet" | "manual";
};

export type LandmarkSpec = {
  id: string;
  type: LandmarkType;
  title: string;
  region: LandmarkRegion;
};

export type SceneSpec = {
  title: string;
  summary?: string;
  theme: SceneTheme;
  style: WorldStyle;
  worldType: WorldType;
  terrainSeed?: number;
  terrainProfile?: TerrainProfile;
  terrainDirectives?: TerrainDirective[];
  constraints?: SceneConstraint[];
  zones: ZoneSpec[];
  web3Proofs: Web3ProofSpec[];
  landmarks?: LandmarkSpec[];
};
