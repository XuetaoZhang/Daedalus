export type ZoneType =
  | "entrance"
  | "main_stage"
  | "track_zone"
  | "project_booth"
  | "sponsor_zone"
  | "timeline"
  | "nft_wall"
  | "wallet_badge";

export type ZoneSpec = {
  id: string;
  type: ZoneType;
  title: string;
  subtitle?: string;
  position: [number, number, number];
  color: string;
  accent: string;
};

export type Web3ProofSpec = {
  type: "nft_wall" | "wallet_badge" | "chain_link";
  title: string;
  source: "mock_metadata" | "testnet" | "manual";
};

export type SceneSpec = {
  title: string;
  theme: "futuristic" | "minimal" | "gallery";
  worldType: "web3_demo_day" | "dao_hall" | "nft_gallery";
  zones: ZoneSpec[];
  web3Proofs: Web3ProofSpec[];
};
