"""
SAVOR Food Platform - Flask Server
Serves the Food Ordering System and UML Class Details.
Run with: python app.py
"""

import os
from flask import Flask, send_from_directory, abort

app = Flask(__name__, static_folder='static', static_url_path='/static')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def home():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/uml')
def uml_page():
    return send_from_directory(BASE_DIR, 'uml.html')

@app.route('/<path:filename>')
def serve_root_file(filename):
    file_path = os.path.join(BASE_DIR, filename)
    if os.path.isfile(file_path):
        return send_from_directory(BASE_DIR, filename)
    static_file_path = os.path.join(BASE_DIR, 'static', filename)
    if os.path.isfile(static_file_path):
        return send_from_directory(os.path.join(BASE_DIR, 'static'), filename)
    abort(404)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Flask website running at: http://localhost:{port}/")
    print(f"View UML Details at:      http://localhost:{port}/uml")
    app.run(host='0.0.0.0', port=port, debug=True)
