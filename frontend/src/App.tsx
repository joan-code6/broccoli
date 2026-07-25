import { useState } from 'react'
import './App.css'

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

      <div className="grid grid-cols-3">

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/broccoli.svg" className='size-75'></img>

          <p className="text-3xl text-center">234</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/sun.svg" className='size-55'></img>

          <img src="/assets/calendar.svg" className='size-55'></img>

          <p className="text-3xl text-center">Event Name</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/broccoli.svg" className='size-75'></img>

          <p className="text-3xl text-center">234</p>
        </div>

      </div>

    </>
  )
}

export default App
