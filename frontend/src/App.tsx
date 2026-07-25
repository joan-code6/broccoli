import { computeScale } from './broccoli-growth'

const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']

function Calendar() {
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
              {MONTHS[1]}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative size-55">
            <img src="/assets/calendar.svg" className="size-55" />
            <span className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-white font-bold scale-200">
              {MONTHS[0]}
            </span>
          </div>
        </div>
      </div>

      <p className="text-3xl text-center">Event Name</p>
    </div>
  )
}

function App() {
  const currentEvent = null as 'Sun' | 'Rain' | null
  const isFlying = false
  const flyOffset = null as {dx: number; dy: number} | null

  const scale1 = computeScale(60)
  const scale2 = computeScale(60)

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
          <div className="broccoli-1 flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale1}) translateY(9px)`, transformOrigin: 'bottom center' }}
            />
          </div>
          <p className="text-3xl text-center mt-4">60</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 relative pt-55">
          {currentEvent && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 size-55 flex items-center justify-center">
              <img
                src={currentEvent === 'Sun' ? '/assets/sun.svg' : '/assets/rain.svg'}
                className="size-55"
                style={{
                  transition: isFlying ? 'all 0.6s ease-in' : undefined,
                  transform: isFlying && flyOffset
                    ? `translate(${flyOffset.dx}px, ${flyOffset.dy}px) scale(0.15)`
                    : undefined,
                  opacity: isFlying ? 0 : 1,
                }}
              />
            </div>
          )}

          <Calendar />
        </div>

        <div className="flex flex-col items-center">
          <div className="broccoli-2 flex flex-col items-center justify-end h-[70svh]">
            <img
              src="/assets/broccoli.svg"
              className="size-75 object-contain object-bottom"
              style={{ transform: `scale(${scale2}) translateY(9px)`, transformOrigin: 'bottom center' }}
            />
          </div>
          <p className="text-3xl text-center mt-4">60</p>
        </div>
      </div>
    </>
  )
}

export default App
