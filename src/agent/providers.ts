import type { PlannerOutput, StudioGenerationRequest } from "./types";
import { parseSceneSpec } from "./sceneSchema";
import { runtimeConfig } from "./runtimeConfig";
import { buildMockSceneSpec } from "./mockPlanner";

type PlannerProvider = {
  id: "deepseek" | "mock";
  label: string;
  generate(request: StudioGenerationRequest): Promise<PlannerOutput>;
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
    "}",
    "Use 4 to 8 zones.",
    "Allowed zone types: entrance, main_stage, track_zone, project_booth, sponsor_zone, timeline, nft_wall, wallet_badge.",
    "Every zone must include exactly these keys: id, type, title, subtitle, position, color, accent, interactions.",
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

const deepSeekProvider: PlannerProvider = {
  id: "deepseek",
  label: "DeepSeek",
  async generate(request) {
    const response = await fetch(`${runtimeConfig.deepseekBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${runtimeConfig.deepseekApiKey}`,
      },
      body: JSON.stringify({
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
      }),
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
      provider: "DeepSeek",
      model: payload?.model || runtimeConfig.deepseekModel,
    };
  },
};

const mockProvider: PlannerProvider = {
  id: "mock",
  label: "Mock Planner",
  async generate(request) {
    return buildMockSceneSpec(request);
  },
};

export async function generatePlannedScene(request: StudioGenerationRequest): Promise<PlannerOutput> {
  if (runtimeConfig.deepseekApiKey) {
    try {
      return await deepSeekProvider.generate(request);
    } catch (error) {
      console.warn("DeepSeek planner failed; falling back to mock planner.", error);
      return mockProvider.generate(request);
    }
  }

  return mockProvider.generate(request);
}
