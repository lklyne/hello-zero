import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState, ComponentProps } from 'react'
import {
  Environment,
  MeshTransmissionMaterial,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { Mesh, Vector3 } from 'three'

import { useControls, Leva } from 'leva'

type VisualizerStatus =
  | { type: 'waiting' }
  | { type: 'thinking'; words: number }

type MeshTransmissionMaterialProps = ComponentProps<
  typeof MeshTransmissionMaterial
>

const Visualizer = ({ status = 'waiting' }: { status: VisualizerStatus }) => {
  const config = useControls({
    radius: { value: 0.38, min: 0, max: 0.5, step: 0.01 },
    roughness: { value: 0.28, min: 0, max: 1, step: 0.01 },
    thickness: { value: 1.58, min: 0, max: 10, step: 0.01 },
    chromaticAberration: { value: 0.4, min: 0, max: 1, step: 0.01 },
    ior: { value: 7.84, min: 0, max: 10, step: 0.01 },
    background: { value: '#ffffff' },
    transmissionSampler: { value: true },
  })

  return (
    <div className="w-full h-full">
      <Canvas className="absolute">
        {/* <color attach="background" args={['#ffffff']} /> */}
        <Box status={status} {...config} />
        {/* <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />
        </mesh> */}
        <ambientLight intensity={4} />
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <Environment
          files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_puresky_1k.hdr"
          backgroundIntensity={2}
          // background
          backgroundBlurriness={1}
        />{' '}
        <OrbitControls />
      </Canvas>
      <Leva />
    </div>
  )
}

export default Visualizer

const COLOR_PAIRS = [
  [
    [2, 0.2, 1],
    [0.1, 1.5, 2],
  ], // Purple to Cyan
  [
    [2, 0.5, 0],
    [0, 2, 0.5],
  ], // Orange to Green
  [
    [1.8, 0.1, 0.5],
    [0.1, 0.8, 2],
  ], // Hot Pink to Blue
  [
    [2, 1.5, 0],
    [1, 0.1, 1.5],
  ], // Yellow to Magenta
  [
    [0.5, 2, 1],
    [2, 0.3, 0.3],
  ], // Turquoise to Red
  [
    [1.5, 0.5, 2],
    [2, 1.8, 0.1],
  ], // Purple to Gold
] as const

const Box = ({
  radius,
  status,
  ...config
}: {
  radius: number
  status: VisualizerStatus
} & MeshTransmissionMaterialProps) => {
  const boxRef = useRef<Mesh>(null)
  const compensation = 2 + radius * 1.5
  const [colorIndex, setColorIndex] = useState(0)

  // Get words count safely
  const wordsCount = status.type === 'thinking' ? status.words : 0

  // Update color only when switching from waiting to thinking
  useEffect(() => {
    if (status.type === 'thinking') {
      setColorIndex((prev) => (prev + 1) % COLOR_PAIRS.length)
    }
  }, [status.type]) // Only depend on status.type, not words

  // Create dynamic rotations based on word count
  const { rotationX, rotationY, rotationZ, scale } = useSpring({
    rotationX:
      status.type === 'thinking' ? Math.sin(wordsCount * 0.1) * Math.PI : 0,
    rotationY:
      status.type === 'thinking' ? Math.cos(wordsCount * 0.1) * Math.PI : 0,
    rotationZ:
      status.type === 'thinking' ? Math.sin(wordsCount * 0.05) * Math.PI : 0,
    scale:
      status.type === 'thinking' ? 1 + Math.sin(wordsCount * 0.1) * 0.1 : 1,
    config: {
      mass: 2,
      tension: 200,
      friction: 30,
    },
  })

  const sphereColor =
    status.type === 'waiting' ? 'black' : COLOR_PAIRS[colorIndex][0]

  const attenuationColor =
    status.type === 'waiting' ? 'white' : COLOR_PAIRS[colorIndex][1]

  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={sphereColor} />
      </mesh>
      <animated.group
        rotation-x={rotationX}
        rotation-y={rotationY}
        rotation-z={rotationZ}
      >
        <animated.mesh ref={boxRef} scale={scale.to((s) => s * compensation)}>
          <RoundedBox radius={radius} smoothness={128}>
            <MeshTransmissionMaterial
              {...config}
              backsideThickness={0.5}
              distortion={0.1}
              backside={true}
              color={attenuationColor}
              attenuationColor={attenuationColor}
            />
          </RoundedBox>
        </animated.mesh>
      </animated.group>
    </>
  )
}
