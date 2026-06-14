import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

const ground = "#d8cb9b";
const groundEdge = "#b7aa7f";
const road = "#f4ead0";
const water = "#9fc8c2";
const wood = "#745335";
const hexAssetPath = "/kenney_hexagon-kit/Models/GLB%20format/";
const arenaAssetPath = "/kenney_mini-arena/Models/GLB%20format/";

type Vec2 = [number, number];

type ModelProps = {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  tint?: string;
  tintStrength?: number;
};

function KenneyModel({ url, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, tint, tintStrength = 0 }: ModelProps) {
  const gltf = useGLTF(url);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const tintColor = tint ? new THREE.Color(tint) : null;

    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const clonedMaterials = materials.map((material) => {
        const cloned = material.clone();
        if (tintColor && "color" in cloned && cloned.color instanceof THREE.Color) {
          cloned.color.lerp(tintColor, tintStrength);
        }
        return cloned;
      });

      mesh.material = Array.isArray(mesh.material) ? clonedMaterials : clonedMaterials[0];
    });

    return clone;
  }, [gltf.scene, tint, tintStrength]);

  return <primitive object={scene} position={position} rotation={rotation} scale={scale} />;
}

function AnimatedSoldierModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  tint,
  tintStrength = 0,
  clip = "walk",
}: Omit<ModelProps, "url"> & { clip?: string }) {
  const gltf = useGLTF(`${arenaAssetPath}character-soldier.glb`);
  const rootRef = useRef<THREE.Group>(null);

  const scene = useMemo(() => {
    const clone = cloneSkinned(gltf.scene) as THREE.Group;
    const tintColor = tint ? new THREE.Color(tint) : null;

    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const nextMaterials = materials.map((material) => {
        const nextMaterial = material.clone();
        if (tintColor && "color" in nextMaterial && nextMaterial.color instanceof THREE.Color) {
          nextMaterial.color.lerp(tintColor, tintStrength);
        }
        return nextMaterial;
      });

      mesh.material = Array.isArray(mesh.material) ? nextMaterials : nextMaterials[0];
    });

    return clone;
  }, [gltf.scene, tint, tintStrength]);

  const { actions } = useAnimations(gltf.animations, rootRef);

  useEffect(() => {
    const requested = actions[clip] ?? actions.walk ?? actions.idle ?? Object.values(actions)[0];
    if (!requested) return;

    requested.reset();
    requested.fadeIn(0.18);
    requested.play();
    requested.timeScale = clip === "walk" ? 1.2 : 1;

    return () => {
      requested.fadeOut(0.18);
      requested.stop();
    };
  }, [actions, clip]);

  return <primitive ref={rootRef} object={scene} position={position} rotation={rotation} scale={scale} />;
}

function useFloatMotion({
  amplitude = 0.08,
  frequency = 1,
  phase = 0,
  rotationAmplitude = 0.05,
}: {
  amplitude?: number;
  frequency?: number;
  phase?: number;
  rotationAmplitude?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * frequency + phase;
    ref.current.position.y = Math.sin(t) * amplitude;
    ref.current.rotation.z = Math.sin(t * 0.8) * rotationAmplitude;
  });

  return ref;
}

function usePulseScale({
  base = 1,
  amplitude = 0.1,
  frequency = 1,
  phase = 0,
}: {
  base?: number;
  amplitude?: number;
  frequency?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * frequency + phase;
    const scale = base + Math.sin(t) * amplitude;
    ref.current.scale.setScalar(scale);
  });

  return ref;
}

function useMarchMotion({
  phase = 0,
  stride = 0.1,
  lift = 0.025,
}: {
  phase?: number;
  stride?: number;
  lift?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 1.9 + phase;
    ref.current.position.x = Math.sin(t) * stride;
    ref.current.position.z = Math.cos(t * 0.9) * stride * 0.65;
    ref.current.position.y = Math.max(0, Math.sin(t * 2)) * lift;
    ref.current.rotation.y = Math.sin(t) * 0.08;
  });

  return ref;
}

