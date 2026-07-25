import { useState, useCallback } from 'react'

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
        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/broccoli.svg" className="size-75" />
          <p className="text-3xl text-center">234</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/sun.svg" className="size-55" />
          <Calendar />
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/broccoli.svg" className="size-75" />
          <p className="text-3xl text-center">234</p>
        </div>
      </div>
    </>
  )
}

export default App
