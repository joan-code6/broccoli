from flask import request, jsonify
from app import app, game_state, TAG_MAP, VALID_TAG_UIDS, reset_game, serial

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
    tag_assignments = {}
    for role in ("TAG1", "TAG2", "TAG3", "TAG4"):
        assigned_uid = None
        for uid, r in TAG_MAP.items():
            if r == role:
                assigned_uid = uid
                break
        tag_assignments[role] = assigned_uid

    data = dict(game_state)
    data["tag_assignments"] = tag_assignments
    return jsonify(data)


@app.route('/start', methods=['POST'])
def start():
    if len(TAG_MAP) < 4:
        return jsonify({"status": "error", "message": "All 4 tags must be assigned before starting"}), 400
    reset_game()
    return jsonify({"status": "success"})


@app.route('/assign_tag', methods=['POST'])
def assign_tag():
    data = request.get_json()
    role = data.get("role")
    uid = str(data.get("uid", ""))

    valid_roles = ("TAG1", "TAG2", "TAG3", "TAG4")
    if role not in valid_roles:
        return jsonify({"status": "error", "message": f"Invalid role. Must be one of {valid_roles}"}), 400

    if uid not in VALID_TAG_UIDS:
        return jsonify({"status": "error", "message": "Tag UID not in allowed list"}), 400

    existing_role_for_uid = TAG_MAP.get(uid)
    if existing_role_for_uid and existing_role_for_uid != role:
        return jsonify({"status": "error", "message": f"This tag is already assigned to {existing_role_for_uid}"}), 400

    for u, r in list(TAG_MAP.items()):
        if r == role and u != uid:
            del TAG_MAP[u]
            break

    TAG_MAP[uid] = role
    print(f"Assigned tag {uid} -> {role}. TAG_MAP: {TAG_MAP}")
    return jsonify({"status": "success", "tag_assignments": {r: None for r in valid_roles}})


@app.route('/debug/serial')
def debug_serial():
    return jsonify({
        "serial_connected": serial.ser is not None,
        "serial_port": str(serial.ser.port) if serial.ser else None,
        "last_scanned_tag": game_state.get("last_scanned_tag"),
        "tag_map": dict(TAG_MAP),
    })


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
