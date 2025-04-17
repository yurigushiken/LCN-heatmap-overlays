# README.md

# LCN Heatmap Overlay Viewer

> **IMPORTANT:** Always activate the conda environment before working on this project:
> ```
> conda activate lcn-heatmap-overlays
> ```

## Overview

This project provides a web-based interface for viewing videos with interactive heatmap overlays for eye-tracking data from the Language and Cognitive Neuroscience Lab. It visualizes infant and adult gaze patterns during social interaction events, enabling researchers to analyze how visual attention to social events develops across different age groups. The application supports multiple overlay toggles and age group selections to facilitate comparative analysis.

## Scientific Background

The heatmap overlays represent eye-tracking data collected from participants across different developmental stages (7-11 month-old infants and adults). Each overlay visualizes where participants directed their attention during social interaction events. The data has been processed using Gaussian kernel density estimation to create visually informative heatmaps highlighting areas of concentrated visual attention.

Key scientific aspects:
- Tracks developmental changes in social attention from infancy to adulthood
- Enables direct comparison between different age groups through overlay stacking
- Uses color-coding by age group for intuitive visual differentiation
- Employs variable intensity mapping to show gaze concentration

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

The application uses base videos stored in `public/videos/`. These are MP4 files showing different social interaction events with the following naming pattern:

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

Overlay videos are WebM files with alpha channel transparency, stored in `public/overlays/`. Each overlay represents the gaze patterns for a specific age group (seven, eight, nine, ten, eleven months, or adult) during a particular event. The files follow a naming pattern of `[event-type]_[age-group].webm`, such as:

- `gw_seven.webm` - Give with toy, 7-month age group
- `gw_adult.webm` - Give with toy, adult age group

Each age group has a distinct color scheme for easy identification when multiple overlays are displayed simultaneously. The overlays use a multi-layered approach with different intensities representing varying levels of visual attention concentration.

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

## Technical Details

The heatmap overlays were generated from raw eye-tracking data using a sophisticated processing pipeline:

- Gaussian kernel density estimation to create smooth heatmaps from discrete gaze points
- Age-specific color encoding to differentiate between developmental stages
- Multiple transparency layers to represent varying intensity levels of visual attention
- VP9 video encoding with alpha channel transparency for web compatibility
- Strategic positioning of age-group legends to prevent overlap when multiple overlays are active

## Performance

The application automatically preloads all videos when first loaded to ensure smooth playback. Videos are cached in the browser for improved performance on subsequent viewing.

## Deployment

The application is deployed to GitHub Pages at: https://yurigushiken.github.io/LCN-heatmap-overlays/

To update the deployment:

1. Make changes to the code
2. Commit and push to GitHub
3. The GitHub Actions workflow will automatically deploy the changes

### Deployment Notes

If changes don't appear on the live site after pushing to GitHub:

1. **GitHub Actions deployment issue** - Even when workflows report success, they may not correctly update the gh-pages branch
2. **Solution: Direct deployment** - Use the manual deployment command:

```bash
npm run deploy
```

This command builds the project and directly publishes to the gh-pages branch, bypassing GitHub Actions.

3. **Verification** - After deployment, confirm the site displays your changes by checking for:
   - New UI elements
   - Updated styling
   - Changed content

## Browser Compatibility

This application is compatible with modern browsers that support:
- HTML5 Video
- WebM video with alpha channel
- Canvas API
- ES6+ JavaScript features

## License

This project is proprietary to the Language and Cognitive Neuroscience Lab.


