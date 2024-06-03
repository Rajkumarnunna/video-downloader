const ytdl = require('ytdl-core');
const instaDl = require('insta-dl');
const Twit = require('twit');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const downloadsDir = path.join(__dirname, 'downloads');

// Ensure the downloads directory exists
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Initialize Twitter client
const T = new Twit({
    consumer_key: 'YOUR_TWITTER_CONSUMER_KEY',
    consumer_secret: 'YOUR_TWITTER_CONSUMER_SECRET',
    access_token: 'YOUR_TWITTER_ACCESS_TOKEN',
    access_token_secret: 'YOUR_TWITTER_ACCESS_TOKEN_SECRET'
});

async function downloadYouTubeVideo(url) {
    return new Promise((resolve, reject) => {
        const fileName = `${Date.now()}.mp4`;
        const filePath = path.join(downloadsDir, fileName);
        const youtubeStream = ytdl(url, { quality: 'highest' });
        const youtubeFile = fs.createWriteStream(filePath);
        youtubeStream.pipe(youtubeFile);
        youtubeFile.on('finish', () => resolve(fileName));
        youtubeFile.on('error', reject);
    });
}

async function downloadInstagramImage(url) {
    const instaImage = await instaDl.download(url);
    const fileName = `${Date.now()}.jpg`;
    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, instaImage);
    return fileName;
}

async function downloadInstagramReel(url) {
    const instaReel = await instaDl.downloadReel(url);
    const fileName = `${Date.now()}.mp4`;
    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, instaReel);
    return fileName;
}

async function downloadTwitterMedia(url) {
    const tweetId = url.split('/').pop();
    const tweet = await T.get('statuses/show/:id', { id: tweetId, tweet_mode: 'extended' });
    const media = tweet.data.extended_entities.media[0];
    const mediaUrl = media.video_info ? media.video_info.variants[0].url : media.media_url_https;
    const response = await fetch(mediaUrl);
    const buffer = await response.buffer();
    const fileName = `${tweetId}.${mediaUrl.split('.').pop()}`;
    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return fileName;
}

module.exports = {
    downloadYouTubeVideo,
    downloadInstagramImage,
    downloadInstagramReel,
    downloadTwitterMedia
};
