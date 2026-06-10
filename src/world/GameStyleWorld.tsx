import * as THREE from "three";

const ground = "#d8cb9b";
const groundEdge = "#b7aa7f";
const road = "#f4ead0";
const water = "#9fc8c2";
const stone = "#d9d3be";
const wood = "#745335";
const darkWood = "#4f3520";

type Vec2 = [number, number];
type Faction = "blue" | "red" | "green" | "yellow";
type UnitKind = "infantry" | "archer" | "cavalry";

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
      <Castle position={[0, 0.22, 5.55]} factionColor="#2f6fb7" label="BLUEHOLD" scale={1.16} hero />
      <Castle position={[0.2, 0.22, -5.1]} factionColor="#b95045" label="REDHALL" scale={1.04} />
      <Castle position={[-5.1, 0.22, -2.1]} factionColor="#5a8f57" label="GREENDALE" scale={1.02} />
      <Castle position={[5.1, 0.22, -2.2]} factionColor="#d6af35" label="SUNFORD" scale={1.02} />
      <Outpost position={[1.2, 0.18, -1.25]} />
      <ArrowTower position={[4.3, 0.2, 2.25]} />
      <GrainDepot position={[-5.1, 0.12, 2.2]} />
      <Barricades position={[-4.35, 0.16, 3.35]} />
      <Hill position={[-4.8, 0.08, 0.35]} />
      <Forest />
      <ArmyCluster color="#2f6fb7" faction="blue" position={[0, 0.22, 3.6]} rows={3} lead />
      <ArmyCluster color="#b95045" faction="red" position={[0.7, 0.22, 0.55]} rows={2} />
      <ArmyCluster color="#d6af35" faction="yellow" position={[1.75, 0.22, 0.65]} rows={2} />
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
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.98, 1.08, 0.2, 48]} />
        <meshStandardMaterial color="#c8b991" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[1.42, 0.28, 1.08]} />
        <meshStandardMaterial color="#cfc7ad" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.29, 0.67]}>
        <boxGeometry args={[1.78, 0.2, 0.16]} />
        <meshStandardMaterial color="#ebe5d4" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.29, -0.67]}>
        <boxGeometry args={[1.78, 0.2, 0.16]} />
        <meshStandardMaterial color="#ebe5d4" roughness={0.72} />
      </mesh>
      <mesh position={[-0.89, 0.29, 0]}>
        <boxGeometry args={[0.16, 0.2, 1.34]} />
        <meshStandardMaterial color="#ebe5d4" roughness={0.72} />
      </mesh>
      <mesh position={[0.89, 0.29, 0]}>
        <boxGeometry args={[0.16, 0.2, 1.34]} />
        <meshStandardMaterial color="#ebe5d4" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.06, 0.58, 0.82]} />
        <meshStandardMaterial color={stone} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.77, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.9, 0.13, 0.9]} />
        <meshStandardMaterial color={factionColor} roughness={0.62} />
      </mesh>
      {hero ? <HeroCastleMass color={factionColor} /> : null}
      <Gate color={factionColor} />
      <Battlements width={1.48} depth={1.14} y={0.35} />
      {[
        [-0.66, 0, -0.52],
        [0.66, 0, -0.52],
        [-0.66, 0, 0.52],
        [0.66, 0, 0.52],
      ].map(([x, , z], index) => (
        <Tower key={index} position={[x, 0.25, z]} color={factionColor} />
      ))}
      {hero ? <KeepTower color={factionColor} /> : null}
      <Flag position={[0, hero ? 1.35 : 1.08, 0.04]} color={factionColor} />
      <Label text={label} position={[0, hero ? 1.72 : 1.46, 0]} color={factionColor} />
    </group>
  );
}

function Gate({ color }: { color: string }) {
  return (
    <group position={[0, 0.18, 0.57]}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.36, 0.3, 0.045]} />
        <meshStandardMaterial color={darkWood} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.23, 0.01]}>
        <boxGeometry args={[0.52, 0.05, 0.065]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <mesh position={[-0.24, 0.1, 0.02]}>
        <boxGeometry args={[0.055, 0.34, 0.075]} />
        <meshStandardMaterial color="#eee7d5" roughness={0.7} />
      </mesh>
      <mesh position={[0.24, 0.1, 0.02]}>
        <boxGeometry args={[0.055, 0.34, 0.075]} />
        <meshStandardMaterial color="#eee7d5" roughness={0.7} />
      </mesh>
    </group>
  );
}

