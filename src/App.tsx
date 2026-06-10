import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Gem, Hammer, Map, MoveUpRight, Shield, Swords, Wheat } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { AgentTracePanel } from "./components/AgentTracePanel";
import { SceneOverview } from "./components/SceneOverview";
import { demoSceneSpec } from "./world/demoSceneSpec";
import { GameStyleWorld } from "./world/GameStyleWorld";
import { runMockAgentWorkflow } from "./agent/mockWorkflow";

const trace = runMockAgentWorkflow(demoSceneSpec);

export function App() {
  return (
    <main className="app-shell">
      <section className="world-stage" aria-label="Daedalus 3D world preview">
        <GameHud />
        <Canvas
          orthographic
          camera={{ position: [0, 11.5, 8.4], zoom: 52, near: 0.1, far: 80 }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0.2)}
          shadows
        >
          <color attach="background" args={["#efe4ca"]} />
          <fog attach="fog" args={["#efe4ca", 12, 24]} />
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
            minZoom={42}
            maxZoom={72}
            maxPolarAngle={Math.PI / 2.35}
            minPolarAngle={Math.PI / 5}
            target={[0, 0, 0.2]}
          />
        </Canvas>
      </section>

      <aside className="control-panel">
        <SceneOverview spec={demoSceneSpec} />
        <AgentTracePanel trace={trace} />
      </aside>
    </main>
  );
}

function GameHud() {
  return (
    <div className="game-hud" aria-hidden="true">
      <div className="top-command">
        <div className="legion-badge">
          <Shield size={28} />
          <div>
            <strong>BLUE LEGION</strong>
            <span>1,250</span>
          </div>
        </div>
        <div className="resource-row">
          <Resource icon={<Wheat size={18} />} value="320" rate="+28/h" />
          <Resource icon={<Hammer size={18} />} value="180" rate="+16/h" />
          <Resource icon={<Gem size={18} />} value="240" rate="+20/h" />
          <Resource icon={<Swords size={18} />} value="360" rate="+24/h" />
        </div>
        <div className="turn-pill">TURN 18</div>
      </div>

      <div className="bottom-command">
        <div className="unit-tray">
          <div className="tray-tabs">
            <span className="active">UNITS</span>
            <span>BUILDINGS</span>
            <span>COMMANDS</span>
          </div>
          <div className="unit-cards">
            {["Guard", "Archer", "Knight", "Cart"].map((label, index) => (
              <div className="unit-card" key={label}>
                <div className={`unit-icon unit-${index}`} />
                <strong>{[60, 40, 20, 10][index]}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="action-stack">
          <button>
            <MoveUpRight size={17} />
            MOVE
          </button>
          <button>HOLD</button>
          <button>RETREAT</button>
        </div>

        <div className="mini-map">
          <Map size={16} />
          <span className="map-dot red" />
          <span className="map-dot green" />
          <span className="map-dot yellow" />
          <span className="map-dot blue" />
          <span className="map-core" />
        </div>
      </div>
    </div>
  );
}

function Resource({ icon, value, rate }: { icon: ReactNode; value: string; rate: string }) {
  return (
    <div className="resource-pill">
      {icon}
      <strong>{value}</strong>
      <span>{rate}</span>
    </div>
  );
}
