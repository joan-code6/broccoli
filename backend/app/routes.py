from app import app

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
    return

@app.route('/interact', methods=['POST'])
def interact():
    pass