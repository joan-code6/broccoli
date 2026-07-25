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
    "event": None,
    "phase": "waiting",
    "winner": None,
    "last_scanned_tag": None,
    "usernames": []
}

TAG_MAP = {}
inputs_lock = threading.Lock()

TAG_CONFIG = {
    "003": "2600381038", "038": "2600381038", "103": "2600381038",
    "381": "2600381038", "600": "2600381038", "810": "2600381038",
    "014": "2601429390", "142": "2601429390", "293": "2601429390",
    "390": "2601429390", "429": "2601429390", "601": "2601429390",
    "939": "2601429390",
    "040": "1964104076", "076": "1964104076", "104": "1964104076",
    "196": "1964104076", "407": "1964104076", "410": "1964104076",
    "641": "1964104076", "964": "1964104076",
    "285": "3285396700", "328": "3285396700", "396": "3285396700",
    "539": "3285396700", "670": "3285396700", "700": "3285396700",
    "853": "3285396700", "967": "3285396700",
}
VALID_TAG_UIDS = list(set(TAG_CONFIG.values()))

def find_tag_uid(scanned):
    for i in range(len(scanned) - 2):
        sub = scanned[i:i+3]
        if sub == "260":
            if i + 3 < len(scanned):
                return "2601429390" if scanned[i + 3] == "1" else "2600381038"
            return "2600381038"
        if sub in TAG_CONFIG:
            return TAG_CONFIG[sub]
    return None

months = ["January","February","March","April","May","June","July","August","September","October","November","December"]

def reset_game():
    game_state["tick"] = 0
    game_state["month"] = "January"
    with inputs_lock:
        game_state["inputs"] = []
    game_state["broccoli_1"] = 0
    game_state["broccoli_2"] = 0
    game_state["last_event_complete"] = 0
    game_state["event"] = None
    game_state["phase"] = "playing"
    game_state["winner"] = None
    game_state["last_scanned_tag"] = None

def attempt_spawn_event():
    if game_state["event"] is not None:
        return
    if game_state["tick"] % 4 != 0:
        return
    if game_state["tick"] < game_state["last_event_complete"] + 10:
        return

    game_state["event"] = random.choice(["Sun", "Rain"])

def game_loop():
    last_tag = None
    last_tag_tick = 0

    while True:
        time.sleep(0.1)

        scanned_tag = serial.read_line()
        if scanned_tag:
            game_state["last_scanned_tag"] = scanned_tag
            print(f"[game] last_scanned_tag updated: {scanned_tag!r}")

        if game_state["phase"] != "playing":
            continue

        game_state["tick"] += 1
        game_state["month"] = months[min(game_state["tick"] // 50, 11)]

        if game_state["tick"] % 5 == 0:
            game_state["broccoli_1"] += 1
            game_state["broccoli_2"] += 1

        attempt_spawn_event()

        if scanned_tag and scanned_tag.strip():
            if scanned_tag == last_tag and game_state["tick"] - last_tag_tick < 3:
                pass
            else:
                print("Scanned tag:", scanned_tag)
                with inputs_lock:
                    game_state["inputs"].append(scanned_tag)
                last_tag = scanned_tag
                last_tag_tick = game_state["tick"]

        with inputs_lock:
            current_inputs = list(game_state["inputs"])
            game_state["inputs"] = []

        for input_key in current_inputs:
            if input_key in TAG_MAP:
                input_key = TAG_MAP[input_key]
            else:
                matched_uid = find_tag_uid(input_key)
                if matched_uid and matched_uid in TAG_MAP:
                    input_key = TAG_MAP[matched_uid]
                elif input_key not in ("1", "2", "3", "4", "TAG1", "TAG2", "TAG3", "TAG4"):
                    print(f"Unknown tag: {input_key} — add it to TAG_MAP in __init__.py")
                    continue

            if game_state["event"] == "Sun":
                if input_key == "1" or input_key == "TAG1":
                    game_state["event"] = None
                    game_state["broccoli_1"] += 5
                    game_state["last_event_complete"] = game_state["tick"]
                elif input_key == "3" or input_key == "TAG3":
                    game_state["event"] = None
                    game_state["broccoli_2"] += 5
                    game_state["last_event_complete"] = game_state["tick"]
            elif game_state["event"] == "Rain":
                if input_key == "2" or input_key == "TAG2":
                    game_state["event"] = None
                    game_state["broccoli_1"] += 5
                    game_state["last_event_complete"] = game_state["tick"]
                elif input_key == "4" or input_key == "TAG4":
                    game_state["event"] = None
                    game_state["broccoli_2"] += 5
                    game_state["last_event_complete"] = game_state["tick"]

        if game_state["month"] == "December":
            game_state["event"] = None
            if game_state["broccoli_1"] > game_state["broccoli_2"]:
                game_state["winner"] = 1
            elif game_state["broccoli_2"] > game_state["broccoli_1"]:
                game_state["winner"] = 2
            else:
                game_state["winner"] = 0
            game_state["phase"] = "over"
            print("Game complete — Winner:", game_state["winner"])


threading.Thread(target=game_loop, daemon=True).start()

from app import routes
