# backend

This folder contains the backend, written in Python Flask.s

## Installation instructions
1. Install `uv`
2. `uv sync`
3. `uv run main.py`

GET 127.0.0.1:5000/state
get JSON representation you can render
{
    "tick": 0,
    "month": "January",
    "inputs": [],
    "broccoli_1": 0,
    "broccoli_2": 0,
    "last_event_complete": 0,
    "event": None
}

POST 127.0.0.1:5000/interact
{"key":"1"}
do a POST whenever a key is pressed in the browser.
currently the program only cares about 1 2 3 and 4