function HeroCastleMass({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.12, 1.22, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.32} />
      </mesh>
      <mesh position={[0, 0.65, -0.22]}>
        <boxGeometry args={[0.58, 0.76, 0.5]} />
        <meshStandardMaterial color="#f0e9d6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.1, -0.22]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.52, 0.13, 0.52]} />
        <meshStandardMaterial color={color} roughness={0.58} />
      </mesh>
      <mesh position={[-0.42, 0.58, 0.45]}>
        <cylinderGeometry args={[0.15, 0.17, 0.62, 10]} />
        <meshStandardMaterial color="#eee7d5" roughness={0.72} />
      </mesh>
      <mesh position={[0.42, 0.58, 0.45]}>
        <cylinderGeometry args={[0.15, 0.17, 0.62, 10]} />
        <meshStandardMaterial color="#eee7d5" roughness={0.72} />
      </mesh>
      <mesh position={[-0.42, 1.02, 0.45]}>
        <coneGeometry args={[0.23, 0.36, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0.42, 1.02, 0.45]}>
        <coneGeometry args={[0.23, 0.36, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.32, 0.68]}>
        <boxGeometry args={[0.86, 0.18, 0.11]} />
        <meshStandardMaterial color="#e7dfca" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.55, 0.77]}>
        <boxGeometry args={[0.38, 0.18, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
    </group>
  );
}

function Battlements({ width, depth, y }: { width: number; depth: number; y: number }) {
  const positions: [number, number, number][] = [];
  [-width / 2, -width / 6, width / 6, width / 2].forEach((x) => {
    positions.push([x, y, depth / 2], [x, y, -depth / 2]);
  });
  [-depth / 6, depth / 6].forEach((z) => {
    positions.push([-width / 2, y, z], [width / 2, y, z]);
  });

  return (
    <group>
      {positions.map((position, index) => (
        <mesh key={index} position={position}>
          <boxGeometry args={[0.13, 0.13, 0.1]} />
          <meshStandardMaterial color="#ebe5d4" roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function KeepTower({ color }: { color: string }) {
  return (
    <group position={[0, 0.72, -0.04]}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.55, 12]} />
        <meshStandardMaterial color="#e9e2cf" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.34, 0.46, 12]} />
        <meshStandardMaterial color={color} roughness={0.58} />
      </mesh>
    </group>
  );
}

function Tower({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.23, 0.7, 12]} />
        <meshStandardMaterial color="#e7e0cc" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.28, 0.42, 12]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
    </group>
  );
}

function Flag({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.58, 8]} />
        <meshStandardMaterial color="#5b4630" />
      </mesh>
      <mesh position={[0.17, 0.34, 0]}>
        <boxGeometry args={[0.32, 0.18, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.42} />
      </mesh>
      <mesh position={[0.31, 0.26, 0]}>
        <coneGeometry args={[0.06, 0.12, 3]} />
        <meshStandardMaterial color={color} roughness={0.42} />
      </mesh>
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
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.45, 0.75, 4]} />
        <meshStandardMaterial color="#d7c199" roughness={0.7} />
      </mesh>
      <Flag position={[0, 0.65, 0]} color="#2f6fb7" />
      <BunchedLogs />
      <Label text="OUTPOST CAMP" position={[0.88, 0.95, 0]} color="#4c4c50" />
    </group>
  );
}

function BunchedLogs() {
  return (
    <group>
      {[-0.35, -0.18, 0, 0.18, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.12, 0.42]} rotation={[Math.PI / 2, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.55, 8]} />
          <meshStandardMaterial color={wood} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function ArrowTower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.34, 0.7, 0.34]} />
        <meshStandardMaterial color="#e1dac5" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <coneGeometry args={[0.34, 0.36, 4]} />
        <meshStandardMaterial color="#2f6fb7" roughness={0.58} />
      </mesh>
      <Flag position={[0.08, 0.9, 0]} color="#2f6fb7" />
      <Label text="ARROW TOWER" position={[0.8, 1.08, 0]} color="#4c4c50" />
    </group>
  );
}

