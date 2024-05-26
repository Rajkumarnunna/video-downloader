from flask import request, send_file, abort
import logging
from flask import Flask, render_template

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')

from download_video import download_video

@app.route("/")
@app.route("/download", methods=["GET", "POST"])
def download_route():
    if request.method == "POST":
        video_url = request.form["video_url"]
        video_path = download_video(video_url)
        if video_path:
            return send_file(video_path, as_attachment=True)
        else:
            return abort(404, description="Video could not be downloaded.")
    return render_template("video_downloader.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)