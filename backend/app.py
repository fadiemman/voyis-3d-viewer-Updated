"""
app.py
------
A simple Flask backend for handling file uploads and processing point cloud data.
"""

from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Define a folder to store uploaded files
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return "Voyis 3D Viewer Backend is running."

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Endpoint to handle file uploads.
    Expects a file with the key 'file' in the request.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    # Save the file
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    # Here you could process the .pcd file (or .xyz, etc.) and extract data.
    return jsonify({'message': 'File uploaded successfully', 'file_path': file_path}), 200

if __name__ == '__main__':
    app.run(debug=True)
