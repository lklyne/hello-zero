import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import KleinBottleConsciousness from './KleinBottleConsciousness'
import { useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { Message } from '@anthropic-ai/sdk/resources/messages/messages.mjs'
import { analyzeResponse, mapToKleinState } from '@/hooks/use-response-analyzer'
import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from '../schema'

type VisualizerStatus =
  | { type: 'waiting' }
  | { type: 'thinking'; message: Message }
  | { type: 'processing' }
  | { type: 'error' }

export interface KleinState {
  complexity: number
  pulseRate: number
  surfaceTension: number
  luminescence: number
  iridescence: number
  rotation: number
  fluidity: number
  symmetry: number
  transparency: number
  rotationVectors: {
    primary: THREE.Vector3
    secondary: THREE.Vector3
    tertiary: THREE.Vector3
  }
  harmonicPatterns: Array<{
    frequency: number
    amplitude: number
    phase: number
  }>
}

interface ConsciousnessVisualizerProps {
  chatID?: string
  isProcessing?: boolean
}

const ConsciousnessVisualizer = ({
  chatID,
  isProcessing,
}: ConsciousnessVisualizerProps) => {
  const z = useZero<Schema>()
  const [messages] = useQuery(
    chatID
      ? z.query.message
          .where('chatID', '=', chatID)
          .orderBy('timestamp', 'desc')
          .limit(1)
      : z.query.message.where('chatID', '=', 'non-existent-id')
  )

  const latestMessage = messages[0]
  const status = useMemo(() => {
    if (isProcessing) {
      return { type: 'thinking' as const, message: latestMessage }
    }
    return latestMessage?.role === 'assistant'
      ? { type: 'thinking' as const, message: latestMessage }
      : { type: 'waiting' as const }
  }, [latestMessage, isProcessing])

  const [kleinState, setKleinState] = useState<KleinState>({
    complexity: 0.5,
    pulseRate: 0.2,
    surfaceTension: 0.7,
    luminescence: 0.5,
    iridescence: 0.5,
    rotation: 0,
    fluidity: 0.5,
    symmetry: 0.7,
    transparency: 0.6,
    rotationVectors: {
      primary: new THREE.Vector3(0.1, 0.1, 0.1),
      secondary: new THREE.Vector3(0.05, 0.05, 0.05),
      tertiary: new THREE.Vector3(0.02, 0.02, 0.02),
    },
    harmonicPatterns: [],
  })

  useEffect(() => {
    let analysis = {
      emotionalValence: 0.5,
      cognitiveLoad: 0.3,
      creativeFlow: 0.5,
    }

    if (status.type === 'thinking') {
      analysis = analyzeResponse(status.message)
      console.log(analysis)
    }

    console.log(status)

    switch (status.type) {
      case 'thinking': {
        setKleinState((prev) => ({
          ...mapToKleinState(analysis),
          rotation: prev.rotation + 0.1,
          rotationVectors: {
            primary: new THREE.Vector3().addVectors(
              prev.rotationVectors.primary,
              new THREE.Vector3(0.01, 0.01, 0.01)
            ),
            secondary: new THREE.Vector3().addVectors(
              prev.rotationVectors.secondary,
              new THREE.Vector3(0.005, 0.005, 0.005)
            ),
            tertiary: new THREE.Vector3().addVectors(
              prev.rotationVectors.tertiary,
              new THREE.Vector3(0.002, 0.002, 0.002)
            ),
          },
        }))
        break
      }

      case 'error':
        setKleinState({
          complexity: 0.9,
          pulseRate: 0.8,
          surfaceTension: 0.9,
          luminescence: 0.3,
          iridescence: 0.2,
          rotation: 0,
          fluidity: 0.5,
          symmetry: 0.7,
          transparency: 0.6,
          rotationVectors: {
            primary: new THREE.Vector3(0.1, 0.1, 0.1),
            secondary: new THREE.Vector3(0.05, 0.05, 0.05),
            tertiary: new THREE.Vector3(0.02, 0.02, 0.02),
          },
          harmonicPatterns: [],
        })
        break

      default:
        setKleinState({
          complexity: 0.5,
          pulseRate: 0.2,
          surfaceTension: 0.7,
          luminescence: 0.5,
          iridescence: 0.5,
          rotation: 0,
          fluidity: 0.5,
          symmetry: 0.7,
          transparency: 0.6,
          rotationVectors: {
            primary: new THREE.Vector3(0.1, 0.1, 0.1),
            secondary: new THREE.Vector3(0.05, 0.05, 0.05),
            tertiary: new THREE.Vector3(0.02, 0.02, 0.02),
          },
          harmonicPatterns: [],
        })
    }
  }, [status])

  const analysis = useMemo(
    () =>
      status.type === 'thinking' && status.message
        ? analyzeResponse(status.message)
        : {
            emotionalValence: 0.5,
            cognitiveLoad: 0.3,
            creativeFlow: 0.5,
            wordCount: 0,
          },
    [status]
  )

  const { emotionalValence, cognitiveLoad, creativeFlow } = analysis

  return (
    <Canvas>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_puresky_1k.hdr"
        backgroundIntensity={2}
        background={false}
        backgroundBlurriness={1}
      />
      <OrbitControls />
      <KleinBottleConsciousness
        state={kleinState}
        emotionalValence={emotionalValence}
        cognitiveLoad={cognitiveLoad}
        creativeFlow={creativeFlow}
      />
    </Canvas>
  )
}

export default ConsciousnessVisualizer
