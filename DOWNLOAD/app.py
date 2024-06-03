from flask import Flask, render_template, request, send_file
import os
from download_video import download_video

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download():
    url = request.form.get('url')
    platform = request.form.get('platform')
    if url and platform:
        file_path = download_video(url, platform)
        if file_path:
            return send_file(file_path, as_attachment=True)
        else:
            return "Failed to download video", 500
    return "Invalid input", 400

if __name__ == '__main__':
    app.run(debug=True)