function useFormationPatrol({
  xAmplitude = 0.14,
  zAmplitude = 0.18,
  phase = 0,
}: {
  xAmplitude?: number;
  zAmplitude?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.6 + phase;
    ref.current.position.x = Math.sin(t) * xAmplitude;
    ref.current.position.z = Math.cos(t * 1.15) * zAmplitude;
  });

  return ref;
}

export function GameStyleWorld() {
  return (
    <group rotation={[0, -0.08, 0]} position={[0, -0.2, 0]}>
      <GameBoard />
      <River />
      <RoadNetwork />
      <Plateau position={[0, 0.05, 5.55]} radius={1.28} color="#c9bd92" />
      <Plateau position={[0.2, 0.05, -5.1]} radius={1.18} color="#c9bd92" />
      <Plateau position={[-5.1, 0.05, -2.1]} radius={1.18} color="#bcc88e" />
      <Plateau position={[5.1, 0.05, -2.2]} radius={1.18} color="#d4c585" />
      <Castle position={[0, 0.22, 4.95]} factionColor="#2f6fb7" label="BLUEHOLD" scale={1.28} hero />
      <Castle position={[0.2, 0.22, -5.1]} factionColor="#b95045" label="REDHALL" scale={1.12} />
      <Castle position={[-5.1, 0.22, -2.1]} factionColor="#5a8f57" label="GREENDALE" scale={1.1} />
      <Castle position={[5.1, 0.22, -2.2]} factionColor="#d6af35" label="SUNFORD" scale={1.1} />
      <Outpost position={[1.2, 0.18, -1.25]} />
      <ArrowTower position={[4.3, 0.2, 2.25]} />
      <GrainDepot position={[-5.1, 0.12, 2.2]} />
      <Barricades position={[-4.35, 0.16, 3.35]} />
      <Hill position={[-4.8, 0.08, 0.35]} />
      <Forest />
      <ArmyCluster color="#2f6fb7" position={[0, 0.22, 3.55]} rows={2} lead />
      <RoadPatrolColumn
        color="#2f6fb7"
        points={[[0.05, 3.65], [0.28, 2.55], [0.72, 1.38], [0.6, 0.18], [0.12, -1.08], [0.04, -2.55], [0.12, -4.2]]}
        count={6}
        spacing={0.08}
        speed={0.048}
        laneOffset={-0.18}
        scale={0.42}
      />
      <RoadPatrolColumn
        color="#b95045"
        points={[[0.12, -4.2], [0.04, -2.55], [0.12, -1.08], [0.6, 0.18], [0.72, 1.38], [0.28, 2.55], [0.05, 3.65]]}
        count={6}
        spacing={0.08}
        speed={0.046}
        laneOffset={0.18}
        scale={0.42}
      />
      <MarchPath points={[[0, 4.65], [0.15, 3.35], [0.75, 2.15], [1.35, 0.95]]} color="#2f6fb7" />
      <MarchPath points={[[0.25, 3.45], [-1.25, 2.75], [-3.2, 3.25]]} color="#2f6fb7" />
      <MarchPath points={[[1.1, 3.2], [2.45, 2.8], [3.7, 2.15]]} color="#2f6fb7" />
      <CommandCircle position={[1.15, 0.05, 0.75]} />
      <TerrainDetails />
    </group>
  );
}

function GameBoard() {
  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[7.1, 7.45, 0.62, 128]} />
        <meshStandardMaterial color={groundEdge} roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[6.95, 6.95, 0.18, 128]} />
        <meshBasicMaterial color={ground} />
      </mesh>
    </group>
  );
}

