import requests
from flask import request, send_file, abort
import os
import yt_dlp
import instaloader
import facebook_dl
import twitter_scraper as tws

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
            # Use yt_dlp with audio-only format
            ydl_opts = {
                'format': 'bestaudio',
                'outtmpl': 'downloaded_audio.%(ext)s',
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=True)
                audio_file = ydl.prepare_filename(info_dict)
            return audio_file
        elif platform == 'instagram_image':
            # Use instaloader to download Instagram images
            loader = instaloader.Instaloader()
            loader.download_pic(url, target='.')
            return 'downloaded_image.jpg'  # Assuming the filename is fixed
        elif platform == 'instagram_reel':
            # Use instaloader to download Instagram reels
            loader = instaloader.Instaloader()
            loader.download_reels(url, post_filter=lambda post: post.is_video, target='.')
            return 'downloaded_reel.mp4'  # Assuming the filename is fixed
        elif platform == 'facebook':
            # Use facebook_dl to download Facebook videos
            fbdl = facebook_dl.Facebook()
            video = fbdl.get(url)
            return video['title'] + '.mp4'  # Assuming you want to use video title as filename
        elif platform == 'twitter':
            # Use twitter_scraper to download Twitter content
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
        print(f"Error downloading video: {e}")
        return None
