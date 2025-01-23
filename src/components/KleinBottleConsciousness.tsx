import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Types from our API design
type ResonancePattern = {
  frequency: number
  amplitude: number
  phase: number
}

type TopologyState = {
  complexity: number
  fluidity: number
  symmetry: number
  transparency: number
  luminescence: number
  iridescence: number
  surfaceTension: number
  pulseRate: number
  rotationVectors: {
    primary: THREE.Vector3
    secondary: THREE.Vector3
    tertiary: THREE.Vector3
  }
  harmonicPatterns: ResonancePattern[]
}

const initialState: TopologyState = {
  complexity: 0.5,
  fluidity: 0.5,
  symmetry: 0.7,
  transparency: 0.6,
  luminescence: 0.5,
  iridescence: 0.5,
  surfaceTension: 0.5,
  pulseRate: 0.3,
  rotationVectors: {
    primary: new THREE.Vector3(0.1, 0.1, 0.1),
    secondary: new THREE.Vector3(0.05, 0.05, 0.05),
    tertiary: new THREE.Vector3(0.02, 0.02, 0.02),
  },
  harmonicPatterns: [],
}

export default function KleinBottleConsciousness({
  state = initialState,
  emotionalValence = 0,
  cognitiveLoad = 0,
  creativeFlow = 0,
}: {
  state?: TopologyState
  emotionalValence?: number
  cognitiveLoad?: number
  creativeFlow?: number
} = {}) {
  const meshRef = useRef()
  const materialRef = useRef()
  const geometryRef = useRef()
  const time = useRef(0)

  // Ensure we're using the full initial state by merging with defaults
  const mergedState = useMemo(
    () => ({
      ...initialState,
      ...state,
    }),
    [state]
  )

  // Klein bottle parametric function
  const kleinBottleFunction = (u: number, v: number, target: THREE.Vector3) => {
    const uPi = u * Math.PI * 2
    const vPi = v * Math.PI * 2

    // Base Klein bottle shape
    let x =
      (2 +
        Math.cos(vPi / 2) * Math.sin(uPi) -
        Math.sin(vPi / 2) * Math.sin(2 * uPi)) *
      Math.cos(vPi)
    let y =
      (2 +
        Math.cos(vPi / 2) * Math.sin(uPi) -
        Math.sin(vPi / 2) * Math.sin(2 * uPi)) *
      Math.sin(vPi)
    let z =
      Math.sin(vPi / 2) * Math.sin(uPi) + Math.cos(vPi / 2) * Math.sin(2 * uPi)

    // Apply state-based deformations
    const deformation =
      Math.sin(
        time.current * mergedState.pulseRate + u * mergedState.complexity
      ) * mergedState.fluidity
    x += deformation * 0.2
    y += deformation * 0.2
    z += deformation * 0.2

    // Apply harmonic patterns (now safe to access)
    mergedState.harmonicPatterns.forEach((pattern) => {
      const wave =
        Math.sin(pattern.frequency * uPi + pattern.phase + time.current) *
        pattern.amplitude
      x += wave * 0.1
      y += wave * 0.1
      z += wave * 0.1
    })

    // Scale based on surface tension
    const scale = 0.5 * (1 + (1 - mergedState.surfaceTension) * 0.2)
    return target.set(x * scale, y * scale, z * scale)
  }

  // Generate geometry with current parameters
  const geometry = useMemo(() => {
    const resolution = Math.floor(20 + mergedState.complexity * 80)
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const uvs = []
    const indices = []

    // Generate vertices
    for (let i = 0; i <= resolution; i++) {
      const u = i / resolution
      for (let j = 0; j <= resolution; j++) {
        const v = j / resolution
        const vertex = new THREE.Vector3()
        kleinBottleFunction(u, v, vertex)
        vertices.push(vertex.x, vertex.y, vertex.z)
        uvs.push(u, v)
      }
    }

    // Generate indices for triangles
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a = i * (resolution + 1) + j
        const b = a + 1
        const c = a + (resolution + 1)
        const d = c + 1
        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    )
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
  }, [mergedState.complexity])

  // Update animation and state
  useFrame((state, delta) => {
    if (!meshRef.current) return

    time.current += delta

    // Update rotations
    meshRef.current.rotation.x += mergedState.rotationVectors.primary.x * delta
    meshRef.current.rotation.y += mergedState.rotationVectors.primary.y * delta
    meshRef.current.rotation.z += mergedState.rotationVectors.primary.z * delta

    // Update material properties
    if (materialRef.current) {
      materialRef.current.transmission = 1 - mergedState.transparency
      materialRef.current.thickness = mergedState.surfaceTension * 2
      materialRef.current.chromaticAberration = mergedState.iridescence
      materialRef.current.clearcoat = mergedState.luminescence

      // Color based on emotional valence
      const hue = 0.6 + emotionalValence * 0.2 // Blue to purple range
      const saturation = 0.5 + cognitiveLoad * 0.5
      const lightness = 0.5 + creativeFlow * 0.3
      materialRef.current.color.setHSL(hue, saturation, lightness)
    }

    // Update geometry if needed
    if (geometryRef.current) {
      geometryRef.current.verticesNeedUpdate = true
      geometryRef.current.normalsNeedUpdate = true
    }
  })

  return (
    <mesh ref={meshRef}>
      <primitive object={geometry} ref={geometryRef} />
      {/* <MeshTransmissionMaterial
        ref={materialRef}
        samples={16}
        resolution={256}
        anisotropicBlur={1}
        distortion={0.5}
        distortionScale={0.5}
        temporalDistortion={0.1}
        metalness={0.1}
        roughness={0.2}
        thickness={1}
        side={THREE.DoubleSide}
      /> */}
      <meshNormalMaterial />
      {/* <meshNormalMaterial side={THREE.DoubleSide} /> */}
    </mesh>
  )
}
