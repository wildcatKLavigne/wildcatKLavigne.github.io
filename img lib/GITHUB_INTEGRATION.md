# Integrating with GitHub Pages

This document provides instructions on how to integrate your image library with your GitHub Pages website.

## Option 1: Create a Redirect Page

1. Copy the `redirect.html` file to your GitHub Pages repository.
2. Rename it to `student-work.html` or any other name that matches your website's structure.
3. Update the redirect URL in the file to point to your image library:
   ```html
   <meta http-equiv="refresh" content="0;url=./img-lib/index.html">
   ```
4. Make sure your image library files are in a folder named `img-lib` in your GitHub Pages repository.

## Option 2: Embed the Image Library Directly

1. Create a folder named `img-lib` in your GitHub Pages repository.
2. Copy all the files from your image library project to this folder:
   - `index.html`
   - `js.js`
   - `css.css`
   - `images/` folder with all your images
3. Update any links in your GitHub Pages website to point to `./img-lib/index.html`.

## Option 3: Create a Subdomain

If you want to keep your image library separate from your main website:

1. Create a new GitHub repository named `img-lib`.
2. Push all your image library files to this repository.
3. Enable GitHub Pages for this repository.
4. Your image library will be available at `https://yourusername.github.io/img-lib/`.
5. Add a link to this URL from your main website.

## Updating Your GitHub Pages Website

To update your GitHub Pages website:

1. Make the necessary changes to your files.
2. Commit the changes to your GitHub repository.
3. Push the changes to GitHub.
4. GitHub Pages will automatically update your website.

## Troubleshooting

If your changes don't appear on your GitHub Pages website:

1. Check that you've pushed the changes to the correct branch (usually `main` or `master`).
2. Wait a few minutes for GitHub Pages to update your website.
3. Clear your browser cache and refresh the page.
4. Check the GitHub Pages settings in your repository to ensure everything is configured correctly. 