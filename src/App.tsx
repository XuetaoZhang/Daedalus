import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
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