function River() {
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.7, 0.2, -5.8),
    new THREE.Vector3(-1.15, 0.2, -3.8),
    new THREE.Vector3(-1.85, 0.2, -1.75),
    new THREE.Vector3(-1.3, 0.2, 0.25),
    new THREE.Vector3(-0.75, 0.2, 1.65),
    new THREE.Vector3(-1.55, 0.2, 3.2),
    new THREE.Vector3(-2.35, 0.2, 5.65),
  ]);
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(4.7, 0.2, 5.4),
    new THREE.Vector3(3.35, 0.2, 4.1),
    new THREE.Vector3(2.45, 0.2, 2.95),
    new THREE.Vector3(1.85, 0.2, 1.85),
    new THREE.Vector3(1.2, 0.2, 1.1),
    new THREE.Vector3(0.15, 0.2, 0.6),
    new THREE.Vector3(-0.75, 0.2, 0.1),
  ]);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[leftCurve, 96, 0.52, 12, false]} />
        <meshBasicMaterial color="#c9bd92" transparent opacity={0.42} />
      </mesh>
      <mesh>
        <tubeGeometry args={[leftCurve, 96, 0.34, 12, false]} />
        <meshStandardMaterial color={water} roughness={0.36} transparent opacity={0.82} />
      </mesh>
      <RiverSparkles points={[[-1.08, -3.45], [-1.55, -1.2], [-0.95, 1.2], [-1.68, 3.35]]} />
      <mesh>
        <tubeGeometry args={[rightCurve, 72, 0.48, 12, false]} />
        <meshBasicMaterial color="#c9bd92" transparent opacity={0.36} />
      </mesh>
      <mesh>
        <tubeGeometry args={[rightCurve, 72, 0.3, 12, false]} />
        <meshStandardMaterial color={water} roughness={0.36} transparent opacity={0.78} />
      </mesh>
      <RiverSparkles points={[[3.42, 4.02], [2.05, 2.12], [0.72, 0.82]]} />
    </group>
  );
}

function RiverSparkles({ points }: { points: Vec2[] }) {
  return (
    <group>
      {points.map(([x, z], index) => (
        <mesh key={index} position={[x, 0.42, z]} rotation={[-Math.PI / 2, 0, 0.5]}>
          <boxGeometry args={[0.34, 0.035, 0.01]} />
          <meshBasicMaterial color="#f7fff2" transparent opacity={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function RoadNetwork() {
  return (
    <group>
      <PathStrip points={[[0, 5.2], [0.05, 3.4], [-0.65, 1.7], [-1.15, 0.3], [-2.7, -1.1], [-4.9, -2.1]]} />
      <PathStrip points={[[0, 5.2], [0.65, 3.15], [2.55, 1.2], [4.85, -2.05]]} />
      <PathStrip points={[[0, -4.85], [-1.2, -3.1], [-1.2, -1.2], [0.2, -0.45], [1.15, -1.25]]} />
      <PathStrip points={[[-5.1, 2.2], [-3.4, 1.75], [-1.1, 1.45], [0.15, 0.65]]} />
      <PathStrip points={[[-5.4, 3.4], [-4.2, 2.3], [-2.2, 1.85]]} />
      <RoadNode position={[0, 0.31, 5.2]} />
      <RoadNode position={[0.15, 0.31, 0.65]} />
      <RoadNode position={[4.85, 0.31, -2.05]} />
      <RoadNode position={[-4.9, 0.31, -2.1]} />
    </group>
  );
}

function RoadNode({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.18, 18]} />
      <meshStandardMaterial color="#fff1c9" roughness={0.68} />
    </mesh>
  );
}

function PathStrip({ points }: { points: Vec2[] }) {
  return (
    <group>
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        return (
          <group key={`${point.join("-")}-${index}`}>
            <Segment a={point} b={next} color="#d6c99d" width={0.22} y={0.245} />
            <Segment a={point} b={next} color={road} width={0.13} y={0.27} />
          </group>
        );
      })}
    </group>
  );
}

function Segment({ a, b, color, width, y }: { a: Vec2; b: Vec2; color: string; width: number; y: number }) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);

  return (
    <mesh position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, 0.035, width]} />
      <meshStandardMaterial color={color} roughness={0.68} />
    </mesh>
  );
}

