export type AgentTraceEvent = {
  step: string;
  label: string;
  status: "done" | "failed" | "repaired";
  detail: string;
};
