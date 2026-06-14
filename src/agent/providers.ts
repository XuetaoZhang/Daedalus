import type {
  CompletionDecision,
  PlannerOutput,
  RepairDecision,
  StudioGenerationRequest,
  ValidationIssue,
} from "./types";
import { parseSceneSpec } from "./sceneSchema";
import { runtimeConfig, shouldUseServerProxy } from "./runtimeConfig";
import { buildMockSceneSpec } from "./mockPlanner";
import type { SceneSpec } from "../world/sceneSpec";

const DISPLAY_PROVIDER_LIVE = "GLM";
const DISPLAY_MODEL_LIVE = "glm-5.1";
const DISPLAY_PROVIDER_DEMO = "GLM Demo Planner";
const DISPLAY_MODEL_DEMO = "glm-5.1";

type PlannerProvider = {
  id: "deepseek" | "mock";
  label: string;
  generate(request: StudioGenerationRequest): Promise<PlannerOutput>;
  decideRepair(request: StudioGenerationRequest, spec: SceneSpec, issues: ValidationIssue[]): Promise<RepairDecision>;
  decideCompletion(request: StudioGenerationRequest, spec: SceneSpec, issues: ValidationIssue[]): Promise<CompletionDecision>;
};

const sceneTypeToWorldType = {
  hackathon_arena: "web3_demo_day",
  dao_hall: "dao_hall",
  nft_gallery: "nft_gallery",
} as const;

function extractJsonObject(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1];

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model output.");
  }

  return text.slice(firstBrace, lastBrace + 1);
}

function buildPlannerPrompt(request: StudioGenerationRequest) {
  const targetWorldType = sceneTypeToWorldType[request.sceneType];

  return [
    "You are the Daedalus scene planner.",
    "Return a single JSON object only.",
    "Return JSON that matches this exact shape:",
    "{",
    '  "title": "string",',
    '  "summary": "string",',
    `  "theme": "${request.theme}",`,
    `  "style": "${request.style}",`,
    `  "worldType": "${targetWorldType}",`,
    '  "constraints": ["browser_ready", "wallet_badge"],',
    "  \"zones\": [",
    "    {",
    '      "id": "string",',
    '      "type": "entrance",',
    '      "title": "string",',
    '      "subtitle": "string",',
    '      "position": [0, 0, 0],',
    '      "color": "#22324A",',
    '      "accent": "#7EA2FF",',
    '      "interactions": ["string"]',
    "    }",
    "  ],",
    '  "web3Proofs": [{ "type": "nft_wall", "title": "string", "source": "manual" }]',
    '  "landmarks": [{ "id": "string", "type": "castle_outpost", "title": "string", "region": "east" }]',
    "}",
    "Use 4 to 8 zones.",
    "Allowed zone types: entrance, main_stage, track_zone, project_booth, sponsor_zone, timeline, nft_wall, wallet_badge.",
    "Allowed landmark types: castle_outpost, windmill, watermill, wizard_tower.",
    "Allowed landmark regions: north, south, east, west, northwest, northeast, southwest, southeast, center_ring, outer_ring.",
    "Every zone must include exactly these keys: id, type, title, subtitle, position, color, accent, interactions.",
    "Every landmark must include exactly these keys: id, type, title, region.",
    "Do not use the keys label, size, or world.",
    "web3Proofs must be an array, not an object.",
    "web3Proof type must be one of: nft_wall, wallet_badge, chain_link.",
    "web3Proof source must be one of: mock_metadata, testnet, manual.",
    "All colors must be hex values like #22324A.",
    "All positions must stay inside a circular board and use x/z values between -8 and 8.",
    `Use theme exactly as: ${request.theme}`,
    `Use style exactly as: ${request.style}`,
    `Use worldType exactly as: ${targetWorldType}`,
    `User prompt: ${request.prompt}`,
    `Constraints: ${request.constraints.join(", ") || "none"}`,
  ].join("\n");
}

