# YouTube Video Uploader for LCN Heatmap Overlays

This guide explains how to upload heatmap overlay videos to YouTube for use with the LCN Heatmap Overlay Viewer.

## Prerequisites

Before you begin, make sure you have:

1. Python 3.6 or later installed
2. Required Python packages installed
3. A Google account with access to YouTube
4. OAuth 2.0 credentials for the YouTube API

## Setting Up OAuth 2.0 Credentials

The necessary OAuth credentials are already included in the `credentials/youtube` directory. However, if you need to create your own:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the YouTube Data API v3
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" and select "OAuth client ID"
   - Choose "Desktop app" as the application type
   - Name your client and click "Create"
5. Download the credentials JSON file
6. Rename it to match the format `client_secret_[YOUR-CLIENT-ID].apps.googleusercontent.com.json` and place it in the `credentials/youtube` directory

## Installing Dependencies

Install the required Python packages with pip:

```
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

## Configuring the Upload Script

The `youtube_uploader.py` script is pre-configured to:

1. Look for WebM files in the `public/overlays` directory
2. Upload them as unlisted videos to YouTube
3. Update the `public/videos.json` file with YouTube URLs for each overlay

If you need to modify the configuration:

1. Open `youtube_uploader.py` in a text editor
2. Update the `VIDEO_DIRECTORY` constant to point to your overlay video directory
3. Adjust the video title, description, and tags as needed

## Running the Script

1. Open a command prompt or PowerShell window
2. Navigate to the project directory
3. Run the script:

```
python youtube_uploader.py
```

4. The first time you run the script, a browser window will open asking you to authorize the application
   - Make sure to sign in with the email specified in the script (mischagushiken@gmail.com)
5. After authorization, the script will find all WebM files and prompt you to confirm the upload
6. Once you confirm, it will begin uploading videos

## After Uploading

Once all videos are uploaded:

1. The script will update `public/videos.json` with YouTube URLs for each overlay
2. It will also save detailed upload information to `public/youtube-uploads.json`
3. The videos will be set as "unlisted" on YouTube, meaning they're only accessible via direct link

## Troubleshooting

- If you encounter authorization errors, delete the `credentials/youtube/token.pickle` file and run the script again
- If uploads fail, check your internet connection and try again
- For quota limit errors, wait an hour before trying again (YouTube API has daily limits) 