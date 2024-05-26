import requests
from flask import request, send_file, abort
import os
import yt_dlp

def download_video(url):
    try:
        ydl_opts = {
            'format': 'best',
            'outtmpl': 'downloaded_video.%(ext)s',
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            video_file = ydl.prepare_filename(info_dict)
        return video_file
    except Exception as e:
        print(f"Error downloading video: {e}")
        return None