import os
import pickle
import time
import json
import glob
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# This scope allows uploading videos to YouTube.
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

# Path to the YouTube client secrets file and token storage.
CLIENT_SECRETS_FILE = os.path.join('credentials', 'youtube', 'client_secret_661140052004-m7tshu43ns8d6bg7t3uc8ja3unik6krq.apps.googleusercontent.com.json')
TOKEN_PICKLE_FILE = os.path.join('credentials', 'youtube', 'token.pickle')

# Directory for overlay videos
VIDEO_DIRECTORY = "public/overlays"

# The email associated with the YouTube account
YOUTUBE_EMAIL = "mischagushiken@gmail.com"

def get_authenticated_service():
    credentials = None
    
    # Ensure token directory exists
    os.makedirs(os.path.dirname(TOKEN_PICKLE_FILE), exist_ok=True)
    
    # Delete any existing token.pickle to force new authentication with new account
    if os.path.exists(TOKEN_PICKLE_FILE):
        try:
            os.remove(TOKEN_PICKLE_FILE)
            print(f"Removed existing token file to force new authentication")
        except Exception as e:
            print(f"Could not remove token file: {e}")
    
    # If there are no (valid) credentials, let the user log in.
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            print("Refreshing expired credentials")
            credentials.refresh(Request())
        else:
            print("No valid credentials found. Starting the authorization flow.")
            # Ensure the client secrets file exists
            if not os.path.exists(CLIENT_SECRETS_FILE):
                print(f"ERROR: Client secrets file not found at {CLIENT_SECRETS_FILE}")
                print("Please check the README for instructions on obtaining OAuth credentials.")
                return None
                
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            credentials = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open(TOKEN_PICKLE_FILE, 'wb') as token:
                print(f"Saving credentials to {TOKEN_PICKLE_FILE}")
                pickle.dump(credentials, token)
    
    # Build the YouTube API client
    return build('youtube', 'v3', credentials=credentials)

def upload_video(youtube, file_path, title, description, tags, category_id, privacy_status):
    print(f"Uploading {os.path.basename(file_path)}")
    
    # Call the API's videos.insert method to create and upload the video.
    insert_request = youtube.videos().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags,
                "categoryId": category_id
            },
            "status": {
                "privacyStatus": privacy_status
            }
        },
        media_body=MediaFileUpload(file_path, chunksize=1024*1024, resumable=True)
    )
    
    response = None
    error = None
    retry = 0
    
    while response is None:
        try:
            print("Uploading file...")
            status, response = insert_request.next_chunk()
            if status:
                print(f"Uploaded {int(status.progress() * 100)}%")
        except HttpError as e:
            error = f"An HTTP error {e.resp.status} occurred:\n{e.content}"
            if error:
                print(error)
                retry += 1
                if retry > 3:
                    raise
                time.sleep(5)
        except Exception as e:
            print(f"A non-HTTP error occurred: {e}")
            retry += 1
            if retry > 3:
                raise
            time.sleep(5)
    
    return response

def extract_video_name(file_path):
    # Extract just the filename without path and extension
    base_name = os.path.basename(file_path)
    return os.path.splitext(base_name)[0]

def get_video_thumbnail_url(video_id):
    # YouTube provides several thumbnail options - we'll use the medium quality one
    return f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"

def get_video_paths():
    """Get all overlay video paths from the overlays directory."""
    # Look for WebM files (typically used for overlays with alpha channel)
    video_paths = glob.glob(os.path.join(VIDEO_DIRECTORY, "**/*.webm"), recursive=True)
    
    if not video_paths:
        print(f"No WebM videos found in {VIDEO_DIRECTORY}")
        return []
    
    # Sort the video paths alphabetically to ensure a consistent order
    video_paths.sort()
    
    for path in video_paths:
        print(f"Found overlay video: {path}")
    
    return video_paths

