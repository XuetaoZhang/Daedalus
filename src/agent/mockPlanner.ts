import type { LandmarkIntent, PlannerOutput, StudioGenerationRequest, WorldTypeMap } from "./types";
import type { LandmarkSpec, SceneSpec, Web3ProofSpec, ZoneSpec } from "../world/sceneSpec";
import { controllableLandmarkList } from "../world/controllableAssets";

const DISPLAY_PROVIDER_DEMO = "GLM Demo Planner";
const DISPLAY_MODEL_DEMO = "glm-5.1";

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

const titleByLandmarkType = Object.fromEntries(controllableLandmarkList.map((asset) => [asset.type, asset.title])) as Record<
  LandmarkIntent["type"],
  string
>;

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

type LandmarkKeywordSpec = {
  type: LandmarkIntent["type"];
  title: string;
  keywords: string[];
  fallbackRegion: LandmarkIntent["region"];
};

const landmarkKeywordSpecs: LandmarkKeywordSpec[] = controllableLandmarkList.map((asset) => ({
  type: asset.type,
  title: asset.title,
  keywords: asset.aliases,
  fallbackRegion: asset.defaultRegion,
}));

const directionalHints: Array<{ phrases: string[]; region: LandmarkIntent["region"]; priority: number }> = [
  { phrases: ["左上角", "左上", "top left", "upper left"], region: "northwest", priority: 5 },
  { phrases: ["右上角", "右上", "top right", "upper right"], region: "northeast", priority: 5 },
  { phrases: ["左下角", "左下", "bottom left", "lower left"], region: "southwest", priority: 5 },
  { phrases: ["右下角", "右下", "bottom right", "lower right"], region: "southeast", priority: 5 },
  { phrases: ["西北角", "西北", "northwest", "north west"], region: "northwest", priority: 4 },
  { phrases: ["东北角", "东北", "northeast", "north east"], region: "northeast", priority: 4 },
  { phrases: ["西南角", "西南", "southwest", "south west"], region: "southwest", priority: 4 },
  { phrases: ["东南角", "东南", "southeast", "south east"], region: "southeast", priority: 4 },
  { phrases: ["北侧", "北边", "上方", "顶部", "north side", "north"], region: "north", priority: 3 },
  { phrases: ["南侧", "南边", "下方", "底部", "south side", "south"], region: "south", priority: 3 },
  { phrases: ["东侧", "右侧", "右边", "east side", "east"], region: "east", priority: 3 },
  { phrases: ["西侧", "左侧", "左边", "west side", "west"], region: "west", priority: 3 },
  { phrases: ["中心环", "中圈", "center ring", "middle ring"], region: "center_ring", priority: 2 },
  { phrases: ["外围", "外圈", "outer ring", "edge"], region: "outer_ring", priority: 2 },
];

function findKeywordIndex(prompt: string, keywords: string[]) {
  let bestIndex = -1;
  let bestLength = -1;

  for (const keyword of keywords) {
    const index = prompt.indexOf(keyword);
    if (index === -1) continue;
    if (bestIndex === -1 || keyword.length > bestLength || (keyword.length === bestLength && index < bestIndex)) {
      bestIndex = index;
      bestLength = keyword.length;
    }
  }

  return { index: bestIndex, length: Math.max(bestLength, 0) };
}

function inferRegionNearKeyword(prompt: string, keywordIndex: number, keywordLength: number, fallback: LandmarkIntent["region"]) {
  const searchStart = Math.max(0, keywordIndex - 18);
  const searchEnd = Math.min(prompt.length, keywordIndex + keywordLength + 18);
  const localWindow = prompt.slice(searchStart, searchEnd);

  let bestMatch: { region: LandmarkIntent["region"]; priority: number; distance: number } | null = null;

  for (const hint of directionalHints) {
    for (const phrase of hint.phrases) {
      const localIndex = localWindow.indexOf(phrase);
      if (localIndex === -1) continue;
      const distance = Math.abs((searchStart + localIndex) - keywordIndex);
      if (
        !bestMatch ||
        hint.priority > bestMatch.priority ||
        (hint.priority === bestMatch.priority && distance < bestMatch.distance)
      ) {
        bestMatch = {
          region: hint.region,
          priority: hint.priority,
          distance,
        };
      }
    }
  }

  if (bestMatch) return bestMatch.region;

  for (const hint of directionalHints) {
    for (const phrase of hint.phrases) {
      const globalIndex = prompt.indexOf(phrase);
      if (globalIndex === -1) continue;
      return hint.region;
    }
  }

  return fallback;
}

function inferLandmarks(prompt: string): LandmarkIntent[] {
  const intents: LandmarkIntent[] = [];
  const usedTypes = new Set<LandmarkIntent["type"]>();

  for (const spec of landmarkKeywordSpecs) {
    const { index, length } = findKeywordIndex(prompt, spec.keywords);
    if (index === -1) continue;
    if (usedTypes.has(spec.type)) continue;

    intents.push({
      type: spec.type,
      title: spec.title,
      region: inferRegionNearKeyword(prompt, index, length, spec.fallbackRegion),
    });
    usedTypes.add(spec.type);
  }

  return intents.slice(0, 6);
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
  const landmarks: LandmarkSpec[] = inferLandmarks(prompt).map((intent, index) => ({
    id: `${intent.type}-${index + 1}`,
    type: intent.type,
    title: titleByLandmarkType[intent.type] ?? intent.title,
    region: intent.region,
  }));

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
    landmarks,
  };

  return {
    planSummary: `Planned a ${request.style} style ${worldTitle.toLowerCase()} with ${zones.length} core zones and ${web3Proofs.length} proof modules.`,
    spec,
    provider: DISPLAY_PROVIDER_DEMO,
    model: DISPLAY_MODEL_DEMO,
  };
}
