import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

interface GameState {
  tick: number
  month: string
  inputs: string[]
  broccoli_1: number
  broccoli_2: number
  last_event_complete: number
  event: 'Sun' | 'Rain' | null
  phase: 'waiting' | 'playing' | 'over'
  winner: number | null
  last_scanned_tag: string | null
  tag_assignments: Record<string, string | null>
}

const SLOTS = [
  { role: 'TAG1', label: 'Player 1 — Sun', icon: '/assets/sun.svg' },
  { role: 'TAG2', label: 'Player 1 — Rain', icon: '/assets/rain.svg' },
  { role: 'TAG3', label: 'Player 2 — Sun', icon: '/assets/sun.svg' },
  { role: 'TAG4', label: 'Player 2 — Rain', icon: '/assets/rain.svg' },
]

const VALID_TAG_UIDS = ['200381038', '328536700', '3285396700', '1964104076', '2601429390']

export default function SetupPage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const lastProcessedTag = useRef<string | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/state')
        if (!res.ok) return
        const data = await res.json()
        setGameState(data)
      } catch {}
    }, 150)
    return () => clearInterval(interval)
  }, [])

  const assignTag = useCallback(async (role: string, uid: string) => {
    const res = await fetch('/assign_tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, uid }),
    })
    return res.ok
  }, [])

  useEffect(() => {
    const scannedTag = gameState?.last_scanned_tag
    if (!scannedTag || scannedTag === lastProcessedTag.current) return
    if (currentStep >= 4) return

    lastProcessedTag.current = scannedTag
    setError(null)

    if (!VALID_TAG_UIDS.includes(scannedTag)) {
      setError(`"${scannedTag}" is not a valid chip.`)
      return
    }

    const tagAssignments = gameState?.tag_assignments ?? {}
    for (const [role, uid] of Object.entries(tagAssignments)) {
      if (uid === scannedTag && role !== SLOTS[currentStep].role) {
        setError(`Already assigned to ${role}. Scan a different chip.`)
        return
      }
    }

    assignTag(SLOTS[currentStep].role, scannedTag).then(ok => {
      if (ok) {
        setSuccess(true)
        setError(null)
        setTimeout(() => {
          setSuccess(false)
          setCurrentStep(prev => prev + 1)
        }, 1000)
      } else {
        setError('Failed to assign. Try again.')
      }
    })
  }, [gameState?.last_scanned_tag, gameState?.tag_assignments, currentStep, assignTag])

  const done = currentStep >= 4 && !success

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-5xl font-bold mb-2">Setup</h1>
      <p className="text-lg text-gray-500 mb-10">Scan each chip to assign its role</p>

      <div className="flex gap-3 mb-12">
        {SLOTS.map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < currentStep
                ? 'bg-green-500'
                : i === currentStep
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {!done ? (
        <div className="w-full max-w-lg">
          <div
            key={currentStep}
            className="relative bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6 animate-[fadeIn_0.3s_ease-out]"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-[pulse_2s_ease-in-out_infinite]" />
              <div className="relative size-32 flex items-center justify-center rounded-full bg-blue-50">
                <img src={SLOTS[currentStep].icon} className="size-20" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                Step {currentStep + 1} of 4
              </p>
              <h2 className="text-2xl font-bold">
                {SLOTS[currentStep].label}
              </h2>
            </div>

            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="w-12 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <svg className="size-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Place chip on the reader</p>
            </div>

            {success && (
              <div className="absolute inset-0 rounded-3xl bg-green-500/10 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <svg className="size-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <p className="text-xl font-bold text-green-600">Assigned!</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 px-5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 animate-[fadeIn_0.4s_ease-out]">
          <svg className="size-20 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          <h2 className="text-3xl font-bold">All set!</h2>
          <p className="text-gray-500">All 4 chips are assigned</p>
          <Link
            to="/"
            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-2xl transition-colors shadow-lg"
          >
            Start Game
          </Link>
        </div>
      )}

      <Link
        to="/"
        className="mt-10 text-gray-400 hover:text-gray-600 transition-colors text-sm"
      >
        ← Back to game
      </Link>
    </div>
  )
}
