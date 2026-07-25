# broccoli

A broccoli virtual pet multiplayer competitive game!

## tech architecture
- MicroPython running on a Pico which communicates to the software by serial
- Frontend displaying the 2 broccolis too
- Python Flask backend handling the game loop and serial reading
- Flutter based mobile app

## folder structure
- `/app` contains the mobile app
- `/backend` contains the Flask backend
- `/frontend` contains the React + Vite frontend
- `/hardware` contains the MicroPython code for the Pico

### AI usage declaration
AI helped with:
- setting up Tailwind CSS
- showing us how to setup a column layout
- adding scrolling clouds
- centering a div
- part of the calendar animation
- parts of the broccoli growing scaling algorithm
