import type { SceneSpec } from "../world/sceneSpec";
import type { AgentTraceEvent } from "./types";

export function runMockAgentWorkflow(spec: SceneSpec): AgentTraceEvent[] {
  const hasProofWall = spec.web3Proofs.some((proof) => proof.type === "nft_wall");

  return [
    {
      step: "analyze_requirement",
      label: "Analyze requirement",
      status: "done",
      detail: "Detected a Web3 demo day world brief with event, booth, proof, and stage needs.",
    },
    {
      step: "create_spatial_plan",
      label: "Create spatial plan",
      status: "done",
      detail: `${spec.zones.length} zones arranged around a central arena path.`,
    },
    {
      step: "generate_scene_spec",
      label: "Generate scene spec",
      status: "done",
      detail: "Produced a controlled JSON spec for the Three.js renderer.",
    },
    {
      step: "validate_scene_spec",
      label: "Validate scene spec",
      status: hasProofWall ? "done" : "failed",
      detail: hasProofWall ? "Web3 proof wall found." : "Missing Web3 proof wall.",
    },
    {
      step: "repair_scene_spec",
      label: "Repair scene spec",
      status: "repaired",
      detail: "Added proof requirements and verified the scene can be packaged.",
    },
    {
      step: "export_package",
      label: "Export package",
      status: "done",
      detail: "Ready to export scene spec, trace, README, and demo script.",
    },
  ];
}