function GrainDepot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.72, 0.38, 0.52]} />
        <meshStandardMaterial color="#c99f55" roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.78, 0.08, 0.78]} />
        <meshStandardMaterial color="#754d26" roughness={0.76} />
      </mesh>
      {[-0.6, -0.42, -0.24, -0.06, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.1, 0.45]} rotation={[0, 0, 0.18]}>
          <coneGeometry args={[0.11, 0.5, 8]} />
          <meshStandardMaterial color="#d8b650" roughness={0.7} />
        </mesh>
      ))}
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
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.34, 8]} />
        <meshStandardMaterial color="#7c5738" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <coneGeometry args={[0.28, 0.55, 8]} />
        <meshStandardMaterial color="#6d8d5a" roughness={0.74} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <coneGeometry args={[0.22, 0.42, 8]} />
        <meshStandardMaterial color="#5f7f4e" roughness={0.74} />
      </mesh>
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
  faction,
  position,
  rows,
  lead = false,
}: {
  color: string;
  faction: Faction;
  position: [number, number, number];
  rows: number;
  lead?: boolean;
}) {
  const units = Array.from({ length: rows * 5 }, (_, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const kind: UnitKind = index % 7 === 0 ? "cavalry" : index % 3 === 1 ? "archer" : "infantry";
    return {
      kind,
      position: [col * 0.29 - 0.58, row * 0.27 - 0.26] as Vec2,
    };
  });

  return (
    <group position={position}>
      <mesh position={[0, -0.015, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[lead ? 0.98 : 0.74, 32]} />
        <meshBasicMaterial color={color} transparent opacity={lead ? 0.2 : 0.14} />
      </mesh>
      {units.map((unit, index) => (
        <Unit key={index} color={color} faction={faction} kind={unit.kind} position={[unit.position[0], 0, unit.position[1]]} />
      ))}
      <Flag position={[0, lead ? 1.0 : 0.82, -0.3]} color={color} />
      {lead ? <Commander color={color} /> : null}
    </group>
  );
}

function Commander({ color }: { color: string }) {
  return (
    <group position={[0, 0.02, -0.62]} scale={1.05}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#ead7b2" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <coneGeometry args={[0.12, 0.18, 8]} />
        <meshStandardMaterial color="#f2d36a" roughness={0.5} />
      </mesh>
      <mesh position={[-0.13, 0.28, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 8]} />
        <meshStandardMaterial color="#f4edd6" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Unit({
  color,
  faction,
  kind,
  position,
}: {
  color: string;
  faction: Faction;
  kind: UnitKind;
  position: [number, number, number];
}) {
  if (kind === "cavalry") {
    return <Cavalry color={color} position={position} />;
  }

  return (
    <group position={position} scale={0.72}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.115, 0.32, 8]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.075, 10, 8]} />
        <meshStandardMaterial color="#ead7b2" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.49, 0]}>
        <coneGeometry args={[0.08, 0.11, 8]} />
        <meshStandardMaterial color={color} roughness={0.58} />
      </mesh>
      {kind === "archer" ? <Bow /> : <Spear />}
      <ShieldPlate color={color} faction={faction} />
    </group>
  );
}

function Cavalry({ color, position }: { color: string; position: [number, number, number] }) {
  return (
    <group position={position} scale={0.94}>
      <mesh position={[0, 0.16, 0]} scale={[0.38, 0.14, 0.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8a6a47" roughness={0.78} />
      </mesh>
      <mesh position={[0.27, 0.24, -0.02]} scale={[0.14, 0.11, 0.11]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8a6a47" roughness={0.78} />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.03, 0.08]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 8]} />
          <meshStandardMaterial color="#3a2a1d" roughness={0.82} />
        </mesh>
      ))}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.24, 8]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <sphereGeometry args={[0.065, 10, 8]} />
        <meshStandardMaterial color="#ead7b2" roughness={0.6} />
      </mesh>
      <mesh position={[0.1, 0.43, -0.05]} rotation={[0.2, 0, -0.55]}>
        <cylinderGeometry args={[0.01, 0.01, 0.42, 6]} />
        <meshStandardMaterial color={darkWood} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Bow() {
  return (
    <group position={[0.12, 0.27, -0.02]} rotation={[0, 0, -0.25]}>
      <mesh position={[0.02, 0.04, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.018, 0.24, 0.018]} />
        <meshStandardMaterial color={darkWood} roughness={0.78} />
      </mesh>
      <mesh position={[0.08, 0.01, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.018, 0.22, 0.018]} />
        <meshStandardMaterial color={darkWood} roughness={0.78} />
      </mesh>
      <mesh position={[0.02, 0, 0]} rotation={[0, 0, -0.55]}>
        <cylinderGeometry args={[0.006, 0.006, 0.28, 6]} />
        <meshStandardMaterial color="#f5ead0" roughness={0.55} />
      </mesh>
    </group>
  );
}

function Spear() {
  return (
    <group position={[0.1, 0.3, -0.02]} rotation={[0.1, 0, -0.45]}>
      <mesh>
        <cylinderGeometry args={[0.01, 0.01, 0.42, 6]} />
        <meshStandardMaterial color={darkWood} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <coneGeometry args={[0.035, 0.09, 6]} />
        <meshStandardMaterial color="#b6b2a2" roughness={0.55} />
      </mesh>
    </group>
  );
}

function ShieldPlate({ color, faction }: { color: string; faction: Faction }) {
  const shape = faction === "yellow" ? 4 : faction === "green" ? 6 : 8;
  return (
    <mesh position={[-0.08, 0.27, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.075, shape]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
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
