import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  LoaderCircle,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createIdleStudioSnapshot, runStudioWorkflow } from "./agent/studioWorkflow";
import type {
  Artifact,
  AgentTraceEvent,
  StudioGenerationRequest,
  StudioSceneType,
  StudioWorkflowSnapshot,
  WorkflowPhase,
} from "./agent/types";
import { demoSceneSpec } from "./world/demoSceneSpec";
import { GameStyleWorld } from "./world/GameStyleWorld";
import type { SceneConstraint, SceneSpec, SceneTheme, WorldStyle } from "./world/sceneSpec";
import { WorldRenderer } from "./world/WorldRenderer";
import { buildStudioWorldLayout } from "./world/studioWorldLayout";

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

const presetCases: Array<{
  label: string;
  prompt: string;
  sceneType: StudioSceneType;
  style: WorldStyle;
  theme: SceneTheme;
}> = [
  {
    label: "Hackathon Arena",
    prompt:
      "A futuristic AI x Web3 demo day arena with sponsor booths, NFT proof wall, and a main stage.",
    sceneType: "hackathon_arena",
    style: "game",
    theme: "futuristic",
  },
  {
    label: "DAO Summit",
    prompt:
      "A governance hall for a DAO summit with voting chambers, proposal lanes, and an identity badge gallery.",
    sceneType: "dao_hall",
    style: "animation",
    theme: "minimal",
  },
  {
    label: "Creator District",
    prompt:
      "A playable NFT gallery district with creator booths, collector lounge, and a proof wall for mint history.",
    sceneType: "nft_gallery",
    style: "voxel",
    theme: "industrial",
  },
];

const constraintOptions: Array<{ value: SceneConstraint; label: string }> = [
  { value: "browser_ready", label: "Browser-ready" },
  { value: "wallet_badge", label: "Wallet badge" },
  { value: "nft_proof_wall", label: "NFT proof wall" },
  { value: "timeline_corridor", label: "Timeline corridor" },
  { value: "sponsor_zone", label: "Sponsor zone" },
];

const styleOptions: Array<{ value: WorldStyle; label: string }> = [
  { value: "game", label: "Game" },
  { value: "animation", label: "Animation" },
  { value: "voxel", label: "Voxel" },
];

const phaseLabelMap: Record<WorkflowPhase, string> = {
  idle: "Idle",
  planning: "Planning",
  generating: "Generating",
  validating: "Validating",
  repairing: "Repairing",
  complete: "Complete",
  error: "Error",
};

const sceneTypeLabels: Record<StudioSceneType, string> = {
  hackathon_arena: "Hackathon Arena",
  dao_hall: "DAO Hall",
  nft_gallery: "NFT Gallery",
};

const defaultStudioRequest: StudioGenerationRequest = {
  prompt: presetCases[0].prompt,
  sceneType: presetCases[0].sceneType,
  style: presetCases[0].style,
  theme: presetCases[0].theme,
  constraints: ["browser_ready", "wallet_badge", "nft_proof_wall", "timeline_corridor", "sponsor_zone"],
};

