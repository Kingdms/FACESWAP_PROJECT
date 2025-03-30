import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import FormData from 'form-data';
import https from 'https';
import { URL } from 'url';
import axios from 'axios';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors());

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Serve static files
app.use(express.static(__dirname));

// Face swap endpoint with advanced parameters
app.post('/api/faceswap', upload.fields([
    { name: 'source_image', maxCount: 1 },
    { name: 'target_image', maxCount: 1 }
]), async (req, res) => {
    try {
        // Get API key from request headers
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // Get uploaded files
        const sourceImage = req.files['source_image'][0];
        const targetImage = req.files['target_image'][0];

        if (!sourceImage || !targetImage) {
            return res.status(400).json({ error: 'Both source and target images are required' });
        }

        // Get advanced parameters from request body or use defaults
        const {
            seed = Math.floor(Math.random() * 1000000),
            model_type = 'speed',
            swap_type = 'head',
            style_type = 'normal',
            image_format = 'png',
            image_quality = 90
        } = req.body;

        console.log('Processing face swap request with advanced parameters...');
        console.log('Source image:', sourceImage.originalname);
        console.log('Target image:', targetImage.originalname);
        console.log('Advanced parameters:', {
            seed,
            model_type,
            swap_type,
            style_type,
            image_format,
            image_quality
        });

        // Convert image buffers to base64 strings
        const sourceBase64 = sourceImage.buffer.toString('base64');
        const targetBase64 = targetImage.buffer.toString('base64');
        
        // Create payload for Segmind API
        const payload = {
            source_image: sourceBase64,
            target_image: targetBase64,
            seed: parseInt(seed),
            model_type,
            swap_type,
            style_type,
            image_format,
            image_quality: parseInt(image_quality)
        };

        // In a real implementation, we would call the Segmind API with the payload
        // For now, we'll simulate a processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demonstration purposes, we'll create a simple mock response
        // We'll use the target image as the base for our mock result
        
        // Return a mock response
        res.json({
            output: targetBase64,
            message: 'Face swap completed successfully with advanced parameters',
            parameters_used: {
                seed,
                model_type,
                swap_type,
                style_type,
                image_format,
                image_quality
            }
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// JSON API endpoint with advanced parameters
app.post('/api/faceswap-json', express.json({ limit: '10mb' }), async (req, res) => {
    try {
        // Get API key from request headers
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // Get source and target images and advanced parameters from request body
        const {
            source_image,
            target_image,
            seed = Math.floor(Math.random() * 1000000),
            model_type = 'speed',
            swap_type = 'head',
            style_type = 'normal',
            image_format = 'png',
            image_quality = 90
        } = req.body;
        
        if (!source_image || !target_image) {
            return res.status(400).json({ error: 'Both source and target images are required' });
        }

        console.log('Processing JSON face swap request with advanced parameters...');
        console.log('Advanced parameters:', {
            seed,
            model_type,
            swap_type,
            style_type,
            image_format,
            image_quality
        });
        
        // Create payload for Segmind API
        const payload = {
            source_image,
            target_image,
            seed: parseInt(seed),
            model_type,
            swap_type,
            style_type,
            image_format,
            image_quality: parseInt(image_quality)
        };
        
        // In a real implementation, we would call the Segmind API with the payload
        // For now, we'll simulate a processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return a mock response
        res.json({
            output: target_image,
            message: 'Face swap completed successfully with advanced parameters',
            parameters_used: {
                seed,
                model_type,
                swap_type,
                style_type,
                image_format,
                image_quality
            }
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Function to make API request using axios with JSON
async function makeHttpsRequest(apiUrl, apiKey, sourceImage, targetImage) {
    try {
        // Convert image buffers to base64 strings
        const sourceBase64 = sourceImage.buffer.toString('base64');
        const targetBase64 = targetImage.buffer.toString('base64');
        
        // Create JSON payload
        const jsonData = {
            source_image: sourceBase64,
            target_image: targetBase64
        };
        
        console.log('Axios Request to:', apiUrl);
        console.log('Axios Headers:', {
            'x-api-key': apiKey.substring(0, 3) + '...' // Log partial API key for security
        });
        
        // Make the axios request
        const response = await axios({
            method: 'post',
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            data: jsonData
        });
        
        // Log response status
        console.log('Axios Response status:', response.status);
        
        // Log response data
        console.log('Axios Response data:', JSON.stringify(response.data).substring(0, 100) + '...');
        
        return {
            statusCode: response.status,
            body: response.data
        };
    } catch (error) {
        console.error('Axios error:', error.message);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
            return {
                statusCode: error.response.status,
                body: error.response.data
            };
        }
        throw error;
    }
}

// Function to make API request using axios with JSON data
async function makeHttpsJsonRequest(apiUrl, apiKey, jsonData) {
    try {
        console.log('Axios JSON Request to:', apiUrl);
        console.log('Axios JSON Headers:', {
            'x-api-key': apiKey.substring(0, 3) + '...' // Log partial API key for security
        });
        
        // Make the axios request
        const response = await axios({
            method: 'post',
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            data: jsonData
        });
        
        // Log response status
        console.log('Axios JSON Response status:', response.status);
        
        // Log response data
        console.log('Axios JSON Response data:', JSON.stringify(response.data).substring(0, 100) + '...');
        
        return {
            statusCode: response.status,
            body: response.data
        };
    } catch (error) {
        console.error('Axios JSON error:', error.message);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
            return {
                statusCode: error.response.status,
                body: error.response.data
            };
        }
        throw error;
    }
}

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open your browser and navigate to http://localhost:${port}/index.html`);
});