function Castle({
  position,
  factionColor,
  label,
  scale = 1,
  hero = false,
}: {
  position: [number, number, number];
  factionColor: string;
  label: string;
  scale?: number;
  hero?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[hero ? 1.62 : 1.36, 48]} />
        <meshStandardMaterial color="#c8b991" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[hero ? 1.3 : 1.1, hero ? 1.52 : 1.28, 48]} />
        <meshBasicMaterial color={factionColor} transparent opacity={hero ? 0.3 : 0.22} />
      </mesh>
      <KenneyModel
        url={`${hexAssetPath}building-castle.glb`}
        position={[0, 0.02, 0]}
        rotation={[0, Math.PI / 6, 0]}
        scale={hero ? 1.28 : 1.02}
        tint={factionColor}
        tintStrength={0.16}
      />
      {hero ? <HeroCastleKit color={factionColor} /> : <SmallCastleKit color={factionColor} />}
      <AssetBanner position={[0, hero ? 1.62 : 1.28, 0.18]} color={factionColor} scale={hero ? 0.34 : 0.26} />
      <Label text={label} position={[0, hero ? 2.02 : 1.6, 0]} color={factionColor} />
    </group>
  );
}

function HeroCastleKit({ color }: { color: string }) {
  return (
    <group>
      {[
        [-1.05, 0.02, -0.75, 0],
        [1.05, 0.02, -0.75, 0],
        [-1.05, 0.02, 0.75, Math.PI],
        [1.05, 0.02, 0.75, Math.PI],
      ].map(([x, y, z, rotation], index) => (
        <KenneyModel
          key={index}
          url={`${hexAssetPath}unit-wall-tower.glb`}
          position={[x, y, z]}
          rotation={[0, rotation, 0]}
          scale={0.6}
          tint={color}
          tintStrength={0.18}
        />
      ))}
      <KenneyModel url={`${hexAssetPath}building-walls.glb`} position={[0, 0.01, -1.06]} rotation={[0, Math.PI / 6, 0]} scale={0.72} tint={color} tintStrength={0.12} />
      <KenneyModel url={`${hexAssetPath}building-tower.glb`} position={[0.96, 0.03, 1.0]} rotation={[0, -0.45, 0]} scale={0.66} tint={color} tintStrength={0.18} />
    </group>
  );
}

function SmallCastleKit({ color }: { color: string }) {
  return (
    <group>
      <KenneyModel url={`${hexAssetPath}building-wall.glb`} position={[0.8, 0.01, 0.72]} rotation={[0, -0.2, 0]} scale={0.52} tint={color} tintStrength={0.14} />
      <KenneyModel url={`${hexAssetPath}unit-wall-tower.glb`} position={[-0.86, 0.01, -0.68]} rotation={[0, 0.4, 0]} scale={0.46} tint={color} tintStrength={0.16} />
    </group>
  );
}

function AssetBanner({ position, color, scale = 0.24 }: { position: [number, number, number]; color: string; scale?: number }) {
  const motionRef = useFloatMotion({
    amplitude: 0.06,
    frequency: 1.25,
    phase: position[0] * 0.8 + position[2] * 0.45,
    rotationAmplitude: 0.08,
  });

  return (
    <group position={position} ref={motionRef}>
      <KenneyModel url={`${arenaAssetPath}banner.glb`} scale={scale} tint={color} tintStrength={0.55} />
    </group>
  );
}