def update_videos_json(uploaded_videos):
    """Update the videos.json file with YouTube URLs for overlays."""
    videos_json_path = "public/videos.json"
    
    if not os.path.exists(videos_json_path):
        print(f"Warning: {videos_json_path} does not exist. Creating a new file.")
        videos_data = []
    else:
        try:
            with open(videos_json_path, 'r') as f:
                videos_data = json.load(f)
        except Exception as e:
            print(f"Error reading {videos_json_path}: {e}")
            videos_data = []
    
    # Map of original file names to YouTube video IDs
    youtube_map = {
        extract_video_name(video["originalFilePath"]): {
            "videoId": video["videoId"],
            "youtubeUrl": f"https://www.youtube.com/watch?v={video['videoId']}"
        } for video in uploaded_videos
    }
    
    # Update overlays with YouTube URLs
    for video in videos_data:
        if "overlays" in video:
            for overlay in video["overlays"]:
                overlay_name = extract_video_name(overlay["path"])
                if overlay_name in youtube_map:
                    overlay["youtubeVideoId"] = youtube_map[overlay_name]["videoId"]
                    overlay["youtubeUrl"] = youtube_map[overlay_name]["youtubeUrl"]
    
    # Save updated JSON
    with open(videos_json_path, 'w') as f:
        json.dump(videos_data, f, indent=2)
    
    print(f"Updated {videos_json_path} with YouTube URLs for {len(youtube_map)} overlays")

def main():
    print("=" * 80)
    print("YouTube Video Uploader for LCN Heatmap Overlays")
    print("=" * 80)
    print("This script will upload overlay videos to YouTube using the dedicated YouTube credentials.")
    print(f"IMPORTANT: When the authentication window opens, please sign in with {YOUTUBE_EMAIL}")
    print("=" * 80)
    
    # Get all video paths from the overlays directory
    video_paths = get_video_paths()
    
    if not video_paths:
        print("No valid video paths found. Please check that overlay videos exist in the public/overlays directory.")
        return
    
    print(f"\nFound {len(video_paths)} valid overlay videos to upload.")
    
    # Ask for confirmation before proceeding
    confirmation = input(f"Do you want to upload {len(video_paths)} videos to YouTube using {YOUTUBE_EMAIL}? (y/n): ")
    if confirmation.lower() != 'y':
        print("Upload canceled.")
        return
    
    youtube = get_authenticated_service()
    if not youtube:
        print("Failed to authenticate with YouTube API. Please check your credentials.")
        return
        
    uploaded_videos = []
    
    for index, video_path in enumerate(video_paths, start=1):
        try:
            # Extract video name for the title
            video_name = extract_video_name(video_path)
            
            # Set up upload parameters
            title = f"LCN Heatmap Overlay - {video_name}"
            description = f"Heatmap overlay video for the LCN Heatmap Overlay Viewer. File: {video_name}"
            tags = ["LCN", "heatmap", "overlay", "eyetracking"]
            category_id = "22"  # 22 corresponds to People & Blogs
            privacy_status = "unlisted"  # Videos are accessible by link but not public
            
            # Upload the video
            response = upload_video(youtube, video_path, title, description, tags, category_id, privacy_status)
            
            # Get the video ID and other information
            video_id = response.get("id")
            
            # Create a video entry in our format
            video_entry = {
                "id": index,
                "videoId": video_id,
                "title": video_name,
                "description": description,
                "thumbnailUrl": get_video_thumbnail_url(video_id),
                "originalFilePath": video_path,
                "uploadDate": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "channelId": response.get("snippet", {}).get("channelId", ""),
                "channelTitle": response.get("snippet", {}).get("channelTitle", "")
            }
            
            uploaded_videos.append(video_entry)
            
            print(f"Video uploaded successfully. Video ID: {video_id}")
            print(f"Video URL: https://www.youtube.com/watch?v={video_id}")
            
        except Exception as e:
            print(f"Error uploading {video_path}: {e}")
    
    # Save the uploaded videos information
    if uploaded_videos:
        # Save to a JSON file
        output_file = "public/youtube-uploads.json"
        with open(output_file, "w") as f:
            json.dump(uploaded_videos, f, indent=2)
        
        print(f"\nUploaded {len(uploaded_videos)} videos successfully!")
        print(f"Upload information saved to {output_file}")
        
        # Update videos.json with YouTube URLs
        update_videos_json(uploaded_videos)
    else:
        print("\nNo videos were uploaded successfully.")

if __name__ == "__main__":
    main() 