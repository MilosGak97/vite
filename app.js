const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { zlibMiddleware } = require('./src/middleware/zlib');
const { connectDB, client } = require('./src/config/mongodb');
const { singleProperty } = require('./src/handlers/webhookHandler');
const { workerProperty } = require('./src/handlers/webhookHandler3'); // Import worker function
const axios = require('axios');
const zlib = require('zlib');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB()
    .then(() => {
        console.log("MongoDB connected successfully");
        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process if connection fails
    });

// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1mb' }));

// Use gzip decompression middleware
app.use(zlibMiddleware);

// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log('Incoming request headers:', req.headers);
    next();
});

// Webhook endpoint
app.post('/webhook', singleProperty);

// Default route to handle other requests
app.get('/', (req, res) => {
    res.send('Hello, this is the Property Listings Webhook Service.');
});


app.post('/webhook2', async (req, res) => {
    try {
        console.log("Request body:", req.body);

        if (!Array.isArray(req.body)) {
            throw new Error('Request body is not an array');
        }

        const dataArray = req.body;
        const collection = client.db().collection('properties');

        // Logging individual items and inserting into MongoDB
        for (let i = 0; i < dataArray.length; i++) {
            const listing = dataArray[i];
            console.log("URL: ", listing.url);
            console.log("ZPID: ", listing.zpid);
            console.log("ZPID: ", listing.city);
            const propertyData = {

                url: listing.url,
                zpid: listing.zpid,
                address: listing.address,
                city: listing.city,
                state: listing.state,
                zipcode: listing.zipcode,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                price: listing.price,
                longitude: listing.longitude,
                latitude: listing.latitude,
                hasBadGeocode: listing.hasBadGeocode,
                homeType: listing.homeType,
                isNonOwnerOccupied: listing.isNonOwnerOccupied,
                parcelId: listing.parcelId,
                daysOnZillow: listing.daysOnZillow,
                propertyTypeDimension: listing.propertyTypeDimension,
                hdpTypeDimension: listing.hdpTypeDimension,
                listingTypeDimension: listing.listingTypeDimension,
                is_listed_by_management_company: listing.is_listed_by_management_company,
                listing_provided_by_name: listing.listing_provided_by_name,
                listing_provided_by_email: listing.listing_provided_by_email,
                listing_provided_by_company: listing.listing_provided_by_company,
                photoCount: listing.photoCount,
                photo: listing.photo
            };

            await collection.insertOne(propertyData);
        }

        console.log('All properties processed');
        res.status(200).send('Property URLs processed successfully');
    } catch (error) {
        console.error('Failed to process property URLs:', error);
        res.status(500).send('Internal Server Error');
    }
});




/* Testing phase */

// Disable SSL certificate verification (not recommended for production)
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

// Function to send POST request to Bright Data API for multiple links
async function sendPostRequests(links) {
    const datasetId = "gd_lfqkr8wm13ixtbd8f5"; // Replace with your actual dataset ID
    const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webhook';
    const format = 'json';
    const uncompressedWebhook = false;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39', // Replace with your actual token
        'Accept-Encoding': 'gzip, deflate, br', // Include Accept-Encoding for gzip
        'Accept': '*/*',
        'User-Agent': 'MyPropertyApp/1.0.0', // Replace with your application's identifier
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'dca-collection-id': datasetId, // Replace with your actual dataset ID
        'dca-dataset': 'true' // Indicate this is a dataset-related request
    };

    try {
        // Map links to array of promises for concurrent execution
        const promises = links.map(async (link) => {
            const body = [{ "url": link }]; // Wrap the link in an array

            const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${endpoint}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

            const response = await axios.post(url, body, { headers });
            console.log(`Response for ${link}:`, response.data);
            return response.data;
        });

        // Wait for all requests to complete
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Error sending POST requests:', error);
        throw error; // Rethrow the error for the caller to handle
    }
}

// Endpoint to trigger sending of POST request to webhook using Bright Data API
app.get('/sendrequestapi', async (req, res) => {
    try {
        // Example usage with multiple links
        const links = [
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/'
            // Add more links as needed
        ];

        const results = await sendPostRequests(links);
        console.log('All requests completed successfully:', results);

        res.status(200).send('Data retrieval triggered successfully');
    } catch (error) {
        console.error('Failed to trigger data retrieval:', error);
        res.status(500).send('Failed to trigger data retrieval');
    }
});
