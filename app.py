import requests
from flask import Flask, request, send_file, abort, render_template
from gunicorn.app.base import BaseApplication
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')

def download_video(url):
    try:
        r = requests.get(url, stream=True)
        if r.status_code == 200:
            with open("video.mp4", "wb") as f:
                for chunk in r.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
            return "video.mp4"
        else:
            return None
    except Exception as e:
        logger.error(f"Error downloading video: {e}")
        return None

@app.route("/")
@app.route("/download", methods=["GET", "POST"])
def download_route():
    if request.method == "POST":
        video_url = request.form.get("video_url")
        video_path = download_video(video_url)
        if video_path:
            return send_file(video_path, as_attachment=True)
        else:
            return abort(404, description="Video could not be downloaded.")
    return render_template("video_downloader.html")

class StandaloneApplication(BaseApplication):
    def __init__(self, app, options=None):
        self.application = app
        self.options = options or {}
        super().__init__()

    def load_config(self):
        # Apply configuration to Gunicorn
        for key, value in self.options.items():
            if key in self.cfg.settings and value is not None:
                self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

if __name__ == "__main__":
    options = {
        "bind": "0.0.0.0:8080",
        "workers": 4,
        "loglevel": "info",
        "accesslog": "-"
    }
    StandaloneApplication(app, options).run()
