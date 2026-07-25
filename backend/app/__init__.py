import random
import threading
import time

from flask import Flask

app = Flask(__name__)

game_state = {
    "tick": 0,
    "month": "January",
    "inputs": [],
    "broccolis": [
        {
            "points": 100,
        },
        {
            "points": 100,
        },
    ],
    "last_event_complete": 0,
    "event": None
}

game_state_changed = {
    "changed": True,
}

months = ["January","February","March","April","May","June","July","August","September","October","November","December"]


def attempt_spawn_event():
    if game_state["event"] is not None:
        return
    if game_state["tick"] % 4 != 0:
        return
    if game_state["tick"] > game_state["last_event_complete"] + 10:
        return

    game_state["event"] = random.choice(["Sun", "Rain"])

def game_loop():
    while True:
        time.sleep(0.1)
        game_state["tick"] += 1
        game_state["month"] = months[game_state["tick"] // 50]
        if game_state["month"] == "December":
            print("game end")
            return

        for broccoli in game_state["broccolis"]:
            broccoli["points"] += 1

        attempt_spawn_event()

        for input_key in game_state["inputs"]:
            if game_state["event"] == "Sun":
                if input_key == "1":
                    game_state["event"] = None
                    game_state["broccolis"][0]["points"] += 100
                elif input_key == "3":
                    game_state["event"] = None
                    game_state["broccolis"][1]["points"] += 100
            elif game_state["event"] == "Rain":
                if input_key == "2":
                    game_state["event"] = None
                    game_state["broccolis"][0]["points"] += 100
                elif input_key == "4":
                    game_state["event"] = None
                    game_state["broccolis"][1]["points"] += 100

        game_state["inputs"] = []


threading.Thread(target=game_loop, daemon=True).start()

from app import routes
