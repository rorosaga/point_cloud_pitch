import { Line } from '@react-three/drei';
import { PITCH_LENGTH, PITCH_WIDTH } from '../lib/pitchConstants';

// Pitch marking dimensions (proportional to FIFA standard)
const PL = PITCH_LENGTH;
const PW = PITCH_WIDTH;
const PA_L = PL * 0.157;  // penalty area length
const PA_W = PW * 0.593;  // penalty area width
const GA_L = PL * 0.052;  // goal area length
const GA_W = PW * 0.269;  // goal area width
const CR = PW * 0.134;    // center circle radius
const LINE_Y = 0.02;      // height above pitch

function circlePoints(cx: number, cz: number, r: number, segments = 64): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, LINE_Y, cz + Math.sin(a) * r]);
  }
  return pts;
}

function PitchLines() {
  const hw = PW / 2;
  const hl = PL / 2;
  const lineProps = { color: 'white', lineWidth: 2 } as const;

  return (
    <group>
      {/* Outer boundary */}
      <Line points={[[-hw, LINE_Y, -hl], [hw, LINE_Y, -hl], [hw, LINE_Y, hl], [-hw, LINE_Y, hl], [-hw, LINE_Y, -hl]]} {...lineProps} />
      {/* Halfway line */}
      <Line points={[[-hw, LINE_Y, 0], [hw, LINE_Y, 0]]} {...lineProps} />
      {/* Center circle */}
      <Line points={circlePoints(0, 0, CR)} {...lineProps} />
      {/* Center spot */}
      <Line points={circlePoints(0, 0, 0.05, 16)} {...lineProps} />

      {/* Penalty area - bottom */}
      <Line points={[
        [-PA_W / 2, LINE_Y, -hl],
        [-PA_W / 2, LINE_Y, -hl + PA_L],
        [PA_W / 2, LINE_Y, -hl + PA_L],
        [PA_W / 2, LINE_Y, -hl],
      ]} {...lineProps} />
      {/* Penalty area - top */}
      <Line points={[
        [-PA_W / 2, LINE_Y, hl],
        [-PA_W / 2, LINE_Y, hl - PA_L],
        [PA_W / 2, LINE_Y, hl - PA_L],
        [PA_W / 2, LINE_Y, hl],
      ]} {...lineProps} />

      {/* Goal area - bottom */}
      <Line points={[
        [-GA_W / 2, LINE_Y, -hl],
        [-GA_W / 2, LINE_Y, -hl + GA_L],
        [GA_W / 2, LINE_Y, -hl + GA_L],
        [GA_W / 2, LINE_Y, -hl],
      ]} {...lineProps} />
      {/* Goal area - top */}
      <Line points={[
        [-GA_W / 2, LINE_Y, hl],
        [-GA_W / 2, LINE_Y, hl - GA_L],
        [GA_W / 2, LINE_Y, hl - GA_L],
        [GA_W / 2, LINE_Y, hl],
      ]} {...lineProps} />

      {/* Penalty spots */}
      <Line points={circlePoints(0, -hl + PA_L * 0.72, 0.05, 16)} {...lineProps} />
      <Line points={circlePoints(0, hl - PA_L * 0.72, 0.05, 16)} {...lineProps} />
    </group>
  );
}

export function FootballPitch() {
  return (
    <group>
      {/* Green pitch plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[PW, PL]} />
        <meshStandardMaterial color="#2d9a4d" />
      </mesh>

      {/* White line markings */}
      <PitchLines />
    </group>
  );
}
