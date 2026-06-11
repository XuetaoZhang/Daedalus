import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  Sparkles,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
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
  const [isHomeNavSolid, setIsHomeNavSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nextSolid = window.scrollY >= 56;
      setIsHomeNavSolid((current) => (current === nextSolid ? current : nextSolid));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClassName =
    activePage === "home" && !isHomeNavSolid ? "global-nav is-transparent" : "global-nav is-solid";

  return (
    <main className="site-shell" data-page={activePage}>
      <header className={navClassName}>
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
          <SceneCanvas
            className="hero-canvas"
            cameraTarget={[0.4, 0, 1.15]}
            zoomRange={[50, 84]}
            mode="hero"
          />
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
              <SceneCanvas
                className="studio-canvas"
                cameraTarget={[0, 0, 0.2]}
                zoomRange={[42, 72]}
                mode="studio"
              />
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
  mode,
  zoomRange,
  backgroundColor = "#efe4ca",
  fogColor = "#efe4ca",
}: {
  className: string;
  cameraTarget: [number, number, number];
  mode: "hero" | "studio";
  zoomRange: [number, number];
  backgroundColor?: string;
  fogColor?: string;
}) {
  const cameraSettings = useMemo(
    () =>
      mode === "hero"
        ? { position: [0.9, 10.1, 6.95] as [number, number, number], zoom: 61 }
        : { position: [0, 11.5, 8.4] as [number, number, number], zoom: 52 },
    [mode],
  );

  return (
    <div className={className}>
      <Canvas
        orthographic
        camera={{ position: cameraSettings.position, zoom: cameraSettings.zoom, near: 0.1, far: 80 }}
        onCreated={({ camera }) => camera.lookAt(...cameraTarget)}
        shadows={mode === "studio"}
      >
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[fogColor, 12, 24]} />
        <ambientLight intensity={1.45} />
        <directionalLight
          castShadow={mode === "studio"}
          position={[-5, 8, 5]}
          intensity={2.15}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight args={["#fff4da", "#b6c7a5", 1.3]} />
        <Suspense fallback={null}>
          <GameStyleWorld />
        </Suspense>
        {mode === "hero" ? <HeroCameraRig baseTarget={cameraTarget} /> : null}
        {mode === "studio" ? (
          <OrbitControls
            enablePan={false}
            enableRotate
            enableZoom
            minZoom={zoomRange[0]}
            maxZoom={zoomRange[1]}
            maxPolarAngle={Math.PI / 2.35}
            minPolarAngle={Math.PI / 5}
            target={cameraTarget}
          />
        ) : null}
      </Canvas>
    </div>
  );
}

function HeroCameraRig({ baseTarget }: { baseTarget: [number, number, number] }) {
  const { camera } = useThree();
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const liveTarget = useMemo(() => new THREE.Vector3(...baseTarget), [baseTarget]);
  const targetScrollRef = useRef(0);
  const smoothedScrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      targetScrollRef.current = window.scrollY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;

    const t = state.clock.elapsedTime;
    smoothedScrollRef.current = THREE.MathUtils.damp(
      smoothedScrollRef.current,
      targetScrollRef.current,
      4.8,
      delta,
    );
    const scroll = THREE.MathUtils.clamp(smoothedScrollRef.current / 640, 0, 1.1);
    const driftX = Math.sin(t * 0.16) * 0.46;
    const driftZ = Math.cos(t * 0.21) * 0.28;
    const smooth = 1 - Math.exp(-delta * 2.1);

    desiredPosition.set(
      0.82 + driftX * 0.68 + scroll * 0.24,
      10.05 - scroll * 0.1,
      6.9 + driftZ * 0.58 - scroll * 0.1,
    );
    desiredTarget.set(
      baseTarget[0] + driftX * 0.24 + scroll * 0.16,
      baseTarget[1],
      baseTarget[2] + driftZ * 0.35 + scroll * 0.08,
    );

    camera.position.lerp(desiredPosition, smooth);
    liveTarget.lerp(desiredTarget, smooth);
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, 61.5 + Math.sin(t * 0.18) * 0.8 + scroll * 2.1, smooth);
    camera.lookAt(liveTarget);
    camera.updateProjectionMatrix();
  });

  return null;
}

function StatValue({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
