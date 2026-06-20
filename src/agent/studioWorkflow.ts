import type { SceneConstraint, SceneSpec, ZoneSpec } from "../world/sceneSpec";
import { demoSceneSpec } from "../world/demoSceneSpec";
import { decideSceneCompletion, decideSceneRepair, generatePlannedScene } from "./providers";
import { parseSceneSpec } from "./sceneSchema";
import type {
  AgentTraceEvent,
  Artifact,
  CompletionDecision,
  PlannerOutput,
  RepairDecision,
  StudioGenerationRequest,
  StudioWorkflowSnapshot,
  ValidationIssue,
  WorkflowPhase,
} from "./types";

const baseTrace: AgentTraceEvent[] = [
  { step: "interpret_brief", label: "Interpret Brief", status: "pending", detail: "Waiting to analyze the request." },
  { step: "plan_layout", label: "Plan Spatial Layout", status: "pending", detail: "Waiting to map the world structure." },
  { step: "generate_spec", label: "Generate Scene Spec", status: "pending", detail: "Waiting to produce structured JSON." },
  { step: "validate", label: "Validate Scene", status: "pending", detail: "Waiting to inspect rules and required modules." },
  { step: "repair", label: "Repair Issues", status: "pending", detail: "Waiting to patch missing or invalid scene parts." },
  { step: "export", label: "Export Deliverables", status: "pending", detail: "Waiting to package trace and artifacts." },
];

