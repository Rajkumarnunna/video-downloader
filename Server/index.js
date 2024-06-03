const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const mysql = require('mysql2');
const instaDl = require('insta-dl');
const fbdl = require('fbdl-core');
const Twit = require('twit');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name'
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Initialize Twitter client
const T = new Twit({
    consumer_key: 'YOUR_TWITTER_CONSUMER_KEY',
    consumer_secret: 'YOUR_TWITTER_CONSUMER_SECRET',
    access_token: 'YOUR_TWITTER_ACCESS_TOKEN',
    access_token_secret: 'YOUR_TWITTER_ACCESS_TOKEN_SECRET'
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle video URL submissions
app.post('/download', async (req, res) => {
    const { url, platform } = req.body;

    try {
        let fileName;
        switch (platform) {
            case 'youtube':
                // Download video from YouTube
                const youtubeStream = ytdl(url, { quality: 'highest' });
                fileName = `./downloads/${Date.now()}.mp4`;
                const youtubeFile = fs.createWriteStream(fileName);
                youtubeStream.pipe(youtubeFile);
                await new Promise((resolve, reject) => {
                    youtubeFile.on('finish', resolve);
                    youtubeFile.on('error', reject);
                });
                break;
            case 'instagram_image':
                // Download image from Instagram
                const instaImage = await instaDl.download(url);
                fileName = `./downloads/${Date.now()}.jpg`;
                fs.writeFileSync(fileName, instaImage);
                break;
            case 'instagram_reel':
                // Download reel from Instagram
                const instaReel = await instaDl.downloadReel(url);
                fileName = `./downloads/${Date.now()}.mp4`;
                fs.writeFileSync(fileName, instaReel);
                break;
            case 'twitter':
                // Download video or image from Twitter
                const tweetId = url.split('/').pop();
                const tweet = await T.get('statuses/show/:id', { id: tweetId, tweet_mode: 'extended' });
                const media = tweet.data.extended_entities.media[0];
                const mediaUrl = media.video_info ? media.video_info.variants[0].url : media.media_url_https;
                const response = await fetch(mediaUrl);
                const buffer = await response.buffer();
                fileName = `./downloads/${tweetId}.${mediaUrl.split('.').pop()}`;
                fs.writeFileSync(fileName, buffer);
                break;
            default:
                return res.status(400).json({ error: 'Invalid platform' });
        }

        // Insert metadata into MySQL database
        const sql = 'INSERT INTO videos (url, platform, file_name) VALUES (?, ?, ?)';
        connection.query(sql, [url, platform, fileName], (err, result) => {
            if (err) {
                console.error('Error inserting video metadata:', err);
                res.status(500).json({ error: 'Failed to save video metadata' });
            } else {
                console.log('Video metadata saved:', result);
                res.json({ success: true, file_name: fileName });
            }
        });
    } catch (error) {
        console.error('Error downloading or saving the video:', error);
        res.status(500).json({ error: 'Failed to download or save video' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