function Label({ text, position, color }: { text: string; position: [number, number, number]; color: string }) {
  const width = Math.min(1.55, Math.max(0.82, text.length * 0.075));

  return (
    <group position={position} rotation={[-0.55, 0, 0]}>
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[width, 0.25, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-width / 2 + 0.08, 0.01, 0.04]}>
        <boxGeometry args={[0.05, 0.15, 0.02]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[width / 2 - 0.08, 0.01, 0.04]}>
        <boxGeometry args={[0.05, 0.15, 0.02]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.56} />
      </mesh>
      <mesh position={[0, 0.01, 0.04]}>
        <boxGeometry args={[Math.max(0.24, width - 0.38), 0.035, 0.02]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

function Outpost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <KenneyModel url={`${hexAssetPath}building-cabin.glb`} position={[0, 0.02, 0]} rotation={[0, -0.45, 0]} scale={0.78} tint="#2f6fb7" tintStrength={0.16} />
      <KenneyModel url={`${hexAssetPath}dirt-lumber.glb`} position={[-0.52, 0.02, 0.5]} rotation={[0, 0.35, 0]} scale={0.58} />
      <AssetBanner position={[0.1, 0.72, 0]} color="#2f6fb7" scale={0.18} />
      <Label text="OUTPOST CAMP" position={[0.88, 0.95, 0]} color="#4c4c50" />
    </group>
  );
}

function ArrowTower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <KenneyModel url={`${hexAssetPath}building-tower.glb`} position={[0, 0.02, 0]} rotation={[0, 0.2, 0]} scale={0.98} tint="#2f6fb7" tintStrength={0.22} />
      <AssetBanner position={[0.08, 1.28, 0]} color="#2f6fb7" scale={0.24} />
      <Label text="ARROW TOWER" position={[0.88, 1.28, 0]} color="#4c4c50" />
    </group>
  );
}

function GrainDepot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <KenneyModel url={`${hexAssetPath}building-farm.glb`} position={[0, 0.02, 0]} rotation={[0, 0.45, 0]} scale={0.88} tint="#d8b650" tintStrength={0.14} />
      <KenneyModel url={`${hexAssetPath}building-market.glb`} position={[-0.62, 0.02, 0.56]} rotation={[0, -0.4, 0]} scale={0.5} />
      <Label text="GRAIN DEPOT" position={[1.0, 0.72, 0]} color="#6a5b4c" />
    </group>
  );
}

function Barricades({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.55, 0, 0.55].map((x) => (
        <group key={x} position={[x, 0.1, 0]}>
          <mesh rotation={[0, 0, 0.75]}>
            <boxGeometry args={[0.78, 0.08, 0.08]} />
            <meshStandardMaterial color={wood} roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, -0.75]}>
            <boxGeometry args={[0.78, 0.08, 0.08]} />
            <meshStandardMaterial color={wood} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <Label text="CHEVAUX-DE-FRISE" position={[-0.15, 0.7, 0]} color="#4c4c50" />
    </group>
  );
}

function Hill({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.2, 1.45, 0.42, 9]} />
        <meshStandardMaterial color="#b9c68b" roughness={0.86} />
      </mesh>
      <mesh position={[0.15, 0.32, -0.05]}>
        <coneGeometry args={[0.72, 0.48, 8]} />
        <meshStandardMaterial color="#c9d292" roughness={0.85} />
      </mesh>
      <Rock position={[-0.2, 0.55, 0.05]} />
    </group>
  );
}

function Plateau({ position, radius, color }: { position: [number, number, number]; radius: number; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[radius, radius * 1.12, 0.22, 18]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.82, radius * 0.88, 32]} />
        <meshBasicMaterial color="#fff4d5" transparent opacity={0.46} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.02, radius * 1.08, 32]} />
        <meshBasicMaterial color="#8f7b4f" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function Forest() {
  const trees: Vec2[] = [
    [-5.7, -0.5], [-5.1, -0.85], [-4.0, -0.45], [-3.75, -2.9], [-2.8, -2.5],
    [3.35, -0.85], [4.2, -0.7], [5.5, -0.35], [5.8, 1.3], [4.7, 3.6],
    [-5.8, 4.6], [-3.5, 4.8], [2.9, 5.15], [5.5, -4.2], [-1.9, -4.85],
  ];

  return (
    <group>
      {trees.map((position, index) => (
        <Tree key={index} position={[position[0], 0.2, position[1]]} scale={index % 3 === 0 ? 0.75 : 0.58} />
      ))}
      <Rock position={[5.7, 0.28, 0.92]} />
      <Rock position={[-5.3, 0.28, 4.55]} />
      <Rock position={[3.9, 0.28, -4.1]} />
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <KenneyModel url={`${hexAssetPath}unit-tree.glb`} scale={0.62} />
    </group>
  );
}

