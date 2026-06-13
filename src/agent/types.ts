import type { SceneConstraint, SceneSpec, SceneTheme, WorldStyle, WorldType } from "../world/sceneSpec";

export type StudioSceneType = "hackathon_arena" | "dao_hall" | "nft_gallery";

export type WorkflowPhase =
  | "idle"
  | "planning"
  | "generating"
  | "validating"
  | "repairing"
  | "complete"
  | "error";

export type AgentTraceStatus = "pending" | "running" | "done" | "failed" | "repaired";

export type AgentTraceEvent = {
  step: string;
  label: string;
  status: AgentTraceStatus;
  detail: string;
  tool?: string;
};

export type ValidationSeverity = "warning" | "error";

export type ValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  repairAction: string;
};

export type Artifact = {
  id: string;
  label: string;
  filename: string;
  mimeType: "application/json" | "text/markdown";
  content: string;
};

export type StudioGenerationRequest = {
  prompt: string;
  sceneType: StudioSceneType;
  style: WorldStyle;
  theme: SceneTheme;
  constraints: SceneConstraint[];
};

export type PlannerOutput = {
  planSummary: string;
  spec: SceneSpec;
  provider: string;
  model: string;
};

export type RepairDecision = {
  shouldRepair: boolean;
  orderedIssueCodes: string[];
  repairSummary: string;
  nextAction: string;
  provider: string;
  model: string;
};

export type CompletionDecision = {
  readyToExport: boolean;
  exportSummary: string;
  rationale: string;
  provider: string;
  model: string;
};

export type StudioWorkflowSnapshot = {
  phase: WorkflowPhase;
  trace: AgentTraceEvent[];
  sceneSpec: SceneSpec;
  issues: ValidationIssue[];
  artifacts: Artifact[];
  providerLabel: string;
  headline: string;
};

export type WorldTypeMap = Record<StudioSceneType, WorldType>;
