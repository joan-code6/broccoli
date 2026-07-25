from flask import request, jsonify
from app import app, game_state, game_state_changed

@app.route('/')
def index():
    return '''
<html>
    <head>
        <title>API Page</title>
    </head>
    <body>
        <h1>API Loaded</h1>
    </body>
</html>'''

@app.route('/state')
def state():
    return game_state,


# curl -H "Content-Type: application/json" --request POST -d '{"key":"1"}' http://localhost:5000/interact
@app.route('/interact', methods=['POST'])
def interact():
    data = request.get_json()
    print(data)

    if "input" in data:
        print(data["input"], "pressed")
        game_state["inputs"].append(data["input"])
    else:
        print("no input provided")

    return jsonify({"status": "success","received": data})
