import * as THREE from 'three'
import { type KleinState } from '@/components/ConsciousnessVisualizer'

interface AnalyzedResponse {
  cognitiveLoad: number
  emotionalValence: number
  creativeFlow: number
  wordCount: number
}

const EMOTIONAL_INDICATORS = {
  positive: ['fascinating', 'exciting', 'wonderful', 'enjoy', 'love'],
  negative: ['unfortunately', 'sadly', 'difficult', 'challenging'],
  neutral: ['consider', 'analyze', 'examine', 'evaluate'],
}

const CREATIVE_INDICATORS = [
  'imagine',
  'envision',
  'create',
  'design',
  'innovative',
  'novel',
  'unique',
]

interface AppMessage {
  id: string
  chatID: string
  role: string
  content: string
  timestamp: number
}

const analyzeResponse = (message?: AppMessage): AnalyzedResponse => {
  if (!message?.content?.trim()) {
    return {
      cognitiveLoad: 0,
      emotionalValence: 0,
      creativeFlow: 0,
      wordCount: 0,
    }
  }

  const text = message.content

  const wordCount = text.split(/\s+/).filter(Boolean).length

  const emotionalValence = calculateEmotionalValence(text)
  const creativeFlow = calculateCreativeFlow(text)
  const cognitiveLoad = Math.min(wordCount / 50, 1)

  return {
    cognitiveLoad,
    emotionalValence,
    creativeFlow,
    wordCount,
  }
}

const calculateEmotionalValence = (text: string): number => {
  if (!text.trim()) return 0
  const lowercase = text.toLowerCase()

  const positive = EMOTIONAL_INDICATORS.positive.reduce(
    (count, term) =>
      count + (lowercase.match(new RegExp(term, 'g')) || []).length,
    0
  )

  const negative = EMOTIONAL_INDICATORS.negative.reduce(
    (count, term) =>
      count + (lowercase.match(new RegExp(term, 'g')) || []).length,
    0
  )

  const neutral = EMOTIONAL_INDICATORS.neutral.reduce(
    (count, term) =>
      count + (lowercase.match(new RegExp(term, 'g')) || []).length,
    0
  )

  const total = positive + negative + neutral || 1
  return (positive - negative) / total
}

const calculateCreativeFlow = (text: string): number => {
  if (!text.trim()) return 0
  const creativeTerms = CREATIVE_INDICATORS.reduce(
    (count, term) =>
      count + (text.toLowerCase().match(new RegExp(term, 'g')) || []).length,
    0
  )

  return Math.min(creativeTerms / 10, 1)
}

const mapToKleinState = (analysis: AnalyzedResponse): KleinState => ({
  complexity: 0.5 + analysis.cognitiveLoad * 0.5,
  pulseRate: 0.3 + analysis.cognitiveLoad * 0.3,
  surfaceTension: 0.7 - analysis.cognitiveLoad * 0.4,
  luminescence: 0.6 + analysis.emotionalValence * 0.4,
  iridescence: 0.5 + analysis.cognitiveLoad * 0.3,
  rotation: 0,
  fluidity: 0.5 + analysis.cognitiveLoad * 0.1,
  symmetry: 0.7,
  transparency: 0.6,
  rotationVectors: {
    primary: new THREE.Vector3(0.1, 0.1, 0.1),
    secondary: new THREE.Vector3(0.05, 0.05, 0.05),
    tertiary: new THREE.Vector3(0.02, 0.02, 0.02),
  },
  harmonicPatterns: [
    {
      frequency: analysis.cognitiveLoad * 10,
      amplitude: 0.1,
      phase: Math.random() * Math.PI,
    },
  ],
})

export { analyzeResponse, mapToKleinState }
export type { AnalyzedResponse }
