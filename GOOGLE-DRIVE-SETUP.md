# Setting Up Google Drive for LCN Heatmap Overlays

This guide will help you set up and use Google Drive integration with the LCN Heatmap Overlay Viewer.

## Prerequisites

1. You need a Google account with access to the videos you want to display
2. Node.js installed on your computer
3. Google API credentials (provided in the `credentials` folder)

## Google Drive Setup

### Step 1: Setting Up Google API Credentials

1. The necessary OAuth credentials are already included in the `credentials` directory as:
   ```
   credentials/client_secret.json
   ```

   If you need to create your own:
   a. Go to the [Google Cloud Console](https://console.cloud.google.com/)
   b. Create a new project (or select an existing one)
   c. Enable the Google Drive API
   d. Create OAuth 2.0 credentials:
      - Go to "Credentials" in the left sidebar
      - Click "Create Credentials" and select "OAuth client ID"
      - Choose "Web application" as the application type
      - Set the authorized redirect URI to "http://localhost:3000"
      - Name your client and click "Create"
   e. Download the credentials JSON file
   f. Save it to the path shown above

2. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   REACT_APP_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
   REACT_APP_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
   ```

## Finding Your Google Drive Folder ID

1. Run the folder listing script:
   ```
   node scripts/list-drive-folders.js
   ```

2. The first time you run this, you'll need to authorize the application:
   - The script will provide a URL to visit in your browser
   - Sign in with your Google account and grant the requested permissions
   - Copy the authorization code shown in the browser
   - Paste the code back into the terminal when prompted

3. The script will list all accessible shared drives and folders, showing their IDs:
   ```
   ID                                     | NAME
   -------------------------------------------------
   1f6NcN1hPg5t0YtgezKH8RpZj0Z2URLot     | Lab Videos
   ```

4. Note the ID of the folder containing your videos (e.g., `1f6NcN1hPg5t0YtgezKH8RpZj0Z2URLot`)

## Fetching Videos from Google Drive

1. Run the Google Drive fetcher script with your folder ID:
   ```
   node scripts/google-drive-fetcher.js YOUR_FOLDER_ID
   ```
   Replace `YOUR_FOLDER_ID` with the ID you found in the previous step.

2. The script will:
   - Find all video files in the specified folder
   - Create a JSON file with the video information
   - Save it to both `src/data/video-library.json` and `public/data/video-library.json`

3. You should see output confirming the videos found and saved.

## Using Google Drive Videos in the Application

To use the fetched videos in your application:

1. Import the video library in your component:
   ```javascript
   import videoLibrary from '../data/video-library.json';
   ```

2. To display a video from Google Drive, use the `embedUrl` property:
   ```javascript
   <video src={videoItem.directStreamUrl} controls />
   ```

   Or use the embed URL for iframe embedding:
   ```javascript
   <iframe src={videoItem.embedUrl} width="640" height="360" frameborder="0" allowfullscreen></iframe>
   ```

3. You can also create overlay mappings in your `videos.json` configuration file:
   ```json
   {
     "id": "event1",
     "title": "Event 1",
     "driveFileId": "FILE_ID_FROM_DRIVE",
     "overlays": [
       {
         "id": "overlay1",
         "title": "7-month Group",
         "driveFileId": "OVERLAY_FILE_ID_FROM_DRIVE",
         "ageGroup": "seven"
       }
     ]
   }
   ```

## Important Notes

- The application only requests READ-ONLY access to your Google Drive
- Videos must be viewable by "Anyone with the link" in your Google Drive settings
- Make sure to keep your credentials secure and do not commit them to public repositories
- Consider adding `credentials/token.json` to your `.gitignore` file 