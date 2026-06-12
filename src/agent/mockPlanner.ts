import type { PlannerOutput, StudioGenerationRequest, WorldTypeMap } from "./types";
import type { SceneSpec, Web3ProofSpec, ZoneSpec } from "../world/sceneSpec";

const worldTypeMap: WorldTypeMap = {
  hackathon_arena: "web3_demo_day",
  dao_hall: "dao_hall",
  nft_gallery: "nft_gallery",
};

const paletteByStyle = {
  game: {
    base: "#22324a",
    accent: "#6fa8ff",
    alt: "#2f6fb7",
  },
  animation: {
    base: "#22516a",
    accent: "#65d7ff",
    alt: "#ff9d6c",
  },
  voxel: {
    base: "#3c475b",
    accent: "#74c77b",
    alt: "#8cb2ff",
  },
} as const;

function titleCase(input: string) {
  return input
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function makeZone(id: string, type: ZoneSpec["type"], title: string, subtitle: string, position: [number, number, number], color: string, accent: string): ZoneSpec {
  return { id, type, title, subtitle, position, color, accent };
}

export function buildMockSceneSpec(request: StudioGenerationRequest): PlannerOutput {
  const palette = paletteByStyle[request.style];
  const prompt = request.prompt.toLowerCase();
  const needsSponsor = request.constraints.includes("sponsor_zone") || prompt.includes("sponsor");
  const needsTimeline = request.constraints.includes("timeline_corridor") || prompt.includes("timeline");
  const needsWalletBadge = request.constraints.includes("wallet_badge") || prompt.includes("wallet");
  const shouldOmitProofWall = request.constraints.includes("nft_proof_wall");

  const worldTitle =
    request.sceneType === "dao_hall"
      ? "Governance Assembly Hall"
      : request.sceneType === "nft_gallery"
        ? "Creator Proof District"
        : "AI x Web3 Demo Day Arena";

  const zones: ZoneSpec[] = [
    makeZone("entrance", "entrance", "Builder Gate", "Prompt to world", [0, 0, 5], palette.base, palette.accent),
    makeZone("main-stage", "main_stage", "Main Stage", "Headline demos", [0, 0, -6], "#352061", palette.accent),
    makeZone("agent-command", "track_zone", "Agent Command", "Long-horizon planning", [-5, 0, -1], palette.base, palette.alt),
    makeZone("project-booths", "project_booth", "Project Booths", "Teams and showcases", [-5, 0, -6], "#2d3d57", palette.accent),
  ];

  if (needsSponsor) {
    zones.push(
      makeZone("sponsor-zone", "sponsor_zone", "Sponsor Zone", "Partner activations", [5, 0, -6], "#4a3044", "#ff86bc"),
    );
  }

  if (needsTimeline) {
    zones.push(
      makeZone("timeline", "timeline", "Timeline Corridor", "Build, test, submit", [-7, 0, 4], "#1f4737", "#8fffbd"),
    );
  }

  if (request.sceneType === "nft_gallery") {
    zones.push(
      makeZone("creator-wall", "nft_wall", "Creator Wall", "Drops and proofs", [6, 0, 3], "#2c2547", "#c4a7ff"),
    );
  }

  const web3Proofs: Web3ProofSpec[] = [];

  if (!shouldOmitProofWall) {
    web3Proofs.push({
      type: "nft_wall",
      title: "Builder Proof Wall",
      source: "mock_metadata",
    });
  }

  if (needsWalletBadge) {
    web3Proofs.push({
      type: "wallet_badge",
      title: "Visitor Badge",
      source: "manual",
    });
  }

  if (web3Proofs.length === 0) {
    web3Proofs.push({
      type: "chain_link",
      title: "Chain Link",
      source: "manual",
    });
  }

  const spec: SceneSpec = {
    title: worldTitle,
    summary: `${titleCase(request.style)} style world for ${worldTitle.toLowerCase()} with modular Web3 zones and an observable agent workflow.`,
    theme: request.theme,
    style: request.style,
    worldType: worldTypeMap[request.sceneType],
    constraints: request.constraints,
    zones,
    web3Proofs,
  };

  return {
    planSummary: `Planned a ${request.style} style ${worldTitle.toLowerCase()} with ${zones.length} core zones and ${web3Proofs.length} proof modules.`,
    spec,
    provider: "Mock Planner",
    model: "deterministic-local",
  };
}
