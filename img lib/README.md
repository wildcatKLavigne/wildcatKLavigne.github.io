# Autofillable Website

This is a single-page website that automatically generates its content based on data embedded in the JavaScript file. The website includes a navbar, a portrait image, a portfolio section with multiple images, and an about section with text.

## How to Use

1. **Edit the js.js file** to customize your website:
   - Update the navbar items
   - Change the portrait image
   - Add or remove portfolio images
   - Modify the about text

2. **Add your images** to the `images` folder:
   - Make sure the image filenames match those specified in the js.js file
   - The portrait image should be named as specified in the js.js file
   - Portfolio images should be named as specified in the js.js file

3. **Open index.html** in a web browser to view your website.

## Data Structure

The data is embedded directly in the js.js file and has the following structure:

```javascript
const data = {
  "navbar": [
    {
      "text": "Button Text",
      "link": "#"
    },
    ...
  ],
  "portrait": {
    "src": "path/to/portrait.jpg",
    "alt": "Portrait Alt Text"
  },
  "portfolio": [
    {
      "src": "path/to/portfolio1.jpg",
      "alt": "Portfolio 1 Alt Text"
    },
    ...
  ],
  "about": {
    "text": "Your about text goes here..."
  }
};
```

## Features

- **Dynamic Navbar**: The navbar is generated based on the items in the data.
- **Portrait Image**: The portrait image is set based on the data.
- **Portfolio Section**: The portfolio section is populated with images based on the data.
- **About Section**: The about section is populated with text based on the data.
- **Responsive Design**: The website is responsive and works on different screen sizes.
- **Interactive Elements**: Clicking on the portrait image changes the layout of the portfolio section.

## Customization

You can customize the website by:

1. Editing the data in the `js.js` file to change the content.
2. Modifying the `css.css` file to change the styling.
3. Updating the layout logic in the `js.js` file to change the behavior.

## Requirements

- A modern web browser that supports JavaScript and CSS.
- No server-side processing is required, making it easy to host on any static hosting service. 