function Rock({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0.25, 0.4, -0.18]} scale={[0.32, 0.22, 0.25]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#aaa387" roughness={0.9} />
    </mesh>
  );
}

function ArmyCluster({
  color,
  position,
  rows,
  lead = false,
}: {
  color: string;
  position: [number, number, number];
  rows: number;
  lead?: boolean;
}) {
  const patrolRef = useFormationPatrol({
    xAmplitude: lead ? 0.08 : 0.14,
    zAmplitude: lead ? 0.16 : 0.22,
    phase: position[0] * 0.5 + position[2] * 0.4,
  });

  const units = Array.from({ length: rows * 5 }, (_, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    return {
      position: [col * 0.42 - 0.84, row * 0.36 - 0.32] as Vec2,
    };
  });

  return (
    <group position={position}>
      <group ref={patrolRef}>
      <mesh position={[0, -0.015, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[lead ? 1.24 : 0.95, 32]} />
        <meshBasicMaterial color={color} transparent opacity={lead ? 0.2 : 0.14} />
      </mesh>
      {units.map((unit, index) => (
        <Soldier
          key={index}
          color={color}
          position={[unit.position[0], 0, unit.position[1]]}
          rotation={index % 2 === 0 ? 0.18 : -0.18}
          phase={index * 0.5 + position[0] * 0.3}
          stride={lead ? 0.05 : 0.08}
        />
      ))}
      <AssetBanner position={[0, lead ? 1.12 : 0.92, -0.42]} color={color} scale={lead ? 0.22 : 0.18} />
      {lead ? <Soldier color={color} position={[0, 0.02, -0.82]} scale={0.46} leader phase={9.5} stride={0.08} /> : null}
      </group>
    </group>
  );
}

function Soldier({
  color,
  position,
  rotation = 0,
  scale = 0.38,
  leader = false,
  phase = 0,
  stride = 0.08,
}: {
  color: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  leader?: boolean;
  phase?: number;
  stride?: number;
}) {
  const marchRef = useMarchMotion({ phase, stride, lift: leader ? 0.038 : 0.024 });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group ref={marchRef}>
        <AnimatedSoldierModel scale={leader ? scale * 1.25 : scale} tint={color} tintStrength={0.5} clip="walk" />
      </group>
      {leader ? (
        <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.16, 18]} />
          <meshBasicMaterial color="#ffe784" transparent opacity={0.95} />
        </mesh>
      ) : null}
    </group>
  );
}

function RoadPatrolColumn({
  color,
  points,
  count,
  spacing = 0.08,
  speed = 0.05,
  laneOffset = 0,
  scale = 0.4,
}: {
  color: string;
  points: Vec2[];
  count: number;
  spacing?: number;
  speed?: number;
  laneOffset?: number;
  scale?: number;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
        false,
        "catmullrom",
        0.12,
      ),
    [points],
  );

  return (
    <group>
      {Array.from({ length: count }, (_, index) => (
        <PathWalker
          key={`${color}-${index}`}
          curve={curve}
          color={color}
          offset={(index * spacing) % 1}
          speed={speed}
          laneOffset={laneOffset}
          scale={scale}
          phase={index * 0.42}
          leader={index === 0}
        />
      ))}
    </group>
  );
}

