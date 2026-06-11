import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  Sparkles,
} from "lucide-react";
import { Suspense, useState } from "react";
import { demoSceneSpec } from "./world/demoSceneSpec";
import { GameStyleWorld } from "./world/GameStyleWorld";
import { runMockAgentWorkflow } from "./agent/mockWorkflow";

const trace = runMockAgentWorkflow(demoSceneSpec);

type PageTab = "home" | "studio";

const workflowCards = [
  {
    id: "01",
    title: "Interpret Brief",
    detail: "Resolve Web3 goals, audience, venue type, and system constraints.",
  },
  {
    id: "02",
    title: "Plan Layout",
    detail: "Map entrances, zones, paths, proof walls, and focal landmarks.",
  },
  {
    id: "03",
    title: "Generate Spec",
    detail: "Produce a controlled scene schema and asset placement plan.",
  },
  {
    id: "04",
    title: "Render Inspect",
    detail: "Check spatial readability, scene completeness, and browser output.",
  },
  {
    id: "05",
    title: "Repair Optimize",
    detail: "Patch issues, rebalance coverage, and align performance budget.",
  },
  {
    id: "06",
    title: "Export Bundle",
    detail: "Ship preview, trace, scene spec, and demo-ready deliverables.",
  },
];

const promptPresets = [
  "A futuristic AI x Web3 demo day arena with sponsor booths, NFT proof wall, and a main stage.",
  "A DAO summit hall with governance chambers, workshop pods, and onchain identity displays.",
  "A playable NFT gallery district with creator booths, event stage, and branded social hub.",
];

export function App() {
  const [activePage, setActivePage] = useState<PageTab>("home");
  const [prompt, setPrompt] = useState(promptPresets[0]);

  return (
    <main className="site-shell">
      <header className="global-nav">
        <button className="brand-lockup" onClick={() => setActivePage("home")}>
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-core" />
          </span>
          <span className="brand-wordmark">DAEDALUS</span>
        </button>

        <nav className="nav-links" aria-label="Primary">
          <button className={activePage === "home" ? "is-active" : ""} onClick={() => setActivePage("home")}>
            Home
          </button>
          <button className={activePage === "studio" ? "is-active" : ""} onClick={() => setActivePage("studio")}>
            Studio
          </button>
        </nav>

        <button className="nav-cta" onClick={() => setActivePage("studio")}>
          Enter Studio
        </button>
      </header>

      {activePage === "home" ? (
        <HomePage onEnterStudio={() => setActivePage("studio")} />
      ) : (
        <StudioPage prompt={prompt} onPromptChange={setPrompt} onGoHome={() => setActivePage("home")} />
      )}
    </main>
  );
}

