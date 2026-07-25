import { useState } from 'react'
import './App.css'

function App() {
  return (
    <>

      <h1 className="text-3xl text-center">Event Name</h1>

      <div className="grid grid-cols-2">

        <div className="flex justify-center">
          <div className="h-48 w-6 bg-gray-300 rounded-full flex flex-col justify-end overflow-hidden">
            <div className="bg-green-600 w-full" style={{ height: '50%' }}></div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="h-48 w-6 bg-gray-300 rounded-full flex flex-col justify-end overflow-hidden">
            <div className="bg-green-600 w-full" style={{ height: '50%' }}></div>
          </div>
        </div>

      </div>

    </>
  )
}

export default App
