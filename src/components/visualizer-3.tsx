import {
  OrbitControls,
  MeshTransmissionMaterial,
  Environment,
  PerspectiveCamera,
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import { BoxGeometry } from 'three'
import { Poline } from 'poline'
import React from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
const gridSize = 12
const gridOffset = 2
const spacing = 3 // Adjust this value to change the gap size

const Visualizer3 = () => {
  // Create a Poline instance with some interesting parameters

  const config = useControls({
    meshPhysicalMaterial: false,
    transmissionSampler: false,
    backside: false,
    samples: { value: 10, min: 1, max: 32, step: 1 },
    resolution: { value: 2048, min: 256, max: 2048, step: 256 },
    transmission: { value: 1, min: 0, max: 1 },
    roughness: { value: 0.0, min: 0, max: 1, step: 0.01 },
    thickness: { value: 3.5, min: 0, max: 10, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 5, step: 0.01 },
    chromaticAberration: { value: 0.06, min: 0, max: 1 },
    anisotropy: { value: 0.1, min: 0, max: 1, step: 0.01 },
    distortion: { value: 0.0, min: 0, max: 1, step: 0.01 },
    distortionScale: { value: 0.3, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: { value: 0.5, min: 0, max: 1, step: 0.01 },
    clearcoat: { value: 1, min: 0, max: 1 },
    attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
    attenuationColor: '#ffffff',
    color: '#c9ffa1',
    bg: '#839681',
  })

  return (
    <Canvas>
      <ambientLight intensity={1} />
      <color attach="background" args={['#fff']} />
      {/* <pointLight intensity={5.5} position={[10, 10, 10]} /> */}
      <Grid />
      <mesh position={[0, 0, 1]}>
        <planeGeometry args={[30, 10]} />
        <MeshTransmissionMaterial {...config} />
      </mesh>
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_puresky_1k.hdr"
        backgroundIntensity={1}
        // backgroundRotation={[Math.PI * 0.5, 0, Math.PI * 1]}
        background={false}
        backgroundBlurriness={1}
        // encoding={THREE.sRGBEncoding}
      />
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls />
    </Canvas>
  )
}

export default Visualizer3

const Grid = () => {
  const geo = useMemo(() => {
    return new BoxGeometry(1, 8, 1)
  }, [])

  const polineRef = useRef<Poline>()
  const [colors, setColors] = useState<string[]>([])

  useEffect(() => {
    polineRef.current = new Poline({
      numPoints: gridSize,
      closedLoop: true,
      invertLightness: true,
    })
    setColors(polineRef.current.colorsCSS)
  }, [])

  useFrame(() => {
    if (polineRef.current) {
      polineRef.current.shiftHue(0.3)
      setColors([...polineRef.current.colorsCSS])
    }
  })

  const material = useMemo(() => <meshStandardMaterial />, [])

  return (
    <>
      {Array.from({ length: gridSize }).map((_, index) => {
        const positionX = (index - gridSize / 2) * spacing + gridOffset
        return (
          <mesh key={index} geometry={geo} position={[positionX, 0, 0]}>
            {React.cloneElement(material, { color: colors[index] })}
          </mesh>
        )
      })}
    </>
  )
}
