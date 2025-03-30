# Face Swap Application

A web-based application that uses the Segmind Faceswap V4 API to perform face swaps with high precision and quality.

## Features

- Upload source image (face to swap from) or capture using camera
- Upload target image (background image to swap face into)
- Perform face swap using Segmind's Faceswap V4 API
- Download the resulting image

## Requirements

- Segmind API Key (obtain from [Segmind](https://www.segmind.com/models/faceswap-v4/api))
- Modern web browser with JavaScript enabled
- Internet connection (for API calls)

## Setup and Usage

### Method 1: Direct Browser Access
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Enter your Segmind API Key and click "Save API Key"
4. Upload or capture a source image (the face you want to use)
5. Upload a target image (the image you want to swap the face into)
6. Click "Swap Face" to process the images
7. Once processing is complete, the result will be displayed
8. Click "Download Result" to save the face-swapped image

Note: When using this method directly in the browser, you may encounter CORS issues when making API requests to Segmind. If this happens, use Method 2 below.

### Method 2: Using the Node.js Server (Recommended)
1. Clone or download this repository
2. Make sure you have Node.js installed on your computer
3. Open a terminal/command prompt in the project directory
4. Run `npm install` to install the required dependencies
5. Run `npm start` to start the local server
6. Open your browser and navigate to `http://localhost:3000`
7. Enter your Segmind API Key and click "Save API Key"
8. Upload or capture a source image (the face you want to use)
9. Upload a target image (the image you want to swap the face into)
10. Click "Swap Face" to process the images
11. Once processing is complete, the result will be displayed
12. Click "Download Result" to save the face-swapped image

Using the Node.js server provides several advantages:
- Avoids CORS issues when making API requests
- Provides better error handling and logging
- Allows for server-side processing and caching if needed

## API Integration

This application uses the Segmind Faceswap V4 API. The API requires:

- An API key for authentication
- Source image (the face to swap from)
- Target image (the image to swap the face into)

The API integration is implemented in `app.js`. The application makes a POST request to the API endpoint with the source and target images, and displays the resulting face-swapped image.

## Technical Notes

- The application stores the API key in the browser's localStorage for convenience
- Images are converted to the appropriate format before being sent to the API
- The application includes both FormData and JSON payload implementations to accommodate different API requirements
- Camera capture is implemented using the WebRTC API

## Customization

If the API endpoint or parameters need to be adjusted based on actual API documentation:

1. Open `app.js`
2. Locate the `swapFace` function
3. Update the `apiUrl` variable with the correct endpoint
4. Adjust the request format as needed

## Troubleshooting

If you encounter issues with the face swap:

1. Ensure your API key is valid and correctly entered
2. Check that both source and target images are properly uploaded
3. Verify that the source image contains a clear face
4. Check the browser console for any error messages
5. Ensure you have an active internet connection

## Privacy Note

This application processes images locally before sending them to the Segmind API. No images are stored on our servers, but they will be processed by Segmind's servers according to their privacy policy.# FACESWAP_PROJECT