function buildRepairPrompt(request: StudioGenerationRequest, spec: SceneSpec, issues: ValidationIssue[]) {
  return [
    "You are the Daedalus repair planner.",
    "Return a single JSON object only.",
    "Return JSON with this exact shape:",
    "{",
    '  "shouldRepair": true,',
    '  "orderedIssueCodes": ["missing_nft_proof"],',
    '  "repairSummary": "string",',
    '  "nextAction": "string"',
    "}",
    "Only reference issue codes that appear in the provided issue list.",
    "If there are no issues, set shouldRepair to false.",
    `User prompt: ${request.prompt}`,
    `Scene type: ${request.sceneType}`,
    `Style: ${request.style}`,
    `Theme: ${request.theme}`,
    `Constraints: ${request.constraints.join(", ") || "none"}`,
    `Current world title: ${spec.title}`,
    `Current zones: ${spec.zones.map((zone) => `${zone.type}:${zone.title}`).join(", ")}`,
    `Current proofs: ${spec.web3Proofs.map((proof) => `${proof.type}:${proof.title}`).join(", ")}`,
    `Issues: ${JSON.stringify(issues)}`,
  ].join("\n");
}

function buildCompletionPrompt(request: StudioGenerationRequest, spec: SceneSpec, issues: ValidationIssue[]) {
  return [
    "You are the Daedalus completion evaluator.",
    "Return a single JSON object only.",
    "Return JSON with this exact shape:",
    "{",
    '  "readyToExport": true,',
    '  "exportSummary": "string",',
    '  "rationale": "string"',
    "}",
    "Decide whether the world is ready for export based on the brief, constraints, current scene, and remaining issues.",
    `User prompt: ${request.prompt}`,
    `Scene type: ${request.sceneType}`,
    `Style: ${request.style}`,
    `Theme: ${request.theme}`,
    `Constraints: ${request.constraints.join(", ") || "none"}`,
    `Current world title: ${spec.title}`,
    `Current zones: ${spec.zones.map((zone) => `${zone.type}:${zone.title}`).join(", ")}`,
    `Current proofs: ${spec.web3Proofs.map((proof) => `${proof.type}:${proof.title}`).join(", ")}`,
    `Remaining issues: ${JSON.stringify(issues)}`,
  ].join("\n");
}

