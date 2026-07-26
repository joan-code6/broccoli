import { useState, useEffect, useRef, useCallback } from 'react'
import RoughCard from './RoughCard'

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
  registered_usernames: string[]
  usernames: { p1: string | null, p2: string | null }
}

interface TagConfig {
  tag_config: Record<string, string>
  valid_tag_uids: string[]
}

const TAG_SLOTS = [
  { role: 'TAG1', label: 'Player 1 - Sun', icon: '/assets/sun.svg' },
  { role: 'TAG2', label: 'Player 1 - Rain', icon: '/assets/rain.svg' },
  { role: 'TAG3', label: 'Player 2 - Sun', icon: '/assets/sun.svg' },
  { role: 'TAG4', label: 'Player 2 - Rain', icon: '/assets/rain.svg' },
]

function findTagUid(scanned: string, tagConfig: Record<string, string>): string | null {
  for (let i = 0; i <= scanned.length - 3; i++) {
    const sub = scanned.substring(i, i + 3)
    if (sub === '260') {
      if (i + 3 < scanned.length) {
        return scanned[i + 3] === '1' ? '2601429390' : '2600381038'
      }
      return '2600381038'
    }
    if (sub in tagConfig) return tagConfig[sub]
  }
  return null
}

interface SetupOverlayProps {
  onClose: () => void
}

