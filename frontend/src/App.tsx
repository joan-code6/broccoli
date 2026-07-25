import { useState, useCallback } from 'react'
import { computeScale } from './broccoli-growth'

const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']

function Calendar() {
  const [displayedMonth, setDisplayedMonth] = useState(0)
  const [nextMonth, setNextMonth] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToNextMonth = useCallback(() => {
    if (isAnimating) return
    const next = (displayedMonth + 1) % 12
    setIsAnimating(true)
    setNextMonth(next)
    setTimeout(() => {
      setDisplayedMonth(next)
      setNextMonth((next + 1) % 12)
      setIsAnimating(false)
    }, 600)
  }, [isAnimating, displayedMonth])

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
              {MONTHS[nextMonth]}
            </span>
          </div>
        </div>

        <div
          className={`relative ${isAnimating ? 'animate-calendar-fold' : ''}`}
          style={{ transformOrigin: 'top center', backfaceVisibility: 'hidden' }}
        >
          <div className="relative size-55">
            <img src="/assets/calendar.svg" className="size-55" />
            <span className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold scale-200">
              {MONTHS[displayedMonth]}
            </span>
          </div>
        </div>
      </div>

      <p className="text-3xl text-center">Event Name</p>

      <button
        onClick={goToNextMonth}
        className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300 active:bg-gray-400"
      >
        Next Month
      </button>
    </div>
  )
}

function App() {
  const [score1, setScore1] = useState(30)
  const [score2, setScore2] = useState(60)

  const scale1 = computeScale(score1)
  const scale2 = computeScale(score2)

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

      <div className="grid grid-cols-3 min-h-[100svh]">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale1}) translateY(9px)`, transformOrigin: 'bottom center' }}
            />
          </div>
          <p className="text-3xl text-center mt-4">{score1}</p>
          <input
            type="range"
            min="0"
            max="100"
            value={score1}
            onChange={e => setScore1(Number(e.target.value))}
            className="mt-2 w-48"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/sun.svg" className="size-55" />
          <Calendar />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale2}) translateY(9px)`, transformOrigin: 'bottom center' }}
            />
          </div>
          <p className="text-3xl text-center mt-4">{score2}</p>
          <input
            type="range"
            min="0"
            max="100"
            value={score2}
            onChange={e => setScore2(Number(e.target.value))}
            className="mt-2 w-48"
          />
        </div>
      </div>
    </>
  )
}

export default App
