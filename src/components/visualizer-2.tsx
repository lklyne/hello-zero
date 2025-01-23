import {
  OrbitControls,
  MeshTransmissionMaterial,
  Environment,
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import { BoxGeometry } from 'three'
import { Poline } from 'poline'
import React from 'react'

const gridSize = 12
const gridOffset = 0.5
const spacing = 1.8 // Adjust this value to change the gap size

const Visualizer2 = () => {
  // Create a Poline instance with some interesting parameters

  return (
    <div className="w-full h-full bg-gray-50">
      <Canvas>
        <ambientLight intensity={1.5} />
        <pointLight intensity={5.5} position={[10, 10, 10]} />
        <Grid />
        <Environment
          files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_puresky_1k.hdr"
          backgroundIntensity={2}
          // background
          backgroundBlurriness={1}
        />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default Visualizer2

const Grid = () => {
  const geo = useMemo(() => {
    return new BoxGeometry(1.5, 8, 1.5)
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
      polineRef.current.shiftHue(1)
      setColors([...polineRef.current.colorsCSS])
    }
  })

  const material = useMemo(
    () => (
      <MeshTransmissionMaterial
        backside={true}
        samples={4}
        thickness={0.5}
        chromaticAberration={0.2}
        anisotropy={0.3}
        distortion={0.1}
        transmission={0.99}
        roughness={0.4}
      />
    ),
    []
  )

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
