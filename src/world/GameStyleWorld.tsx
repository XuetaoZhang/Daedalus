import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

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
      <ArmyCluster color="#2f6fb7" position={[0, 0.22, 3.35]} rows={3} lead />
      <ArmyCluster color="#b95045" position={[0.7, 0.22, 0.55]} rows={2} />
      <ArmyCluster color="#d6af35" position={[1.75, 0.22, 0.65]} rows={2} />
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
        <meshStandardMaterial color={ground} roughness={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
        <ringGeometry args={[6.25, 6.35, 128]} />
        <meshBasicMaterial color="#f7edcf" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
        <circleGeometry args={[6.82, 128]} />
        <meshBasicMaterial color="#efe2ba" transparent opacity={0.16} />
      </mesh>
      {Array.from({ length: 32 }, (_, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={radialTickPosition(index)}>
          <boxGeometry args={[0.04, 0.28, 0.01]} />
          <meshBasicMaterial color="#d1bd80" transparent opacity={0.32} />
        </mesh>
      ))}
    </group>
  );
}

function radialTickPosition(index: number): [number, number, number] {
  const angle = (index / 32) * Math.PI * 2;
  return [Math.cos(angle) * 6.58, 0.18, Math.sin(angle) * 6.58];
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
  return (
    <group position={position}>
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
  const units = Array.from({ length: rows * 5 }, (_, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    return {
      position: [col * 0.42 - 0.84, row * 0.36 - 0.32] as Vec2,
    };
  });

  return (
    <group position={position}>
      <mesh position={[0, -0.015, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[lead ? 1.24 : 0.95, 32]} />
        <meshBasicMaterial color={color} transparent opacity={lead ? 0.2 : 0.14} />
      </mesh>
      {units.map((unit, index) => (
        <Soldier key={index} color={color} position={[unit.position[0], 0, unit.position[1]]} rotation={index % 2 === 0 ? 0.18 : -0.18} />
      ))}
      <AssetBanner position={[0, lead ? 1.12 : 0.92, -0.42]} color={color} scale={lead ? 0.22 : 0.18} />
      {lead ? <Soldier color={color} position={[0, 0.02, -0.82]} scale={0.46} leader /> : null}
    </group>
  );
}

function Soldier({
  color,
  position,
  rotation = 0,
  scale = 0.38,
  leader = false,
}: {
  color: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  leader?: boolean;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <KenneyModel url={`${arenaAssetPath}character-soldier.glb`} scale={leader ? scale * 1.25 : scale} tint={color} tintStrength={0.5} />
      {leader ? (
        <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.16, 18]} />
          <meshBasicMaterial color="#ffe784" transparent opacity={0.95} />
        </mesh>
      ) : null}
    </group>
  );
}

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
        <mesh key={index} position={[x, 0.44, z]} rotation={[0, -angle, 0]}>
          <boxGeometry args={[0.13, 0.035, 0.09]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh position={[last[0], 0.45, last[1]]} rotation={[0, -angle - Math.PI / 2, 0]}>
        <coneGeometry args={[0.16, 0.32, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

function CommandCircle({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 0.96, 64]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
    </mesh>
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
