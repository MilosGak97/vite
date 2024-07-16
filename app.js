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
    console.log('Incoming POST request headers2:', req.headers);
    next();
});

// Webhook endpoint
app.post('/webhook', singleProperty);

// Default route to handle other requests
app.get('/', (req, res) => {
    res.send('Hello, this is the Property Listings Webhook Service.');
});


app.post('/webhook2', async (req, res) => {
    console.log('Incoming POST request headers5:', req.headers);
    try {


        console.log('Incoming POST request headers:', req.headers);
        console.log('Incoming POST request body:', req.body);
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
// Define the route that will trigger the function
app.get('/milionbucks', (req, res) => {
    sendPostRequests2()
        .then(() => {
            res.send('POST request sent successfully');
        })
        .catch((error) => {
            console.error('Error sending POST request:', error);
            res.status(500).send('Failed to send POST request');
        });
});

async function sendPostRequests2() {
    try {
        // Example usage with multiple links
        const links = [
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/'
            // Add more links as needed
        ];



        const datasetId = "gd_lfqkr8wm13ixtbd8f5"; // Replace with your actual dataset ID
        const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webhook2';
        const format = 'json';
        const uncompressedWebhook = false;
        const headers = {
            'Content-Type': 'application/gzip',
            'dca-collection-id': 's_lyokoc2y2led7hycvu',
            'content-encoding': 'gzip',
            'dca-dataset': 'true',
            'User-Agent': 'BRD dca-ds-delivery-worker/1.473.306',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39'
        };


        for (const link of links) {
            const body = [{ "url": link }]; // Wrap the link in an array

            const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_lfqkr8wm13ixtbd8f5&endpoint=https://propertylisting-d1c1e167e1b1.herokuapp.com/webhook2&format=json&uncompressed_webhook=false`;

            const response = await axios.post(url2, body, { headers });
            console.log(`Response for ${link}:`, response.data);


            // Send the received data to your webhook
            await axios.post(endpoint, response.data, { headers });

            // Optionally, add a delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay


        }
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}