constitution:
This website is part of a scientific project.
2. Scientific Integrity
This is a scientific study requiring rigorous standards in data handling, analysis, and reporting.
No Placeholders: Placeholder code, stubbed functions, fake data patterns, or placeholder file paths are strictly forbidden in the main analysis pipeline (scripts/, processed_data/, results/).
Use Actual Data: All development and analysis must use the actual experimental data located in /csv/.
Transparency: Analysis steps should be clear, documented, and justifiable.
3. Code Sustainability & Organization
Maintain a clean, organized, and sustainable coding space.
Reusable Modules: Core processing and analysis logic should reside in the scripts/ directory as reusable functions/modules.
Configuration: Centralize parameters (paths, thresholds, constants) in config.py.
No Patchwork: Avoid temporary fixes or hacks in the main codebase. Address issues systematically.
Scratch Area Use: Adhere strictly to the defined purpose of the scratch-area/ for temporary, exploratory, and disposable code/outputs. No production analysis script should depend on its contents. Refer to the README section "About the Scratch Area" for specifics.
4. Clear Data Definitions and Script Interfaces
Data Format Consistency: Ensure consistent data formats (e.g., column names, data types) when loading raw data and saving processed data (processed_data/). Document expected formats.
Function Clarity: Functions within scripts/ modules should have clear inputs and outputs. Use docstrings to explain purpose, arguments, and return values.
5. Analysis Validation and Reproducibility
Verification: Implement checks within analysis scripts to validate intermediate steps and final results where feasible (e.g., checking data ranges, expected values).
Reproducibility: Structure scripts (run_gaze_shift_analysis.py, etc.) so that analyses can be re-run consistently, producing the same results from the same raw data and configuration. Timestamped results in results/ aid this.
Statistical Rigor: Use appropriate statistical methods (stats_utils.py) and report results accurately.
6. Documentation
Code Comments: Comment code adequately, especially complex logic or assumptions.
README: Keep the main README.md updated with the project status, structure, and how to run analyses.
Results Interpretation: Ensure plots (plot_utils.py) and tables generated in results/ are clearly labelled and interpretable.
7. Robust Error Handling
Implement basic error handling (e.g., checking if files exist, validating data during loading/processing) to provide informative messages when issues arise.
Maintaining structural integrity: Don't let temporary scripts become permanent fixtures that duplicate logic.
Clear process: Separate investigation from implementation. Verify steps before proceeding.
Robust debugging: Ensure errors are visible, even if standard logging fails.
Interface discipline: Pay close attention to data passed between functions/modules after refactoring.
Precise communication: Explicitly state file paths and expected actions.







about the study and events, etc:
## Dataset Description

### Data Collection Method
- Frame-by-frame eye-tracking data collected during video presentation
- Tracks exactly where participants looked (e.g., man, girl, toy, screen)
- Records precise coordinates of gaze ("Blue Dot Center" in CSV files)
- Segments videos into "approach," "interaction," and "departure" phases
- Includes various event types: give, show, hug, and upside-down variants
- Includes "with toy" and "without toy" conditions for each event type

### Participant Groups
- **Infants**: Ages 7, 8, 9, 10, 11, and 12 months
- **Adults**: Ages ranging from 22 to 56 years (control group)

### File Naming Convention
Files follow the pattern: `[Age]-[Order]-[ID][Coder Initials].csv`
- Example: `Seven-0101-1373gl.csv` (7-month-old infant, order 0101, ID 1373, coded by "gl")
- Adult files include age in years (e.g., `TwentyTwo-0101-1661vv.csv`)

### Data Structure
The CSV files include the following key columns:
- **Participant**: Unique identifier including age, order, and ID
- **Frame Number/Time**: Timing information for each data point
- **What-Where Pairs**: Specific gaze target combinations (see "Gaze Target Combinations" section below)
- **Onset/Offset**: Timing of each gaze
- **Blue Dot Center**: Exact x,y coordinates of eye-tracking gaze point
- **event_verified**: Event type codes (e.g., "gw" = give with toy)
- **trial_number**: Sequential trial number within event type
- **segment**: Phase of interaction (approach, interaction, departure)
- **participant_type**: infant or adult
- **participant_age**: In both months and years

### Gaze Target Combinations (What-Where Pairs)
It is crucial to understand that the "What" and "Where" columns must be interpreted as unified combinations, not independent variables. These specific combinations represent the precise targets of visual attention:

1. **Person-focused targets:**
   - **man,face** - Looking at the man's face
   - **man,hands** - Looking at the man's hands
   - **man,body** - Looking at the man's body
   - **woman,face** - Looking at the woman's face
   - **woman,hands** - Looking at the woman's hands
   - **woman,body** - Looking at the woman's body

2. **Object-focused targets:**
   - **toy,other** - Looking at the toy when present in "with toy" conditions
   - **toy2,other** - Looking at the toy2 area in "without toy" conditions

3. **Other targets:**
   - **screen,other** - Looking elsewhere on the screen (not at a person or toy)
   - **no,signal** - No eye-tracking data available for that frame

Only these specific combinations exist in the data as they reflect the logical structure of the social events being observed. Combinations such as "toy,face" or "screen,body" do not exist as they wouldn't make logical sense in the experimental context.

### Additional Data Information
- For infants, age is stored in months (e.g., 7, 8, 9, 10, 11, 12)
- For adults, age is stored in months as well (e.g., 468 for a 39-year-old)

Example data structure:
```
Participant,Frame Number,Time,What,Where,Onset,Offset,Blue Dot Center,event_verified,frame_count_event,trial_number,trial_number_global,frame_count_trial_number,segment,frame_count_segment,participant_type,participant_age_months,participant_age_years

ThirtyNine-0101-1660,109,00:00:03:6333,screen,other,3.6333,3.6667,"(624.50, 589.00)",gw,1,1,1,1,approach,1,adult,468,39

ThirtyNine-0101-1660,110,00:00:03:6667,screen,other,3.6667,3.7,"(624.50, 588.00)",gw,2,1,1,2,approach,2,adult,468,39

Participant,Frame Number,Time,What,Where,Onset,Offset,Blue Dot Center,event_verified,frame_count_event,trial_number,trial_number_global,frame_count_trial_number,segment,frame_count_segment,participant_type,participant_age_months,participant_age_years

Eight-0101-1579,276,00:00:09:2000,no,signal,9.2,9.2333,,gwo,1,1,1,1,approach,1,infant,8,0.7

Eight-0101-1579,277,00:00:09:2333,screen,other,9.2333,9.2667,"(481.00, 437.50)",gwo,2,1,1,2,approach,2,infant,8,0.7

Eight-0101-1579,278,00:00:09:2667,screen,other,9.2667,9.3,"(481.00, 437.50)",gwo,3,1,1,3,approach,3,infant,8,0.7
```

### Event Condition Codes
The experiment includes several different event types, indicated by the "event_verified" column:

1. **Give conditions:** 
   - **gw** - Give with toy: One person giving a toy to another person
   - **gwo** - Give without toy: The giving motion without an actual toy

2. **Show conditions:**
   - **sw** - Show with toy: One person showing a toy to another person
   - **swo** - Show without toy: The showing motion without an actual toy

3. **Hug conditions:**
   - **hw** - Hug with toy: Hugging while one person holds a toy
   - **hwo** - Hug without toy: Hugging with no toy present

4. **Upside-down conditions:** (Control conditions with less natural actions)
   - **ugw** - Upside-down give with toy
   - **ugwo** - Upside-down give without toy
   - **uhw** - Upside-down hug with toy
   - **uhwo** - Upside-down hug without toy

5. **Floating Toy condition:** (Important control condition)
   - **f** - Floating toy: Control condition where a toy floats without human interaction
   
   The floating toy condition is a unique and important control condition that differs from all other conditions:
   - Unlike paired conditions (e.g., give with/without), the floating toy is a standalone condition
   - It has a real toy but no equivalent "toy2" area (in analysis data, there's no looking at "toy2" for this condition)
   - It provides a baseline for how infants look at objects in the absence of social interaction
   - For analysis purposes, this condition produces a proportion of looking at the toy rather than a ratio
   - A specialized analysis script (06-floating) has been developed to properly analyze this condition

Each event is segmented into three phases:
- **approach** - Initial phase where people come together
- **interaction** - Main action phase (giving, showing, hugging)
- **departure** - Final phase where people separate