function HomePage({ onEnterStudio }: { onEnterStudio: () => void }) {
  return (
    <div className="page-home">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="hero-eyebrow">Agentic 3D World Builder for Web3</p>
          <h1 className="hero-title">
            BUILD WORLDS.
            <br />
            NOT SLIDES.
          </h1>
          <p className="hero-description">
            Daedalus turns Web3 briefs into navigable, validated, deployable 3D worlds with a GLM-5.1 agent
            workflow.
          </p>
          <div className="hero-actions">
            <button className="solid-button" onClick={onEnterStudio}>
              Get Started
              <ArrowRight size={18} />
            </button>
            <button className="ghost-button">Watch Demo</button>
          </div>
          <div className="hero-stats">
            <StatValue value="120+" label="Worlds Generated" />
            <StatValue value="3,000+" label="Scene Elements" />
            <StatValue value="450+" label="Reusable Models" />
          </div>
        </div>

        <div className="hero-scene">
          <SceneCanvas className="hero-canvas" cameraTarget={[0, 0, 0.2]} zoomRange={[40, 78]} />
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-heading">
          <p>GLM-5.1 Long-Horizon Workflow</p>
        </div>
        <div className="workflow-grid">
          {workflowCards.map((card) => (
            <article className="workflow-card" key={card.id}>
              <span className="workflow-index">{card.id}</span>
              <h2>{card.title}</h2>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function StudioPage({
  prompt,
  onPromptChange,
  onGoHome,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGoHome: () => void;
}) {
  return (
    <div className="page-studio">
      <section className="studio-layout">
        <aside className="studio-sidebar">
          <div className="studio-card studio-composer">
            <div className="studio-card-head">
              <span>Prompt Composer</span>
            </div>
            <textarea
              className="prompt-input"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              placeholder="Describe your Web3 world..."
            />

            <div className="field-stack">
              <label className="field-label">
                <span>Scene Type</span>
                <select defaultValue="Hackathon Arena">
                  <option>Hackathon Arena</option>
                  <option>DAO Hall</option>
                  <option>NFT Gallery</option>
                </select>
              </label>

              <div className="field-label">
                <span>Theme</span>
                <div className="theme-swatches" aria-hidden="true">
                  <button className="swatch swatch-dark is-selected" />
                  <button className="swatch swatch-stone" />
                  <button className="swatch swatch-sand" />
                </div>
              </div>

              <button className="solid-button studio-generate">
                Generate World
                <Sparkles size={16} />
              </button>
            </div>
          </div>

          <div className="studio-card preset-card">
            <div className="studio-card-head">
              <span>Prompt Presets</span>
            </div>
            <div className="preset-list">
              {promptPresets.map((preset) => (
                <button className="preset-item" key={preset} onClick={() => onPromptChange(preset)}>
                  <ChevronRight size={14} />
                  <span>{preset}</span>
                </button>
              ))}
            </div>
            <button className="back-link" onClick={onGoHome}>
              Return to Home
            </button>
          </div>
        </aside>

        <div className="studio-main">
          <section className="studio-card workflow-panel">
            <div className="studio-card-head">
              <span>Agent Workflow / Validation</span>
              <span className="status-pill">Complete</span>
            </div>
            <ol className="workflow-trace">
              {trace.map((event) => (
                <li className={`trace-row trace-${event.status}`} key={event.step}>
                  {event.status === "failed" ? <CircleAlert size={16} /> : <CheckCircle2 size={16} />}
                  <div>
                    <strong>{event.label}</strong>
                    <p>{event.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="studio-card preview-panel">
            <div className="studio-card-head">
              <span>3D Scene Preview</span>
              <div className="preview-meta">
                <span className="meta-pill">Three.js WebGL</span>
                <span className="meta-pill">Game Style</span>
              </div>
            </div>
            <div className="preview-stage">
              <SceneCanvas className="studio-canvas" cameraTarget={[0, 0, 0.2]} zoomRange={[42, 72]} />
              <button className="export-button">
                <Download size={14} />
                Export Scene Bundle
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function SceneCanvas({
  className,
  cameraTarget,
  zoomRange,
  backgroundColor = "#efe4ca",
  fogColor = "#efe4ca",
}: {
  className: string;
  cameraTarget: [number, number, number];
  zoomRange: [number, number];
  backgroundColor?: string;
  fogColor?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        orthographic
        camera={{ position: [0, 11.5, 8.4], zoom: 52, near: 0.1, far: 80 }}
        onCreated={({ camera }) => camera.lookAt(...cameraTarget)}
        shadows
      >
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[fogColor, 12, 24]} />
        <ambientLight intensity={1.45} />
        <directionalLight
          castShadow
          position={[-5, 8, 5]}
          intensity={2.15}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight args={["#fff4da", "#b6c7a5", 1.3]} />
        <Suspense fallback={null}>
          <GameStyleWorld />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minZoom={zoomRange[0]}
          maxZoom={zoomRange[1]}
          maxPolarAngle={Math.PI / 2.35}
          minPolarAngle={Math.PI / 5}
          target={cameraTarget}
        />
      </Canvas>
    </div>
  );
}

function StatValue({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
