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

app.get('/sendrequestapi', async (req, res) => {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
    try {
        // Trigger data retrieval from Bright Data API
        const response = await axios.get('https://api.brightdata.com/datasets/v3/trigger', {
            params: {
                dataset_id: 'gd_lfqkr8wm13ixtbd8f5',
                endpoint: 'https://worker-847b6ac96356.herokuapp.com/webhook2',
                format: 'json',
                uncompressed_webhook: false
            },
            headers: {
                'Authorization': `Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39`,
                'Content-Type': 'application/gzip', // Assuming the content type should be gzip
                'Host': 'worker-847b6ac96356.herokuapp.com',
                'Connection': 'close',
                'Dca-Filename': 's_lyoi4dayl27vrx1ka.json.gz',
                'Dca-Collection-Id': 's_lyoi4dayl27vrx1ka',
                'Content-Encoding': 'gzip',
                'Dca-Dataset': 'true',
                'Snapshot-Id': 's_lyoi4dayl27vrx1ka',
                'User-Agent': 'BRD dca-ds-delivery-worker/1.473.306'
            },
            httpsAgent: httpsAgent // Include the https agent to handle SSL issues
        });

        console.log('Data retrieval triggered successfully:', response.data);
        res.status(200).send('Data retrieval triggered successfully');
    } catch (error) {
        console.error('Failed to trigger data retrieval:', error);
        res.status(500).send('Failed to trigger data retrieval');
    }
});
/* end of testing phase */

// Handle invalid JSON
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        res.status(400).send({ error: 'Invalid JSON' });
    } else {
        next();
    }
});