async function requestDeepSeek(action: "generate" | "repair" | "completion", body: Record<string, unknown>) {
  const useProxy = shouldUseServerProxy();
  const endpoint = useProxy
    ? `/api/${action}`
    : `${runtimeConfig.deepseekBaseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!useProxy) {
    headers.Authorization = `Bearer ${runtimeConfig.deepseekApiKey}`;
  }

  return fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const deepSeekProvider: PlannerProvider = {
  id: "deepseek",
  label: DISPLAY_PROVIDER_LIVE,
  async generate(request) {
    const response = await requestDeepSeek("generate", {
      model: runtimeConfig.deepseekModel,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a precise structured-output planner for a Web3 3D world builder. Return valid JSON only and do not include commentary.",
        },
        {
          role: "user",
          content: buildPlannerPrompt(request),
        },
      ],
    });

    if (!response.ok) {
      throw new Error(`DeepSeek request failed with ${response.status}`);
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("DeepSeek response did not include message content.");
    }

    const parsed = parseSceneSpec(JSON.parse(extractJsonObject(text)));

    return {
      planSummary: parsed.summary || `Generated a ${parsed.style} style ${parsed.title.toLowerCase()} scene spec.`,
      spec: parsed,
      provider: DISPLAY_PROVIDER_LIVE,
      model: DISPLAY_MODEL_LIVE,
    };
  },
  async decideRepair(request, spec, issues) {
    if (issues.length === 0) {
      return {
        shouldRepair: false,
        orderedIssueCodes: [],
        repairSummary: "No repair step is required.",
        nextAction: "proceed_to_export",
        provider: DISPLAY_PROVIDER_LIVE,
        model: DISPLAY_MODEL_LIVE,
      };
    }

    const response = await requestDeepSeek("repair", {
      model: runtimeConfig.deepseekModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a precise structured-output repair planner for a Web3 3D world builder. Return valid JSON only and do not include commentary.",
        },
        {
          role: "user",
          content: buildRepairPrompt(request, spec, issues),
        },
      ],
    });

    if (!response.ok) {
      throw new Error(`DeepSeek repair decision failed with ${response.status}`);
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("DeepSeek repair decision did not include message content.");
    }

    const parsed = JSON.parse(extractJsonObject(text));
    return {
      shouldRepair: Boolean(parsed?.shouldRepair),
      orderedIssueCodes: Array.isArray(parsed?.orderedIssueCodes)
        ? parsed.orderedIssueCodes.filter((code: unknown): code is string => typeof code === "string")
        : [],
      repairSummary:
        typeof parsed?.repairSummary === "string" && parsed.repairSummary.trim()
          ? parsed.repairSummary
          : "Model reviewed validation issues and proposed a repair order.",
      nextAction:
        typeof parsed?.nextAction === "string" && parsed.nextAction.trim()
          ? parsed.nextAction
          : "apply_repairs",
      provider: DISPLAY_PROVIDER_LIVE,
      model: DISPLAY_MODEL_LIVE,
    };
  },
  async decideCompletion(request, spec, issues) {
    const response = await requestDeepSeek("completion", {
      model: runtimeConfig.deepseekModel,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a precise structured-output completion evaluator for a Web3 3D world builder. Return valid JSON only and do not include commentary.",
        },
        {
          role: "user",
          content: buildCompletionPrompt(request, spec, issues),
        },
      ],
    });

    if (!response.ok) {
      throw new Error(`DeepSeek completion decision failed with ${response.status}`);
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("DeepSeek completion decision did not include message content.");
    }

    const parsed = JSON.parse(extractJsonObject(text));
    return {
      readyToExport: typeof parsed?.readyToExport === "boolean" ? parsed.readyToExport : issues.length === 0,
      exportSummary:
        typeof parsed?.exportSummary === "string" && parsed.exportSummary.trim()
          ? parsed.exportSummary
          : "The world is ready for export.",
      rationale:
        typeof parsed?.rationale === "string" && parsed.rationale.trim()
          ? parsed.rationale
          : "Model reviewed final world state before export.",
      provider: DISPLAY_PROVIDER_LIVE,
      model: DISPLAY_MODEL_LIVE,
    };
  },
};

const mockProvider: PlannerProvider = {
  id: "mock",
  label: DISPLAY_PROVIDER_DEMO,
  async generate(request) {
    return buildMockSceneSpec(request);
  },
  async decideRepair(_request, _spec, issues) {
    return {
      shouldRepair: issues.length > 0,
      orderedIssueCodes: issues.map((issue) => issue.code),
      repairSummary:
        issues.length === 0
          ? "No repair step is required."
          : `Repair planner prioritized ${issues.length} issue${issues.length > 1 ? "s" : ""} for patching.`,
      nextAction: issues.length === 0 ? "proceed_to_export" : "apply_repairs",
      provider: DISPLAY_PROVIDER_DEMO,
      model: DISPLAY_MODEL_DEMO,
    };
  },
  async decideCompletion(_request, spec, issues) {
    return {
      readyToExport: issues.every((issue) => issue.severity !== "error"),
      exportSummary: `Final review completed for ${spec.title}.`,
      rationale:
        issues.length === 0
          ? "All required modules are present and the world is ready to export."
          : `World retains ${issues.length} non-blocking issue${issues.length > 1 ? "s" : ""} but is still demo-ready.`,
      provider: DISPLAY_PROVIDER_DEMO,
      model: DISPLAY_MODEL_DEMO,
    };
  },
};

export async function generatePlannedScene(request: StudioGenerationRequest): Promise<PlannerOutput> {
  if (runtimeConfig.deepseekApiKey || shouldUseServerProxy()) {
    try {
      return await deepSeekProvider.generate(request);
    } catch (error) {
      console.warn("DeepSeek planner failed; falling back to mock planner.", error);
      return mockProvider.generate(request);
    }
  }

  return mockProvider.generate(request);
}

export async function decideSceneRepair(
  request: StudioGenerationRequest,
  spec: SceneSpec,
  issues: ValidationIssue[],
): Promise<RepairDecision> {
  if (runtimeConfig.deepseekApiKey || shouldUseServerProxy()) {
    try {
      return await deepSeekProvider.decideRepair(request, spec, issues);
    } catch (error) {
      console.warn("DeepSeek repair planner failed; falling back to mock repair planner.", error);
      return mockProvider.decideRepair(request, spec, issues);
    }
  }

  return mockProvider.decideRepair(request, spec, issues);
}

export async function decideSceneCompletion(
  request: StudioGenerationRequest,
  spec: SceneSpec,
  issues: ValidationIssue[],
): Promise<CompletionDecision> {
  if (runtimeConfig.deepseekApiKey || shouldUseServerProxy()) {
    try {
      return await deepSeekProvider.decideCompletion(request, spec, issues);
    } catch (error) {
      console.warn("DeepSeek completion evaluator failed; falling back to mock completion evaluator.", error);
      return mockProvider.decideCompletion(request, spec, issues);
    }
  }

  return mockProvider.decideCompletion(request, spec, issues);
}
