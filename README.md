# README.md

# LCN Heatmap Overlay Viewer

> **IMPORTANT:** Always activate the conda environment before working on this project:
> ```
> conda activate lcn-heatmap-overlays
> ```

## Overview

This project provides a web-based interface for viewing videos with interactive heatmap overlays for eye-tracking data from the Language and Cognitive Neuroscience Lab. It supports multiple overlay toggles and age group selections to facilitate comparative analysis of eye-tracking data.

## Features

- Video playback with synchronized heatmap overlays
- Toggle individual overlays on/off
- Filter overlays by age group
- Select different base videos from dropdown
- Responsive design for various screen sizes
- Automatic preloading of all videos for improved performance

## Project Structure

```
LCN-heatmap-overlays/
├── public/
│   ├── videos/        # Base MP4 video files (f.mp4, gw.mp4, etc.)
│   ├── overlays/      # WebM files with alpha channel for overlays (gw_seven.webm, etc.)
│   └── videos.json    # Configuration file for videos and overlays
├── src/
│   ├── components/
│   │   ├── App.js              # Main application component
│   │   ├── VideoPlayer.js      # Video player with overlay canvas
│   │   ├── HeatmapOverlay.js   # Video-based overlay rendering
│   │   ├── OverlaySelector.js  # UI for toggling overlays
│   │   ├── AgeGroupToggle.js   # Age group selection controls
│   │   └── ControlPanel.js     # Video selection and information
│   ├── styles/
│   │   └── components/         # Component-specific CSS files
│   ├── utils/
│   │   ├── dataUtils.js        # Data loading and processing utilities
│   │   ├── videoSyncUtils.js   # Video synchronization utilities
│   │   ├── VideoContext.js     # Video state management
│   │   └── videoCache.js       # Video preloading functionality
│   └── index.js                # Application entry point
└── package.json                # Project dependencies and scripts
```

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yurigushiken/LCN-heatmap-overlays.git
   cd LCN-heatmap-overlays
   ```

2. Create and activate the conda environment:
   ```
   conda create -n lcn-heatmap-overlays python=3.9 -y
   conda activate lcn-heatmap-overlays
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start development server:
   ```
   npm start
   ```

5. Build for production:
   ```
   npm run build
   ```

## Video and Overlay Files

### Base Videos

The application uses base videos stored in `public/videos/`. These are MP4 files with the following naming pattern:

- `f.mp4` - Floating toy
- `gw.mp4` - Give with toy
- `gwo.mp4` - Give without toy
- `hw.mp4` - Hug with toy
- `hwo.mp4` - Hug without toy
- `sw.mp4` - Show with toy
- `swo.mp4` - Show without toy
- `ugw.mp4` - Upside-down give with toy
- `ugwo.mp4` - Upside-down give without toy
- `uhw.mp4` - Upside-down hug with toy
- `uhwo.mp4` - Upside-down hug without toy

### Overlay Videos

Overlay videos are WebM files with alpha channel transparency, stored in `public/overlays/`. These follow a naming pattern of `[event-type]_[age-group].webm`, such as:

- `gw_seven.webm` - Give with toy, 7-month age group
- `gw_adult.webm` - Give with toy, adult age group

## Configuration

The `videos.json` file in the public directory contains the configuration for all videos and their associated overlays. Each video entry includes:

- `id`: Unique identifier matching the video filename (e.g., "f", "gw")
- `title`: Display name for the UI
- `description`: Longer description
- `videoPath`: Path to the MP4 base video
- `overlays`: Array of overlay configurations with:
  - `id`: Unique overlay identifier
  - `title`: Display name
  - `path`: Path to the WebM overlay file
  - `ageGroup`: Category for filtering (e.g., "seven", "adult")
  - `opacity`: Transparency level (0-1)

## Performance

The application automatically preloads all videos when first loaded to ensure smooth playback. Videos are cached in the browser for improved performance on subsequent viewing.

## Deployment

The application is deployed to GitHub Pages at: https://yurigushiken.github.io/LCN-heatmap-overlays/

To update the deployment:

1. Make changes to the code
2. Commit and push to GitHub
3. The GitHub Actions workflow will automatically deploy the changes

## Browser Compatibility

This application is compatible with modern browsers that support:
- HTML5 Video
- WebM video with alpha channel
- Canvas API
- ES6+ JavaScript features

## License

This project is proprietary to the Language and Cognitive Neuroscience Lab.