function PathWalker({
  curve,
  color,
  offset,
  speed,
  laneOffset,
  scale,
  phase,
  leader = false,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
  offset: number;
  speed: number;
  laneOffset: number;
  scale: number;
  phase: number;
  leader?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const current = useMemo(() => new THREE.Vector3(), []);
  const next = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = (offset + state.clock.elapsedTime * speed) % 1;
    const lookT = (t + 0.01) % 1;
    curve.getPointAt(t, current);
    curve.getPointAt(lookT, next);

    tangent.subVectors(next, current).normalize();
    side.set(-tangent.z, 0, tangent.x).normalize().multiplyScalar(laneOffset);

    groupRef.current.position.set(current.x + side.x, 0, current.z + side.z);
    groupRef.current.rotation.y = Math.atan2(next.x - current.x, next.z - current.z + 0.0001);
  });

  return (
    <group ref={groupRef}>
      <group position={[0, 0, 0]}>
        <Soldier
          color={color}
          position={[0, 0, 0]}
          scale={leader ? scale * 1.08 : scale}
          leader={leader}
          phase={phase}
          stride={leader ? 0.028 : 0.02}
        />
      </group>
    </group>
  );
}

useGLTF.preload(`${arenaAssetPath}character-soldier.glb`);

function MarchPath({ points, color }: { points: Vec2[]; color: string }) {
  const dots = points.flatMap((point, index) => {
    const next = points[index + 1];
    if (!next) return [];
    const steps = Math.max(3, Math.floor(Math.hypot(next[0] - point[0], next[1] - point[1]) / 0.26));
    return Array.from({ length: steps }, (_, step) => {
      const t = step / steps;
      return [point[0] + (next[0] - point[0]) * t, point[1] + (next[1] - point[1]) * t] as Vec2;
    });
  });

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);

  return (
    <group>
      {dots.map(([x, z], index) => (
        <MarchDot key={index} angle={angle} color={color} index={index} position={[x, 0.44, z]} />
      ))}
      <MarchArrow angle={angle} color={color} position={[last[0], 0.45, last[1]]} />
    </group>
  );
}

function MarchDot({
  angle,
  color,
  index,
  position,
}: {
  angle: number;
  color: string;
  index: number;
  position: [number, number, number];
}) {
  const pulseRef = usePulseScale({ base: 1, amplitude: 0.18, frequency: 2, phase: index * 0.33 });

  return (
    <group ref={pulseRef} position={position} rotation={[0, -angle, 0]}>
      <mesh>
        <boxGeometry args={[0.13, 0.035, 0.09]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function MarchArrow({ angle, color, position }: { angle: number; color: string; position: [number, number, number] }) {
  const floatRef = useFloatMotion({ amplitude: 0.025, frequency: 2.2, phase: position[0] * 0.7, rotationAmplitude: 0.02 });

  return (
    <group ref={floatRef} position={position} rotation={[0, -angle - Math.PI / 2, 0]}>
      <mesh>
        <coneGeometry args={[0.16, 0.32, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

function CommandCircle({ position }: { position: [number, number, number] }) {
  const pulseRef = usePulseScale({ base: 1, amplitude: 0.08, frequency: 1.8, phase: position[0] * 0.2 });

  return (
    <group ref={pulseRef} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.96, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function TerrainDetails() {
  const tufts: Vec2[] = [
    [-3.7, -3.4], [-2.9, 3.9], [-1.2, -4.6], [1.9, -3.2], [3.2, 3.4], [4.8, 0.65],
    [-5.9, 1.2], [5.7, -3.1], [0.5, -2.5], [2.8, -4.7], [-4.4, 4.1], [1.4, 4.7],
  ];
  const stones: Vec2[] = [[-4.8, 4.8], [2.5, -5.4], [5.6, 1.25], [-2.4, -4.4], [3.9, -0.3]];

  return (
    <group>
      {tufts.map(([x, z], index) => (
        <GrassTuft key={index} position={[x, 0.29, z]} />
      ))}
      {stones.map(([x, z], index) => (
        <Rock key={index} position={[x, 0.3, z]} />
      ))}
    </group>
  );
}

function GrassTuft({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.07, 0, 0.07].map((x, index) => (
        <mesh key={index} position={[x, 0.05, 0]} rotation={[0, 0, x * 4]}>
          <coneGeometry args={[0.035, 0.18, 5]} />
          <meshStandardMaterial color="#91a96d" roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}
