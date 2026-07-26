# broccoli

A virtual broccoli pet multiplayer competitive game!

> [!IMPORTANT]
> You need a NFC reader and 4 NFC chips to play this game. <br>
> You can try the game out by coming to the bus.


## Setup


### Prerequisites:

- Python3
- npm

### Installation

1. `git clone https://github.com/joan-code6/broccoli`
2. `cd broccoli`
3. `sh run.sh`
4. Have fun!

## Tech Architecture
- MicroPython running on a Pico which communicates to the software by serial
- Frontend displaying the 2 broccolis too
- Python Flask backend handling the game loop and serial reading
- Flutter based mobile app

## Folder Structure
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
- serial communication receiving on the backend side
- animations
- the entire setup page
