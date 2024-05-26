const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const mysql = require('mysql2');
const instaDl = require('insta-dl');
const fbdl = require('fbdl-core');
const Twit = require('twit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

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

// Route to handle video URL submissions
app.post('/api/download', async (req, res) => {
    const { url, platform } = req.body;

    try {
        let fileName;
        switch (platform) {
            case 'youtube':
                // Download video from YouTube
                const downloadedVideo = await ytdl(url, {
                    cwd: './downloads/',
                    dumpSingleJson: true,
                });
                fileName = downloadedVideo._filename;
                break;
            case 'instagram':
                // Download video or image from Instagram
                fileName = await instaDl.download(url, { dest: './downloads/' });
                break;
            case 'facebook':
                // Download video from Facebook
                const fbVideoInfo = await fbdl.getInfo(url);
                const fbVideo = await fbdl.download(fbVideoInfo, './downloads/');
                fileName = fbVideo.output;
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
        const sql = 'INSERT INTO videos (url, title, platform, file_name) VALUES (?, ?, ?, ?)';
        connection.query(sql, [url, fileName, platform], (err, result) => {
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

// Serve static files (if any)
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
