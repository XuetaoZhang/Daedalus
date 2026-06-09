import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { AgentTracePanel } from "./components/AgentTracePanel";
import { SceneOverview } from "./components/SceneOverview";
import { demoSceneSpec } from "./world/demoSceneSpec";
import { WorldRenderer } from "./world/WorldRenderer";
import { runMockAgentWorkflow } from "./agent/mockWorkflow";

const trace = runMockAgentWorkflow(demoSceneSpec);

export function App() {
  return (
    <main className="app-shell">
      <section className="world-stage" aria-label="Daedalus 3D world preview">
        <Canvas camera={{ position: [8, 7, 11], fov: 48 }}>
          <color attach="background" args={["#05070d"]} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 8, 6]} intensity={1.4} />
          <pointLight position={[-5, 4, -4]} intensity={28} color="#48f4d4" />
          <pointLight position={[5, 4, -7]} intensity={24} color="#ffcc66" />
          <Stars radius={80} depth={28} count={1000} factor={3} fade speed={0.5} />
          <WorldRenderer spec={demoSceneSpec} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.05} />
        </Canvas>
      </section>

      <aside className="control-panel">
        <SceneOverview spec={demoSceneSpec} />
        <AgentTracePanel trace={trace} />
      </aside>
    </main>
  );
}
