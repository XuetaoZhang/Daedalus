import { CheckCircle2, CircleAlert } from "lucide-react";
import type { AgentTraceEvent } from "../agent/types";

type AgentTracePanelProps = {
  trace: AgentTraceEvent[];
};

export function AgentTracePanel({ trace }: AgentTracePanelProps) {
  return (
    <section className="panel-section trace-section">
      <h2>Agent Workflow</h2>
      <ol className="trace-list">
        {trace.map((event) => (
          <li key={event.step} className={`trace-item ${event.status}`}>
            {event.status === "failed" ? (
              <CircleAlert size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <div>
              <strong>{event.label}</strong>
              <span>{event.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
