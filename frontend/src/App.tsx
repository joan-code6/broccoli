import { useState } from 'react'
import './App.css'

function App() {
  return (
    <>

      <h1 className="text-3xl text-center">Event Name</h1>

      <div className="grid grid-cols-3">

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/broccoli.svg" className='size-75'></img>

          <p className="text-3xl text-center">234</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/assets/sun.svg" className='size-55'></img>

          <img src="/assets/calendar.svg" className='size-55'></img>
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
