# GitHub Setup Guide for LCN Heatmap Overlay Viewer

This guide explains how to set up a GitHub repository for the LCN Heatmap Overlay Viewer and deploy it using GitHub Pages.

## Creating a GitHub Repository

1. Log in to [GitHub](https://github.com/)
2. Click the "+" button in the top right corner and select "New repository"
3. Enter a repository name (e.g., "LCN-heatmap-overlays")
4. Add a description (optional)
5. Set the repository to Public or Private based on your requirements
6. Initialize with a README if desired
7. Click "Create repository"

## Configuring GitHub Pages

To deploy your application using GitHub Pages:

1. Push your code to the repository
2. Go to the repository settings
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "GitHub Actions"
5. Choose the "React" workflow template

Alternatively, you can use the `gh-pages` package for deployment:

1. Install the package:
   ```
   npm install --save-dev gh-pages
   ```

2. Add these scripts to your package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Add the homepage field to your package.json:
   ```json
   "homepage": "https://yourusername.github.io/LCN-heatmap-overlays"
   ```

4. Deploy the application:
   ```
   npm run deploy
   ```

## Setting up GitHub Actions

For automated deployment, you can create a GitHub Actions workflow:

1. Create a `.github/workflows` directory in your project
2. Create a file named `deploy.yml` with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: build
```

## Setting up Environment Variables for GitHub

For securely storing API keys and credentials:

1. Go to your repository's Settings
2. Click on "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - Name: `REACT_APP_GOOGLE_API_KEY`  
     Value: Your Google API key
   - Name: `REACT_APP_GOOGLE_CLIENT_ID`  
     Value: Your Google Client ID
   - Name: `REACT_APP_GOOGLE_CLIENT_SECRET`  
     Value: Your Google Client Secret

5. These secrets can be accessed in your workflow files like this:
   ```yaml
   env:
     REACT_APP_GOOGLE_API_KEY: ${{ secrets.REACT_APP_GOOGLE_API_KEY }}
   ```

## Using a Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your repository's Settings
2. Scroll down to the "GitHub Pages" section
3. Under "Custom domain", enter your domain name
4. Save the changes
5. Configure your domain's DNS settings as instructed

## Branching Strategy

For collaborative development:

1. Use the `main` branch for production-ready code
2. Create `feature/*` branches for new features
3. Create `bugfix/*` branches for bug fixes
4. Use pull requests to merge changes into the main branch
5. Enforce code review before merging

## Protection Rules

To protect your repository:

1. Go to your repository's Settings
2. Click on "Branches"
3. Click "Add rule" next to "Branch protection rules"
4. Under "Branch name pattern", enter `main`
5. Enable "Require pull request reviews before merging"
6. Enable "Require status checks to pass before merging"
7. Save changes 