export default function SetupOverlay({ onClose }: SetupOverlayProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [tagConfig, setTagConfig] = useState<TagConfig | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const lastProcessedTag = useRef<string | null>(null)

  useEffect(() => {
    fetch('/tag_config')
      .then(res => res.json())
      .then(data => setTagConfig(data))
      .catch(() => {})
  }, [])

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

  const assignUsername = useCallback(async (username: string, slot: 'p1' | 'p2') => {
    const res = await fetch('/register_player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, slot }),
    })
    return res.ok
  }, [])

  useEffect(() => {
    const scannedTag = gameState?.last_scanned_tag
    if (!scannedTag || typeof scannedTag !== 'string') return
    if (!tagConfig) return
    const trimmed = scannedTag.trim()
    if (!trimmed || trimmed === lastProcessedTag.current) return
    const tagStep = currentStep - 1
    if (tagStep < 0 || tagStep >= 4) return

    lastProcessedTag.current = trimmed
    setError(null)

    const resolvedUid = findTagUid(trimmed, tagConfig.tag_config)
    if (!resolvedUid || !tagConfig.valid_tag_uids.includes(resolvedUid)) {
      setError(`"${trimmed}" is not a valid chip.`)
      return
    }

    const tagAssignments = gameState?.tag_assignments ?? {}
    for (const [role, uid] of Object.entries(tagAssignments)) {
      if (uid === resolvedUid && role !== TAG_SLOTS[tagStep].role) {
        setError(`Already assigned to ${role}. Scan a different chip.`)
        return
      }
    }

    assignTag(TAG_SLOTS[tagStep].role, resolvedUid).then(ok => {
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
  }, [gameState?.last_scanned_tag, gameState?.tag_assignments, currentStep, assignTag, tagConfig])

  const registeredUsernames = gameState?.registered_usernames ?? []
  const usernames = gameState?.usernames ?? { p1: null, p2: null }
  const bothPlayersAssigned = usernames.p1 !== null && usernames.p2 !== null
  const isPlayerPhase = currentStep === 0
  const isTagPhase = currentStep >= 1 && currentStep <= 4
  const done = currentStep >= 5 && !success

  const handleAssignSide = async (username: string | null, slot: 'p1' | 'p2') => {
    const ok = await assignUsername(username ?? '', slot)
    if (ok) {
      setError(null)
    } else {
      setError('Failed to assign player. Try again.')
    }
  }

  const handleBackToPlayers = () => {
    setCurrentStep(0)
    setError(null)
    setSuccess(false)
    lastProcessedTag.current = null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <RoughCard className="p-20 px-32 shadow-2xl flex flex-col items-center gap-14 w-full max-w-2xl text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-2xl">Setup</h1>

        {!tagConfig ? (
          <p className="text-white/40">Loading...</p>
        ) : !done ? (
          <>
            {isPlayerPhase && (
              <div className="flex flex-col items-center gap-8 animate-[fadeIn_0.3s_ease-out] w-full">
                <p className="text-lg text-white/60">Use the mobile app to register your username</p>

                {registeredUsernames.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="size-10 border-2 border-white/30 border-t-blue-400 rounded-full animate-spin" />
                    <p className="text-sm text-white/40">Waiting for players...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    {registeredUsernames.map(username => {
                      const isP1 = usernames.p1 === username
                      const isP2 = usernames.p2 === username
                      const assigned = isP1 || isP2

                      return (
                        <div
                          key={username}
                          className={`flex items-center justify-between px-5 py-3 rounded-xl transition-all ${
                            assigned ? 'bg-green-500/10 border border-green-400/30' : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          <span className="text-white font-bold text-lg">{username}</span>
                          {!assigned && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAssignSide(username, 'p1')}
                                disabled={usernames.p1 !== null}
                                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                              >
                                Player 1
                              </button>
                              <button
                                onClick={() => handleAssignSide(username, 'p2')}
                                disabled={usernames.p2 !== null}
                                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30"
                              >
                                Player 2
                              </button>
                            </div>
                          )}
                          {assigned && (
                            <button
                              onClick={() => handleAssignSide(null, isP1 ? 'p1' : 'p2')}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-green-500/20 hover:bg-red-500/20 text-green-400 hover:text-red-300 border border-green-400/30 hover:border-red-400/30 transition-all cursor-pointer"
                            >
                              {isP1 ? 'Player 1' : 'Player 2'}
                              <span className="text-xs">✕</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {error && (
                  <div className="px-5 py-3 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300 text-center text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => setCurrentStep(1)}
                  disabled={!bothPlayersAssigned}
                  className="px-10 py-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                >
                  Continue to Tags
                </button>
              </div>
            )}

            {isTagPhase && (
              <div className="flex flex-col items-center gap-10 animate-[fadeIn_0.3s_ease-out]">
                <p className="text-lg text-white/60 mb-2">Scan each chip to assign its role</p>

                <div key={currentStep} className="flex flex-col items-center gap-10 animate-[fadeIn_0.3s_ease-out]">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-[pulse_2s_ease-in-out_infinite]" />
                    <div className="relative size-28 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
                      <img src={TAG_SLOTS[currentStep - 1].icon} className="size-16" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-white/40 uppercase tracking-wider mb-1">
                      Step {currentStep} of 4
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                      {TAG_SLOTS[currentStep - 1].label}
                    </h2>
                  </div>

                  <p className="text-sm text-white/50">Present your chip to the reader</p>

                  {success && (
                    <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                      <svg className="size-14 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <p className="text-xl font-bold text-green-400">Assigned!</p>
                    </div>
                  )}

                  {error && (
                    <div className="px-5 py-3 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300 text-center text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBackToPlayers}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                >
                  ← Back to Players
                </button>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < currentStep
                      ? 'bg-green-400'
                      : i === currentStep
                        ? 'bg-blue-400 scale-125'
                        : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-8 animate-[fadeIn_0.4s_ease-out]">
            <svg className="size-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
            <h2 className="text-3xl font-black text-white">All set!</h2>
            <p className="text-white/60">Players and chips are ready</p>
            <button
              onClick={onClose}
              className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white text-xl font-bold rounded-2xl backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
            >
              Back to Game
            </button>
          </div>
        )}

        {tagConfig && (
          <button
            onClick={onClose}
            className="mt-4 text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer rounded-full"
          >
            Back to Game
          </button>
        )}
      </RoughCard>
    </div>
  )
}
