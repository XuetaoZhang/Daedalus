import { Text } from "@react-three/drei";
import type { SceneSpec, ZoneSpec } from "./sceneSpec";

type WorldRendererProps = {
  spec: SceneSpec;
};

export function WorldRenderer({ spec }: WorldRendererProps) {
  return (
    <group>
      <ArenaFloor />
      {spec.zones.map((zone) => (
        <ZoneModule key={zone.id} zone={zone} />
      ))}
      <Text
        position={[0, 3.3, -1]}
        fontSize={0.55}
        color="#f7fbff"
        anchorX="center"
        anchorY="middle"
      >
        {spec.title}
      </Text>
    </group>
  );
}

function ArenaFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[10, 96]} />
        <meshStandardMaterial color="#071018" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.6, 3.72, 96]} />
        <meshBasicMaterial color="#50e3c2" transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[7.4, 7.5, 128]} />
        <meshBasicMaterial color="#b785ff" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function ZoneModule({ zone }: { zone: ZoneSpec }) {
  const height = zone.type === "main_stage" ? 1.25 : 0.75;
  const width = zone.type === "main_stage" ? 3.6 : 2.3;

  return (
    <group position={zone.position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, 1.2]} />
        <meshStandardMaterial color={zone.color} metalness={0.35} roughness={0.38} />
      </mesh>
      <mesh position={[0, height + 0.08, -0.02]}>
        <boxGeometry args={[width + 0.12, 0.08, 1.32]} />
        <meshBasicMaterial color={zone.accent} transparent opacity={0.9} />
      </mesh>
      <Text
        position={[0, height + 0.5, 0.05]}
        fontSize={0.24}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.4}
      >
        {zone.title}
      </Text>
      {zone.subtitle ? (
        <Text
          position={[0, height + 0.18, 0.06]}
          fontSize={0.13}
          color={zone.accent}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.2}
        >
          {zone.subtitle}
        </Text>
      ) : null}
    </group>
  );
}
