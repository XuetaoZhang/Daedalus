import { Box, Sparkles } from "lucide-react";
import type { SceneSpec } from "../world/sceneSpec";

type SceneOverviewProps = {
  spec: SceneSpec;
};

export function SceneOverview({ spec }: SceneOverviewProps) {
  return (
    <section className="panel-section">
      <div className="section-title">
        <Sparkles size={18} />
        <h1>Daedalus</h1>
      </div>
      <p className="subtitle">{spec.title}</p>
      <div className="stats-grid">
        <div>
          <span>{spec.zones.length}</span>
          <small>Zones</small>
        </div>
        <div>
          <span>{spec.web3Proofs.length}</span>
          <small>Proofs</small>
        </div>
      </div>
      <div className="prompt-box">
        <Box size={16} />
        <p>
          Generate a futuristic AI x Web3 Demo Day arena with track zones,
          project booths, sponsor areas, NFT proofs, and a main stage.
        </p>
      </div>
    </section>
  );
}
