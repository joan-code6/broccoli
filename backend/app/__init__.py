import threading
import time

from flask import Flask

app = Flask(__name__)

game_state = {
    "tick": 0,
    "inputs": [],
    "broccolis": [
        {
            "health": 100,
            "growth": 0,
        },
        {
            "health": 100,
            "growth": 0,
        },
    ],
}

game_state_changed = {
    "changed": True,
}


def game_loop():
    while True:
        time.sleep(0.1)
        game_state["tick"] += 1

        for broccoli in game_state["broccolis"]:
            broccoli["growth"] += 1


threading.Thread(target=game_loop, daemon=True).start()

from app import routes
