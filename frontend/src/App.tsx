import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { computeScale } from './broccoli-growth'

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
}

function Calendar({ month }: { month: string }) {
  const monthIndex = FULL_MONTHS.indexOf(month)
  const current = monthIndex >= 0 ? MONTHS[monthIndex] : month
  const next = monthIndex >= 0 ? MONTHS[(monthIndex + 1) % MONTHS.length] : month

  const prevMonthRef = useRef(month)
  const [folding, setFolding] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(current)

  useEffect(() => {
    if (prevMonthRef.current !== month) {
      setFolding(true)
      const timer = setTimeout(() => {
        setDisplayMonth(current)
        setFolding(false)
      }, 600)
      prevMonthRef.current = month
      return () => clearTimeout(timer)
    } else {
      setDisplayMonth(current)
    }
  }, [month, current])

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative"
        style={{ perspective: '800px' }}
      >
        <div className="absolute inset-0">
          <div className="relative size-55">
            <img src="/assets/calendar.svg" className="size-55" />
            <span className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold scale-200">
              {next}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className={`relative size-55 ${folding ? 'animate-calendar-fold' : ''}`}>
            <img src="/assets/calendar.svg" className="size-55" />
            <span className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-white font-bold scale-200">
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

      {phase === 'over' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold">
              {winner === 1 && 'Player 1 Wins!'}
              {winner === 2 && 'Player 2 Wins!'}
              {winner === 0 && "It's a Tie!"}
            </h2>
            <div className="flex gap-4 text-lg">
              <span>Player 1: {gameState?.broccoli_1 ?? 0}</span>
              <span>|</span>
              <span>Player 2: {gameState?.broccoli_2 ?? 0}</span>
            </div>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl transition-colors cursor-pointer"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {phase === 'waiting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold">Broccoli</h2>
            <button
              onClick={handleStart}
              disabled={!allTagsAssigned}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xl font-bold rounded-xl transition-colors cursor-pointer"
            >
              Start Game
            </button>
            <Link
              to="/setup"
              className="text-lg text-blue-600 hover:underline"
            >
              Setup Tags
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 min-h-[100svh]">
        <div className="flex flex-col items-center">
          <div ref={broccoli1Ref} className="broccoli-1 flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale1}) translateY(9px)`, transformOrigin: 'bottom center', transition: 'transform 0.3s ease-out' }}
            />
          </div>
          <p className="text-3xl text-center mt-4">{gameState?.broccoli_1 ?? 0}</p>
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
          <div ref={broccoli2Ref} className="broccoli-2 flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale2}) translateY(9px)`, transformOrigin: 'bottom center', transition: 'transform 0.3s ease-out' }}
            />
          </div>
          <p className="text-3xl text-center mt-4">{gameState?.broccoli_2 ?? 0}</p>
        </div>
      </div>
    </>
  )
}

export default App
