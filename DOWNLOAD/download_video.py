import requests
from flask import send_file
import os
import yt_dlp
import instaloader
import twitter_scraper as tws
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_video(url, platform):
    try:
        if platform == 'youtube':
            ydl_opts = {
                'format': 'best',
                'outtmpl': 'downloaded_video.%(ext)s',
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=True)
                video_file = ydl.prepare_filename(info_dict)
            return video_file
        elif platform == 'youtube_mp3':
            ydl_opts = {
                'format': 'bestaudio',
                'outtmpl': 'downloaded_audio.%(ext)s',
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=True)
                audio_file = ydl.prepare_filename(info_dict)
            return audio_file
        elif platform == 'instagram_image':
            loader = instaloader.Instaloader()
            loader.download_pic(url, target='downloaded_image.jpg')
            return 'downloaded_image.jpg'
        elif platform == 'instagram_reel':
            loader = instaloader.Instaloader()
            loader.download_reels(url, post_filter=lambda post: post.is_video, target='downloaded_reel.mp4')
            return 'downloaded_reel.mp4'
        elif platform == 'twitter':
            tweet_id = url.split('/')[-1]
            tweet = tws.get_tweet(tweet_id)
            if 'video_url' in tweet:
                video_url = tweet['video_url']
                response = requests.get(video_url)
                with open('downloaded_tweet.mp4', 'wb') as f:
                    f.write(response.content)
                return 'downloaded_tweet.mp4'
            elif 'image_url' in tweet:
                image_url = tweet['image_url']
                response = requests.get(image_url)
                with open('downloaded_tweet.jpg', 'wb') as f:
                    f.write(response.content)
                return 'downloaded_tweet.jpg'
            else:
                return None
        else:
            return None
    except Exception as e:
        logger.error(f"Error downloading video: {e}")
        return None
