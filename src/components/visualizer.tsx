import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import {
  Environment,
  MeshTransmissionMaterial,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
} from '@react-three/drei'

import { useControls, Leva } from 'leva'

const Visualizer = () => {
  const config = useControls({
    radius: { value: 0.2, min: 0, max: 0.5, step: 0.01 },
    roughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    thickness: { value: 2.75, min: 0, max: 10, step: 0.01 },
    ior: { value: 1.25, min: 0, max: 10, step: 0.01 },
  })

  return (
    <div>
      <Canvas className="absolute inset-0">
        {/* <color attach="background" args={['#ffffff']} /> */}
        <Box {...config} />
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <ambientLight intensity={4} />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <Environment
          files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_puresky_1k.hdr"
          backgroundIntensity={2}
          // background
          backgroundBlurriness={1}
        />{' '}
        <OrbitControls />
      </Canvas>
      <Leva hidden />
    </div>
  )
}

export default Visualizer

const Box = ({
  radius,
  ...config
}: { radius: number } & MeshTransmissionMaterialProps) => {
  const boxRef = useRef<Mesh>(null)
  const lerpRef = useRef({
    radius: radius,
    compensation: 2 + radius * 1.5,
  })

  const LERP_FACTOR = 0.1

  useFrame((state, delta) => {
    if (boxRef.current) {
      // Lerp the radius
      lerpRef.current.radius += (radius - lerpRef.current.radius) * LERP_FACTOR

      // Lerp the compensation factor
      const targetCompensation = 2 + radius * 1.5
      lerpRef.current.compensation +=
        (targetCompensation - lerpRef.current.compensation) * LERP_FACTOR

      boxRef.current.rotation.x += delta * 1.2
      boxRef.current.rotation.y += delta * 4
    }
  })

  return (
    <RoundedBox
      ref={boxRef}
      scale={lerpRef.current.compensation}
      position={[0, 0, 0]}
      radius={lerpRef.current.radius}
      smoothness={64}
    >
      <MeshTransmissionMaterial
        transmission={1}
        {...config}
        samples={24}
        anisotropy={0.1}
        chromaticAberration={1}
        distortionScale={0.1}
        distortion={0.1}
        backside={true}
        attenuationDistance={1}
        attenuationColor={'#ffffff'}
        color={'#ffffff'}
      />
    </RoundedBox>
  )
}
