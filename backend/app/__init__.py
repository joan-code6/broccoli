import threading, time
from flask import Flask

app = Flask(__name__)

game_state = {
    "tick": 0,
}

def game_loop():
    while True:
        time.sleep(0.1)
        game_state["tick"] += 1

threading.Thread(target=game_loop, daemon=True).start()

from app import routes
