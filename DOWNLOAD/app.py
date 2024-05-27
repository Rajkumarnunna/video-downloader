from flask import Flask, request, send_file, abort, render_template, jsonify
import logging
from download_video import download_video

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')

@app.route("/", methods=["GET", "POST"])
@app.route("/download", methods=["GET", "POST"])
def download_route():
    if request.method == "POST":
        video_url = request.form.get("video_url")
        if not video_url:
            logger.error("No video URL provided")
            return jsonify(error="No video URL provided"), 400

        logger.info(f"Downloading video from URL: {video_url}")
        try:
            video_path = download_video(video_url)
            if video_path:
                logger.info(f"Video downloaded successfully: {video_path}")
                return send_file(video_path, as_attachment=True)
            else:
                logger.error("Video could not be downloaded.")
                return jsonify(error="Video could not be downloaded"), 500
        except Exception as e:
            logger.error(f"Error downloading video: {e}")
            return jsonify(error=str(e)), 500

    return render_template("video_downloader.html")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
