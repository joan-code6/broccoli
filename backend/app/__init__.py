import random
import threading
import time
from .serial_read import SerialReader

from flask import Flask

app = Flask(__name__)

# setup serial
serial = SerialReader()

game_state = {
    "tick": 0,
    "month": "January",
    "inputs": [],
    "broccoli_1": 0,
    "broccoli_2": 0,
    "last_event_complete": 0,
    "event": None
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
    while game_state["month"] != "December":
        time.sleep(0.1)
        game_state["tick"] += 1
        game_state["month"] = months[game_state["tick"] // 50]

        if game_state["tick"] % 5 == 0:
            game_state["broccoli_1"] += 1
            game_state["broccoli_2"] += 1

        attempt_spawn_event()

        try:
            scanned_tag = serial.read_line()
            if scanned_tag is not None:
                print("Scanned tag:", scanned_tag)
                game_state["inputs"].append(scanned_tag)
        except:
            print("Error encountered during scanning")

        for input_key in game_state["inputs"]:
            if game_state["event"] == "Sun":
                if input_key == "1" or input_key == "TAG1":
                    game_state["event"] = None
                    game_state["broccoli_1"] += 5
                elif input_key == "3" or input_key == "TAG3":
                    game_state["event"] = None
                    game_state["broccoli_2"] += 5
            elif game_state["event"] == "Rain":
                if input_key == "2" or input_key == "TAG2":
                    game_state["event"] = None
                    game_state["broccoli_1"] += 5
                elif input_key == "4" or input_key == "TAG4":
                    game_state["event"] = None
                    game_state["broccoli_2"] += 5

        game_state["inputs"] = []

    print("Game complete")
    game_state["event"] = None


threading.Thread(target=game_loop, daemon=True).start()

from app import routes