export function App() {
  const [activePage, setActivePage] = useState<PageTab>("home");
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
        <StudioPage onGoHome={() => setActivePage("home")} />
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
          <SceneCanvas className="hero-canvas" cameraTarget={[0.4, 0, 1.15]} mode="hero" sceneSpec={demoSceneSpec} zoomRange={[50, 84]} />
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

function StudioPage({ onGoHome }: { onGoHome: () => void }) {
  const [request, setRequest] = useState<StudioGenerationRequest>(defaultStudioRequest);
  const [snapshot, setSnapshot] = useState<StudioWorkflowSnapshot>(createIdleStudioSnapshot());
  const [isRunning, setIsRunning] = useState(false);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);

  useEffect(() => {
    if (snapshot.artifacts.length === 0) return;
    if (!activeArtifactId || !snapshot.artifacts.some((artifact) => artifact.id === activeArtifactId)) {
      setActiveArtifactId(snapshot.artifacts[0].id);
    }
  }, [activeArtifactId, snapshot.artifacts]);

  const activeArtifact =
    snapshot.artifacts.find((artifact) => artifact.id === activeArtifactId) ?? snapshot.artifacts[0] ?? null;

  async function handleGenerateWorld() {
    if (!request.prompt.trim()) return;

    setIsRunning(true);

    try {
      await runStudioWorkflow(request, (next) => {
        setSnapshot(next);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown workflow failure.";
      setSnapshot((current) => ({
        ...current,
        phase: "error",
        headline: message,
      }));
    } finally {
      setIsRunning(false);
    }
  }

  function toggleConstraint(value: SceneConstraint) {
    setRequest((current) => ({
      ...current,
      constraints: current.constraints.includes(value)
        ? current.constraints.filter((item) => item !== value)
        : [...current.constraints, value],
    }));
  }

  function applyPreset(preset: (typeof presetCases)[number]) {
    setRequest({
      prompt: preset.prompt,
      sceneType: preset.sceneType,
      style: preset.style,
      theme: preset.theme,
      constraints: defaultStudioRequest.constraints,
    });
    setSnapshot(createIdleStudioSnapshot());
  }

  function downloadArtifact(artifact: Artifact) {
    const blob = new Blob([artifact.content], { type: artifact.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = artifact.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-studio">
      <section className="studio-layout">
        <aside className="studio-sidebar">
          <div className="studio-card studio-composer">
            <div className="studio-card-head">
              <span>Prompt Composer</span>
              <span className="status-pill">{phaseLabelMap[snapshot.phase]}</span>
            </div>

            <textarea
              className="prompt-input"
              value={request.prompt}
              onChange={(event) => setRequest((current) => ({ ...current, prompt: event.target.value }))}
              placeholder="Describe your Web3 world..."
            />

            <div className="field-stack">
              <label className="field-label">
                <span>Scene Type</span>
                <select
                  value={request.sceneType}
                  onChange={(event) =>
                    setRequest((current) => ({
                      ...current,
                      sceneType: event.target.value as StudioSceneType,
                    }))
                  }
                >
                  {Object.entries(sceneTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="field-label">
                <span>Style</span>
                <div className="segmented-control">
                  {styleOptions.map((option) => (
                    <button
                      key={option.value}
                      className={request.style === option.value ? "segment-button is-selected" : "segment-button"}
                      onClick={() => setRequest((current) => ({ ...current, style: option.value }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-label">
                <span>Theme</span>
                <div className="segmented-control">
                  {(["futuristic", "minimal", "industrial"] as SceneTheme[]).map((theme) => (
                    <button
                      key={theme}
                      className={request.theme === theme ? "segment-button is-selected" : "segment-button"}
                      onClick={() => setRequest((current) => ({ ...current, theme }))}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-label">
                <span>Constraints</span>
                <div className="constraint-grid">
                  {constraintOptions.map((option) => (
                    <button
                      key={option.value}
                      className={
                        request.constraints.includes(option.value)
                          ? "constraint-chip is-selected"
                          : "constraint-chip"
                      }
                      onClick={() => toggleConstraint(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="solid-button studio-generate" onClick={handleGenerateWorld} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <LoaderCircle size={16} className="spin" />
                    Running Workflow
                  </>
                ) : (
                  <>
                    Generate World
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="studio-card preset-card">
            <div className="studio-card-head">
              <span>Presets / Artifacts</span>
            </div>

            <div className="preset-list">
              {presetCases.map((preset) => (
                <button className="preset-item" key={preset.label} onClick={() => applyPreset(preset)}>
                  <ChevronRight size={14} />
                  <span>{preset.prompt}</span>
                </button>
              ))}
            </div>

            <div className="artifacts-drawer">
              <div className="drawer-head">
                <span>Artifacts</span>
                <small>{snapshot.artifacts.length === 0 ? "Pending run" : `${snapshot.artifacts.length} ready`}</small>
              </div>
              <div className="artifact-tabs">
                {snapshot.artifacts.map((artifact) => (
                  <button
                    key={artifact.id}
                    className={artifact.id === activeArtifactId ? "artifact-tab is-selected" : "artifact-tab"}
                    onClick={() => setActiveArtifactId(artifact.id)}
                  >
                    {artifact.label}
                  </button>
                ))}
              </div>
              {activeArtifact ? (
                <div className="artifact-preview">
                  <pre>{activeArtifact.content}</pre>
                  <button className="ghost-button compact-button" onClick={() => downloadArtifact(activeArtifact)}>
                    <Download size={14} />
                    Download
                  </button>
                </div>
              ) : (
                <p className="artifact-empty">Run the workflow to generate scene spec, trace, and package outputs.</p>
              )}
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
              <div className="preview-meta">
                <span className="meta-pill">{snapshot.providerLabel}</span>
                <span className="meta-pill">{phaseLabelMap[snapshot.phase]}</span>
              </div>
            </div>

            <div className="workflow-headline">
              <strong>{snapshot.headline}</strong>
              <p>
                {sceneTypeLabels[request.sceneType]} in {request.style} style with {request.constraints.length} active
                constraints.
              </p>
            </div>

            <ol className="workflow-trace">
              {snapshot.trace.map((event) => (
                <TraceRow event={event} key={event.step} />
              ))}
            </ol>

            <div className="workflow-foot-grid">
              <div className="workflow-foot-card">
                <span>Validation</span>
                {snapshot.issues.length === 0 ? (
                  <p>No blocking issues. The current world plan is demo-ready.</p>
                ) : (
                  <ul className="issue-list">
                    {snapshot.issues.map((issue) => (
                      <li key={issue.code}>
                        <strong>{issue.message}</strong>
                        <span>{issue.repairAction}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="workflow-foot-card">
                <span>Artifacts</span>
                <p>
                  {snapshot.artifacts.length === 0
                    ? "Artifacts will appear after export."
                    : `${snapshot.artifacts.length} deliverables prepared for review and download.`}
                </p>
              </div>
            </div>
          </section>

          <section className="studio-card preview-panel">
            <div className="studio-card-head">
              <span>3D Scene Preview</span>
              <div className="preview-meta">
                <span className="meta-pill">{request.style}</span>
                <span className="meta-pill">{request.theme}</span>
              </div>
            </div>
            <div className="preview-stage">
              <SceneCanvas className="studio-canvas" cameraTarget={[0, 0, 0]} mode="studio" sceneSpec={snapshot.sceneSpec} zoomRange={[34, 84]} />

              <div className="preview-overlay preview-overlay-top">
                <span className="overlay-kicker">Current World</span>
                <strong>{snapshot.sceneSpec.title}</strong>
                <p>{snapshot.sceneSpec.summary || "Structured scene preview generated from the current prompt."}</p>
              </div>

              <div className="preview-overlay preview-overlay-bottom">
                <div className="overlay-stat">
                  <span>{snapshot.sceneSpec.zones.length}</span>
                  <small>Zones</small>
                </div>
                <div className="overlay-stat">
                  <span>{snapshot.sceneSpec.web3Proofs.length}</span>
                  <small>Proofs</small>
                </div>
                <div className="overlay-stat">
                  <span>{snapshot.phase === "complete" ? "Ready" : phaseLabelMap[snapshot.phase]}</span>
                  <small>Status</small>
                </div>
              </div>

              {activeArtifact ? (
                <button className="export-button" onClick={() => downloadArtifact(activeArtifact)}>
                  <Download size={14} />
                  Export {activeArtifact.label}
                </button>
              ) : null}
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
  sceneSpec,
  zoomRange,
  backgroundColor,
  fogColor,
}: {
  className: string;
  cameraTarget: [number, number, number];
  mode: "hero" | "studio";
  sceneSpec: SceneSpec;
  zoomRange: [number, number];
  backgroundColor?: string;
  fogColor?: string;
}) {
  const studioView = useMemo(() => {
    if (mode !== "studio") return null;
    return computeStudioCameraView(sceneSpec);
  }, [mode, sceneSpec]);

  const cameraSettings = useMemo(
    () =>
      mode === "hero"
        ? { position: [0.9, 10.1, 6.95] as [number, number, number], zoom: 61 }
        : {
            position: [studioView?.target[0] ?? 0, studioView?.height ?? 10.8, studioView?.distance ?? 8.6] as [
              number,
              number,
              number,
            ],
            zoom: studioView?.zoom ?? 46,
          },
    [mode, studioView],
  );

  const studioPalette = useMemo(() => {
    if (mode !== "studio") return null;

    return sceneSpec.style === "animation"
      ? { background: "#103040", fog: "#173d50" }
      : sceneSpec.style === "voxel"
        ? { background: "#1b222b", fog: "#232d39" }
        : { background: "#151a24", fog: "#1d2430" };
  }, [mode, sceneSpec.style]);

  return (
    <div className={className}>
      <Canvas
        orthographic
        camera={{ position: cameraSettings.position, zoom: cameraSettings.zoom, near: 0.1, far: 80 }}
        onCreated={({ camera }) => camera.lookAt(...cameraTarget)}
        shadows={mode === "studio"}
      >
        <color attach="background" args={[backgroundColor || studioPalette?.background || "#efe4ca"]} />
        <fog attach="fog" args={[fogColor || studioPalette?.fog || "#efe4ca", 12, 24]} />
        <ambientLight intensity={mode === "studio" ? 1.1 : 1.45} />
        <directionalLight
          castShadow={mode === "studio"}
          position={mode === "studio" ? [-4, 7, 3] : [-5, 8, 5]}
          intensity={mode === "studio" ? 1.7 : 2.15}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight args={mode === "studio" ? ["#d6efff", "#4a5c6f", 1.1] : ["#fff4da", "#b6c7a5", 1.3]} />
        {mode === "hero" ? (
          <>
            <Suspense fallback={null}>
              <GameStyleWorld />
            </Suspense>
            <HeroCameraRig baseTarget={cameraTarget} />
          </>
        ) : (
          <>
            <Suspense fallback={null}>
              <WorldRenderer spec={sceneSpec} />
            </Suspense>
            <StudioCameraRig
              target={studioView?.target ?? cameraTarget}
              zoom={studioView?.zoom ?? cameraSettings.zoom}
              sceneKey={sceneSpec.zones.map((zone) => `${zone.id}:${zone.position.join(",")}`).join("|")}
            />
            <OrbitControls
              enableDamping
              enablePan={false}
              enableRotate
              enableZoom
              minZoom={zoomRange[0]}
              maxZoom={zoomRange[1]}
              maxPolarAngle={Math.PI / 2.25}
              minPolarAngle={Math.PI / 5.5}
              target={studioView?.target ?? cameraTarget}
            />
          </>
        )}
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
    smoothedScrollRef.current = THREE.MathUtils.damp(smoothedScrollRef.current, targetScrollRef.current, 4.8, delta);
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

function StudioCameraRig({
  target,
  zoom,
  sceneKey,
}: {
  target: [number, number, number];
  zoom: number;
  sceneKey: string;
}) {
  const { camera } = useThree();
  const liveTarget = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;

    liveTarget.set(...target);
    camera.zoom = zoom;
    camera.lookAt(liveTarget);
    camera.updateProjectionMatrix();
  }, [camera, liveTarget, sceneKey, target, zoom]);

  return null;
}

function computeStudioCameraView(sceneSpec: SceneSpec) {
  if (sceneSpec.zones.length === 0) {
    return {
      target: [0, 0, 0] as [number, number, number],
      zoom: 46,
      height: 10.8,
      distance: 8.6,
    };
  }

  const layout = buildStudioWorldLayout(sceneSpec.zones);
  const width = Math.max(8, layout.bounds.maxX - layout.bounds.minX);
  const depth = Math.max(8, layout.bounds.maxZ - layout.bounds.minZ);
  const span = Math.max(width, depth, layout.supportRadius * 1.9);
  const zoom = THREE.MathUtils.clamp(70 - span * 2.3, 30, 54);

  return {
    target: [layout.bounds.centerX, 0, layout.bounds.centerZ] as [number, number, number],
    zoom,
    height: 10.8,
    distance: 8.6,
  };
}

function TraceRow({ event }: { event: AgentTraceEvent }) {
  return (
    <li className={`trace-row trace-${event.status}`}>
      {event.status === "running" ? (
        <LoaderCircle size={16} className="spin" />
      ) : event.status === "failed" ? (
        <CircleAlert size={16} />
      ) : event.status === "repaired" ? (
        <WandSparkles size={16} />
      ) : (
        <CheckCircle2 size={16} />
      )}
      <div>
        <strong>{event.label}</strong>
        <p>{event.detail}</p>
        {event.tool ? <span className="trace-tool">{event.tool}</span> : null}
      </div>
    </li>
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
