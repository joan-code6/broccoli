import { useState, useEffect, useCallback, useRef } from 'react'
import { computeScale } from './broccoli-growth'
import RoughCard from './RoughCard'
import SetupOverlay from './SetupOverlay'

const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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

function Calendar({ month }: { month: string }) {
  const monthIndex = FULL_MONTHS.indexOf(month)
  const currentProp = monthIndex >= 0 ? MONTHS[monthIndex] : month

  const prevMonthRef = useRef(month)
  const [folding, setFolding] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(currentProp)

  const displayIdx = MONTHS.indexOf(displayMonth)
  const next = displayIdx >= 0 ? MONTHS[(displayIdx + 1) % MONTHS.length] : currentProp

  useEffect(() => {
    if (prevMonthRef.current !== month) {
      setFolding(true)
      const timer = setTimeout(() => {
        setDisplayMonth(currentProp)
        setFolding(false)
      }, 600)
      prevMonthRef.current = month
      return () => clearTimeout(timer)
    } else {
      setDisplayMonth(currentProp)
    }
  }, [month, currentProp])

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative"
        style={{ perspective: '800px' }}
      >
        <div className="absolute inset-0">
          <div className="relative size-55">
            <img src="/assets/calendar.svg" className="size-55" />
            <span className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold scale-200" style={{ color: 'white' }}>
              {next}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className={`relative size-55 ${folding ? 'animate-calendar-fold' : ''}`}>
            <img src="/assets/calendar.svg" className="size-55" />
            <span className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-white font-bold scale-200" style={{ color: 'white' }}>
              {displayMonth}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/state')
        if (!res.ok) return
        const data = await res.json()
        setGameState(data)
      } catch {
        // backend not ready yet
      }
    }, 150)
    return () => clearInterval(interval)
  }, [])

  const handleStart = useCallback(async () => {
    await fetch('/start', { method: 'POST' })
  }, [])

  const currentEvent = gameState?.event ?? null

  const broccoli1Ref = useRef<HTMLDivElement>(null)
  const broccoli2Ref = useRef<HTMLDivElement>(null)
  const eventRef = useRef<HTMLDivElement>(null)
  const prevEventRef = useRef<'Sun' | 'Rain' | null>(null)
  const prevBroc1Ref = useRef<number>(0)
  const prevBroc2Ref = useRef<number>(0)
  const flyingPlayerRef = useRef<1 | 2>(1)

  const [isFlying, setIsFlying] = useState(false)
  const [flyOffset, setFlyOffset] = useState<{dx: number; dy: number} | null>(null)
  const [flyingEvent, setFlyingEvent] = useState<'Sun' | 'Rain' | null>(null)

  useEffect(() => {
    const prevEvent = prevEventRef.current
    const prevBroc1 = prevBroc1Ref.current
    const prevBroc2 = prevBroc2Ref.current
    const curBroc1 = gameState?.broccoli_1 ?? 0
    const curBroc2 = gameState?.broccoli_2 ?? 0

    if (prevEvent !== null && currentEvent === null && !isFlying) {
      const delta1 = curBroc1 - prevBroc1
      const delta2 = curBroc2 - prevBroc2
      const player: 1 | 2 = delta1 > delta2 ? 1 : 2
      flyingPlayerRef.current = player
      setFlyingEvent(prevEvent)
      setIsFlying(true)
    }

    prevEventRef.current = currentEvent
    prevBroc1Ref.current = curBroc1
    prevBroc2Ref.current = curBroc2
  }, [currentEvent, gameState?.broccoli_1, gameState?.broccoli_2, isFlying])

  useEffect(() => {
    if (isFlying && flyOffset === null) {
      const player = flyingPlayerRef.current
      const targetRef = player === 1 ? broccoli1Ref : broccoli2Ref

      if (eventRef.current && targetRef.current) {
        const eventRect = eventRef.current.getBoundingClientRect()
        const targetRect = targetRef.current.getBoundingClientRect()
        setFlyOffset({
          dx: targetRect.left + targetRect.width / 2 - (eventRect.left + eventRect.width / 2),
          dy: targetRect.top + targetRect.height / 2 - (eventRect.top + eventRect.height / 2),
        })
        setTimeout(() => {
          setIsFlying(false)
          setFlyOffset(null)
          setFlyingEvent(null)
        }, 650)
      }
    }
  }, [isFlying, flyOffset])

  const scale1 = computeScale(gameState?.broccoli_1 ?? 0)
  const scale2 = computeScale(gameState?.broccoli_2 ?? 0)

  const phase = gameState?.phase ?? 'waiting'
  const winner = gameState?.winner
  const tagAssignments = gameState?.tag_assignments ?? {}
  const allTagsAssigned = Object.values(tagAssignments).every(v => v !== null)
  const bothPlayersAssigned = gameState?.usernames?.p1 != null && gameState?.usernames?.p2 != null

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <img
          src="/assets/clouds/1.webp"
          className="absolute top-0 animate-[marquee_30s_linear_infinite]"
        />
        <img
          src="/assets/clouds/4.webp"
          className="absolute top-0 scale-50 animate-[marquee_46s_linear_infinite] [animation-delay:-16s]"
        />
      </div>

      {phase === 'over' && !showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <RoughCard className="p-16 px-24 shadow-2xl flex flex-col items-center gap-10 w-full max-w-2xl text-center">
            <h1 className="text-6xl font-black text-white drop-shadow-2xl">
              {winner === 1 && `${gameState?.usernames?.p1 ?? 'Player 1'} Wins!`}
              {winner === 2 && `${gameState?.usernames?.p2 ?? 'Player 2'} Wins!`}
              {winner === 0 && "It's a Tie!"}
            </h1>
            <div className="flex gap-10 text-3xl font-bold text-white/70">
              <span>{gameState?.usernames?.p1 ?? 'P1'}: {gameState?.broccoli_1 ?? 0}</span>
              <span className="text-white/30">|</span>
              <span>{gameState?.usernames?.p2 ?? 'P2'}: {gameState?.broccoli_2 ?? 0}</span>
            </div>
            <div className="flex flex-col items-center gap-5">
              <button
                onClick={handleStart}
                className="px-12 py-5 bg-white/10 hover:bg-white/20 text-white text-2xl font-bold backdrop-blur-sm transition-all cursor-pointer rounded-2xl"
              >
                Play Again
              </button>
              <button
                onClick={() => setShowSetup(true)}
                className="text-lg text-white/50 hover:text-white/80 transition-colors cursor-pointer rounded-full"
              >
                Setup Tags
              </button>
            </div>
          </RoughCard>
        </div>
      )}

      {phase === 'waiting' && !showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <RoughCard className="p-10 px-24 shadow-2xl flex flex-col items-center gap-8 w-full max-w-2xl text-center">
            <h1 className="text-6xl font-black text-white drop-shadow-2xl">Broccoli</h1>

            <div className="flex flex-col items-center gap-4 w-full">
              <h2 className="text-2xl font-bold text-white/80">1. Add Players</h2>
              <p className="text-sm text-white/50">Use the mobile app to register your username</p>

              {!gameState ? (
                <div className="flex items-center gap-3 py-3">
                  <div className="size-6 border-2 border-white/30 border-t-blue-400 rounded-full animate-spin" />
                  <p className="text-sm text-white/40">Connecting...</p>
                </div>
              ) : (gameState.registered_usernames?.length ?? 0) === 0 ? (
                <div className="flex items-center gap-3 py-3">
                  <div className="size-6 border-2 border-white/30 border-t-blue-400 rounded-full animate-spin" />
                  <p className="text-sm text-white/40">Waiting for players...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full max-w-sm">
                  {gameState.registered_usernames.map(username => {
                    const isP1 = gameState.usernames?.p1 === username
                    const isP2 = gameState.usernames?.p2 === username
                    const assigned = isP1 || isP2
                    return (
                      <div key={username} className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${assigned ? 'bg-green-500/10 border border-green-400/30' : 'bg-white/5 border border-white/10'}`}>
                        <span className="text-white font-bold text-base">{username}</span>
                        {!assigned ? (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await fetch('/register_player', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, slot: 'p1' }) })
                              }}
                              disabled={gameState.usernames?.p1 != null}
                              className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                            >
                              Player 1
                            </button>
                            <button
                              onClick={async () => {
                                await fetch('/register_player', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, slot: 'p2' }) })
                              }}
                              disabled={gameState.usernames?.p2 != null}
                              className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30"
                            >
                              Player 2
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              await fetch('/register_player', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: '', slot: isP1 ? 'p1' : 'p2' }) })
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500/20 hover:bg-red-500/20 text-green-400 hover:text-red-300 border border-green-400/30 hover:border-red-400/30 transition-all cursor-pointer"
                          >
                            {isP1 ? 'Player 1' : 'Player 2'}
                            <span>✕</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <h2 className="text-2xl font-bold text-white/80">2. Setup Tags</h2>
              <button
                onClick={() => setShowSetup(true)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-base font-bold rounded-xl backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
              >
                {allTagsAssigned ? 'Tags Ready ✓' : 'Scan Tags'}
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                onClick={handleStart}
                disabled={!bothPlayersAssigned || !allTagsAssigned}
                className="px-14 py-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-2xl font-bold backdrop-blur-sm transition-all cursor-pointer rounded-2xl disabled:opacity-40"
              >
                Start Game
              </button>
            </div>
          </RoughCard>
        </div>
      )}

      <div className="grid grid-cols-3 min-h-[100svh]">
        <div className="flex flex-col items-center">
          {gameState?.usernames?.p1 && (
            <p className="text-2xl font-bold text-white/80 mt-6 mb-2 drop-shadow-lg">{gameState.usernames.p1}</p>
          )}
          <div ref={broccoli1Ref} className="broccoli-1 flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale1}) translateY(9px)`, transformOrigin: 'bottom center', transition: 'transform 0.3s ease-out' }}
            />
          </div>
          <p className="text-3xl text-center mt-4 font-line">{gameState?.broccoli_1 ?? 0}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 relative pt-55">
          {(currentEvent || isFlying) && (
            <div ref={eventRef} className="absolute top-0 left-1/2 -translate-x-1/2 size-55 flex items-center justify-center">
              <img
                src={(currentEvent ?? flyingEvent) === 'Sun' ? '/assets/sun.svg' : '/assets/rain.svg'}
                className="size-55"
                style={{
                  transition: isFlying && flyOffset ? 'all 0.6s ease-in' : undefined,
                  transform: isFlying && flyOffset
                    ? `translate(${flyOffset.dx}px, ${flyOffset.dy}px) scale(0.15)`
                    : undefined,
                  opacity: isFlying && flyOffset ? 0 : 1,
                }}
              />
            </div>
          )}

          <Calendar month={gameState?.month ?? 'January'} />
        </div>

        <div className="flex flex-col items-center">
          {gameState?.usernames?.p2 && (
            <p className="text-2xl font-bold text-white/80 mt-6 mb-2 drop-shadow-lg">{gameState.usernames.p2}</p>
          )}
          <div ref={broccoli2Ref} className="broccoli-2 flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale2}) translateY(9px)`, transformOrigin: 'bottom center', transition: 'transform 0.3s ease-out' }}
            />
          </div>
          <p className="text-3xl text-center mt-4 font-line">{gameState?.broccoli_2 ?? 0}</p>
        </div>
      </div>

      {showSetup && <SetupOverlay onClose={() => setShowSetup(false)} />}
    </>
  )
}

export default App