function updateTrace(trace: AgentTraceEvent[], step: string, patch: Partial<AgentTraceEvent>) {
  return trace.map((event) => (event.step === step ? { ...event, ...patch } : event));
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function shouldHaveConstraint(constraints: SceneConstraint[], constraint: SceneConstraint) {
  return constraints.includes(constraint);
}

function hasZone(spec: SceneSpec, type: ZoneSpec["type"]) {
  return spec.zones.some((zone) => zone.type === type);
}

function validateSceneSpec(spec: SceneSpec, request: StudioGenerationRequest) {
  const issues: ValidationIssue[] = [];

  if (!hasZone(spec, "main_stage")) {
    issues.push({
      code: "missing_main_stage",
      severity: "error",
      message: "Main stage is missing from the current world plan.",
      repairAction: "Insert a central main stage zone.",
    });
  }

  if (shouldHaveConstraint(request.constraints, "nft_proof_wall") && !spec.web3Proofs.some((proof) => proof.type === "nft_wall")) {
    issues.push({
      code: "missing_nft_proof",
      severity: "error",
      message: "NFT proof wall is required but missing from the generated package.",
      repairAction: "Add an NFT proof wall zone and matching proof metadata.",
    });
  }

  if (shouldHaveConstraint(request.constraints, "wallet_badge") && !spec.web3Proofs.some((proof) => proof.type === "wallet_badge")) {
    issues.push({
      code: "missing_wallet_badge",
      severity: "warning",
      message: "Wallet badge proof is missing from the generated world.",
      repairAction: "Add a wallet badge proof card.",
    });
  }

  if (shouldHaveConstraint(request.constraints, "sponsor_zone") && !hasZone(spec, "sponsor_zone")) {
    issues.push({
      code: "missing_sponsor_zone",
      severity: "warning",
      message: "Sponsor zone was requested but is not present in the current layout.",
      repairAction: "Create a sponsor zone on the outer ring.",
    });
  }

  if (shouldHaveConstraint(request.constraints, "timeline_corridor") && !hasZone(spec, "timeline")) {
    issues.push({
      code: "missing_timeline",
      severity: "warning",
      message: "Timeline corridor is missing from the generated flow.",
      repairAction: "Append a timeline corridor zone.",
    });
  }

  if ((spec.terrainDirectives?.length ?? 0) > 0 && !spec.terrainProfile) {
    issues.push({
      code: "terrain_profile_missing",
      severity: "warning",
      message: "Terrain directives are present but no terrain profile was provided.",
      repairAction: "Use a mixed terrain profile so regional directives have a stable base map.",
    });
  }

  return issues;
}

function repairSceneSpec(spec: SceneSpec, request: StudioGenerationRequest, issues: ValidationIssue[]) {
  const nextSpec: SceneSpec = {
    ...spec,
    constraints: request.constraints,
    zones: [...spec.zones],
    web3Proofs: [...spec.web3Proofs],
  };

  const additions: string[] = [];

  for (const issue of issues) {
    if (issue.code === "missing_main_stage" && !hasZone(nextSpec, "main_stage")) {
      nextSpec.zones.push({
        id: "main-stage",
        type: "main_stage",
        title: "Main Stage",
        subtitle: "Recovered by repair planner",
        position: [0, 0, -6],
        color: "#352061",
        accent: "#b785ff",
        interactions: ["view_schedule"],
      });
      additions.push("Added a main stage.");
    }

    if (issue.code === "missing_nft_proof" && !nextSpec.web3Proofs.some((proof) => proof.type === "nft_wall")) {
      nextSpec.web3Proofs.push({
        type: "nft_wall",
        title: "Builder Proof Wall",
        source: "mock_metadata",
      });
      nextSpec.zones.push({
        id: "proof-wall",
        type: "nft_wall",
        title: "Proof Wall",
        subtitle: "Recovered Web3 proof zone",
        position: [6, 0, 3],
        color: "#2c2547",
        accent: "#c4a7ff",
        interactions: ["view_badges"],
      });
      additions.push("Recovered the NFT proof wall.");
    }

    if (issue.code === "missing_wallet_badge" && !nextSpec.web3Proofs.some((proof) => proof.type === "wallet_badge")) {
      nextSpec.web3Proofs.push({
        type: "wallet_badge",
        title: "Visitor Badge",
        source: "manual",
      });
      additions.push("Added a wallet badge proof.");
    }

    if (issue.code === "missing_sponsor_zone" && !hasZone(nextSpec, "sponsor_zone")) {
      nextSpec.zones.push({
        id: "sponsor-zone",
        type: "sponsor_zone",
        title: "Sponsor Zone",
        subtitle: "Recovered partner activation area",
        position: [5, 0, -6],
        color: "#4a3044",
        accent: "#ff86bc",
      });
      additions.push("Added a sponsor zone.");
    }

    if (issue.code === "missing_timeline" && !hasZone(nextSpec, "timeline")) {
      nextSpec.zones.push({
        id: "timeline",
        type: "timeline",
        title: "Timeline Corridor",
        subtitle: "Recovered project timeline path",
        position: [-7, 0, 4],
        color: "#1f4737",
        accent: "#8fffbd",
      });
      additions.push("Added a timeline corridor.");
    }
  }

  return {
    spec: parseSceneSpec(nextSpec),
    detail: additions.join(" ") || "No repair action was required.",
  };
}

function createArtifacts(
  spec: SceneSpec,
  trace: AgentTraceEvent[],
  issues: ValidationIssue[],
  providerSummary: PlannerOutput,
  repairDecision?: RepairDecision,
  completionDecision?: CompletionDecision,
): Artifact[] {
  const currentDate = new Date().toISOString().slice(0, 10);
  const validationReport = {
    provider: providerSummary.provider,
    model: providerSummary.model,
    issues,
    terrain: {
      profile: spec.terrainProfile ?? "mixed",
      seed: spec.terrainSeed,
      directives: spec.terrainDirectives ?? [],
      directiveCount: spec.terrainDirectives?.length ?? 0,
    },
    repaired: issues.length > 0,
    repairDecision,
    completionDecision,
  };

  return [
    {
      id: "scene-spec",
      label: "Scene Spec",
      filename: "scene_spec.json",
      mimeType: "application/json",
      content: JSON.stringify(spec, null, 2),
    },
    {
      id: "execution-trace",
      label: "Execution Trace",
      filename: "execution_trace.json",
      mimeType: "application/json",
      content: JSON.stringify(trace, null, 2),
    },
    {
      id: "validation-report",
      label: "Validation Report",
      filename: "validation_report.json",
      mimeType: "application/json",
      content: JSON.stringify(validationReport, null, 2),
    },
    {
      id: "submission-package",
      label: "Submission Package",
      filename: "submission_package.md",
      mimeType: "text/markdown",
      content: [
        "# Daedalus Submission Package",
        "",
        `- Provider: ${providerSummary.provider}`,
        `- Model: ${providerSummary.model}`,
        `- World: ${spec.title}`,
        `- Style: ${spec.style}`,
        `- Zones: ${spec.zones.length}`,
        `- Proof modules: ${spec.web3Proofs.length}`,
        "",
        "## Workflow Summary",
        providerSummary.planSummary,
        "",
        "## Validation",
        issues.length === 0 ? "- No validation issues." : issues.map((issue) => `- ${issue.message}`).join("\n"),
        "",
        "## Repair Decision",
        repairDecision
          ? `- ${repairDecision.provider} / ${repairDecision.model}: ${repairDecision.repairSummary}`
          : "- No repair decision recorded.",
        "",
        "## Completion Decision",
        completionDecision
          ? `- ${completionDecision.provider} / ${completionDecision.model}: ${completionDecision.exportSummary}`
          : "- No completion decision recorded.",
      ].join("\n"),
    },
    {
      id: "readme",
      label: "README",
      filename: "README.md",
      mimeType: "text/markdown",
      content: [
        "# Daedalus",
        "",
        "Daedalus is an agentic 3D world builder for Web3 demos, hackathons, DAO showcases, and NFT gallery experiences.",
        "",
        "## What it does",
        "",
        "- Turns a natural-language brief into a structured scene spec",
        "- Shows an agent workflow with planning, generation, validation, repair, and export",
        "- Renders a browser-ready 3D world in Three.js",
        "- Exports scene, trace, validation, and submission materials",
        "",
        "## Demo scenario",
        "",
        `Current demo world: **${spec.title}**`,
        `- Style: ${spec.style}`,
        `- Theme: ${spec.theme}`,
        `- Zones: ${spec.zones.length}`,
        `- Proof modules: ${spec.web3Proofs.length}`,
        "",
        "## Workflow",
        "",
        "1. Interpret Brief",
        "2. Plan Spatial Layout",
        "3. Generate Scene Spec",
        "4. Validate Scene",
        "5. Repair Issues",
        "6. Export Deliverables",
        "",
        "## Local run",
        "",
        "```bash",
        "npm install",
        "npm run dev",
        "```",
        "",
        "## Provider",
        "",
        `- Planner provider: ${providerSummary.provider}`,
        `- Planner model: ${providerSummary.model}`,
        repairDecision ? `- Repair decision: ${repairDecision.provider} / ${repairDecision.model}` : "- Repair decision: none",
        completionDecision
          ? `- Completion decision: ${completionDecision.provider} / ${completionDecision.model}`
          : "- Completion decision: none",
        "",
        "## Generated files",
        "",
        "- scene_spec.json",
        "- execution_trace.json",
        "- validation_report.json",
        "- submission_package.md",
        "- README.md",
        "- DEMO_SCRIPT.md",
      ].join("\n"),
    },
    {
      id: "demo-script",
      label: "Demo Script",
      filename: "DEMO_SCRIPT.md",
      mimeType: "text/markdown",
      content: [
        "# Daedalus Demo Script",
        "",
        `Generated on ${currentDate}`,
        "",
        "## 30-second framing",
        "",
        "Daedalus helps a Web3 team turn a plain-language event or community brief into a navigable 3D world, while showing the full agent workflow from planning to repair to export.",
        "",
        "## Demo flow",
        "",
        "1. Start on Home and introduce the product as an agentic 3D world builder for Web3.",
        "2. Show the hero 3D scene and explain that this is the target output format, not a static mock.",
        "3. Scroll to the workflow section and explain the six-step long-horizon loop.",
        "4. Enter Studio and point out the prompt, workflow trace, validation area, and 3D preview.",
        `5. Use the current demo brief for **${spec.title}**.`,
        `6. Mention the live planner provider: **${providerSummary.provider} / ${providerSummary.model}**.`,
        "7. Click Generate World and narrate each workflow step as it advances.",
        "8. Point out that the model reads validation output and decides the repair order.",
        "9. Show the final completion decision before export.",
        "10. End by exporting the generated deliverables.",
        "",
        "## Suggested prompt",
        "",
        spec.summary || "A futuristic AI x Web3 demo day arena with sponsor booths, NFT proof wall, and a main stage.",
        "",
        "## Judges should notice",
        "",
        "- This is a browser-playable output, not only text or images.",
        "- The model is constrained through a scene schema instead of generating arbitrary frontend code.",
        "- The workflow includes planning, validation, repair, and export.",
      ].join("\n"),
    },
  ];
}

function snapshot(
  phase: WorkflowPhase,
  trace: AgentTraceEvent[],
  sceneSpec: SceneSpec,
  issues: ValidationIssue[],
  artifacts: Artifact[],
  providerLabel: string,
  headline: string,
): StudioWorkflowSnapshot {
  return {
    phase,
    trace,
    sceneSpec,
    issues,
    artifacts,
    providerLabel,
    headline,
  };
}

export function createIdleStudioSnapshot(): StudioWorkflowSnapshot {
  return snapshot(
    "idle",
    baseTrace.map((event) => ({ ...event })),
    demoSceneSpec,
    [],
    [],
    "GLM Demo Planner",
    "Ready for a new world brief.",
  );
}

export async function runStudioWorkflow(
  request: StudioGenerationRequest,
  onUpdate: (snapshot: StudioWorkflowSnapshot) => void,
) {
  let trace = baseTrace.map((event) => ({ ...event }));
  let spec = demoSceneSpec;
  let issues: ValidationIssue[] = [];
  let artifacts: Artifact[] = [];
  let repairDecision: RepairDecision | undefined;

  onUpdate(snapshot("planning", trace, spec, issues, artifacts, "Preparing", "Reading the world brief."));
  trace = updateTrace(trace, "interpret_brief", {
    status: "running",
    detail: "Interpreting world type, tone, and required Web3 proof modules.",
    tool: "Prompt Parser",
  });
  onUpdate(snapshot("planning", trace, spec, issues, artifacts, "Preparing", "Interpreting the brief."));
  await sleep(280);

  trace = updateTrace(trace, "interpret_brief", {
    status: "done",
    detail: `Recognized a ${request.style} style ${request.sceneType.replace(/_/g, " ")} brief.`,
  });
  trace = updateTrace(trace, "plan_layout", {
    status: "running",
    detail: "Planning core zones, focal landmarks, and proof-bearing modules.",
    tool: "World Planner",
  });
  onUpdate(snapshot("planning", trace, spec, issues, artifacts, "Planning", "Mapping the world layout."));
  await sleep(260);

  const providerResult = await generatePlannedScene(request);
  trace = updateTrace(trace, "plan_layout", {
    status: "done",
    detail: providerResult.planSummary,
  });
  trace = updateTrace(trace, "generate_spec", {
    status: "running",
    detail: `Generating structured scene JSON with ${providerResult.provider}.`,
    tool: providerResult.model,
  });
  onUpdate(snapshot("generating", trace, spec, issues, artifacts, providerResult.provider, "Generating the scene spec."));

  await sleep(260);
  spec = providerResult.spec;
  trace = updateTrace(trace, "generate_spec", {
    status: "done",
    detail: `Produced a ${spec.style} style scene with ${spec.zones.length} zones.`,
  });
  onUpdate(snapshot("generating", trace, spec, issues, artifacts, providerResult.provider, "Previewing the generated world."));

  await sleep(240);
  trace = updateTrace(trace, "validate", {
    status: "running",
    detail: "Checking schema validity, proof modules, and required world settings.",
    tool: "Schema Validator",
  });
  onUpdate(snapshot("validating", trace, spec, issues, artifacts, providerResult.provider, "Validating structure and proof modules."));
  await sleep(280);

  issues = validateSceneSpec(spec, request);
  trace = updateTrace(trace, "validate", {
    status: issues.some((issue) => issue.severity === "error") ? "failed" : "done",
    detail:
      issues.length === 0
        ? "Validation passed with all required modules present."
        : `${issues.length} issue${issues.length > 1 ? "s" : ""} detected and queued for repair.`,
  });

  if (issues.length > 0) {
    trace = updateTrace(trace, "repair", {
      status: "running",
      detail: "Reading validation output and deciding the repair order.",
      tool: "Repair Planner",
    });
    onUpdate(snapshot("repairing", trace, spec, issues, artifacts, providerResult.provider, "Repairing missing requirements."));
    await sleep(320);

    repairDecision = await decideSceneRepair(request, spec, issues);
    trace = updateTrace(trace, "repair", {
      status: "running",
      detail: repairDecision.repairSummary,
      tool: repairDecision.model,
    });
    onUpdate(snapshot("repairing", trace, spec, issues, artifacts, repairDecision.provider, "Model selected the repair strategy."));
    await sleep(260);

    const orderedIssues =
      repairDecision.orderedIssueCodes.length === 0
        ? issues
        : repairDecision.orderedIssueCodes
            .map((code) => issues.find((issue) => issue.code === code))
            .filter((issue): issue is ValidationIssue => Boolean(issue));

    const repaired = repairSceneSpec(spec, request, orderedIssues.length > 0 ? orderedIssues : issues);
    spec = repaired.spec;
    trace = updateTrace(trace, "repair", {
      status: "repaired",
      detail: `${repairDecision.repairSummary} ${repaired.detail}`.trim(),
    });
  } else {
    trace = updateTrace(trace, "repair", {
      status: "done",
      detail: "No repair pass required.",
    });
  }

  trace = updateTrace(trace, "export", {
    status: "running",
    detail: "Reviewing the final world state and deciding whether it is ready for export.",
    tool: "Artifacts Builder",
  });
  onUpdate(snapshot("repairing", trace, spec, issues, artifacts, providerResult.provider, "Reviewing export readiness."));
  await sleep(220);

  const completionDecision = await decideSceneCompletion(request, spec, issues);
  trace = updateTrace(trace, "export", {
    status: "running",
    detail: completionDecision.exportSummary,
    tool: completionDecision.model,
  });
  onUpdate(
    snapshot(
      "repairing",
      trace,
      spec,
      issues,
      artifacts,
      completionDecision.provider,
      "Completion evaluator approved the export path.",
    ),
  );
  await sleep(220);

  artifacts = createArtifacts(spec, trace, issues, providerResult, repairDecision, completionDecision);
  trace = updateTrace(trace, "export", {
    status: "done",
    detail: `${completionDecision.exportSummary} Prepared ${artifacts.length} exportable deliverables.`,
  });

  onUpdate(
    snapshot(
      "complete",
      trace,
      spec,
      issues,
      artifacts,
      completionDecision.provider,
      completionDecision.readyToExport
        ? "World ready for review and export."
        : "World review completed with follow-up recommendations.",
    ),
  );
}
