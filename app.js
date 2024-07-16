const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { zlibMiddleware } = require('./src/middleware/zlib');
const { connectDB, client } = require('./src/config/mongodb');
const { singleProperty } = require('./src/handlers/webhookHandler');
const { workerProperty } = require('./src/handlers/webhookHandler3'); // Import worker function
const axios = require('axios');
const zlib = require('zlib');

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

// Endpoint to trigger sending of POST request to webhook
app.get('/sendrequestapi', async (req, res) => {


    // Function to gzip compress the JSON data
    const gzipCompress = (data) => {
        return new Promise((resolve, reject) => {
            zlib.gzip(data, (err, buffer) => {
                if (err) {
                    return reject(err);
                }
                resolve(buffer);
            });
        });
    };

    // Sample data to send
    const sampleData = [
        {
            input: {
                url: 'https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale'
            },
            zpid: 77050198,
            city: 'South Bend',
            state: 'IN',
            homeStatus: 'SOLD',
            address: {
                city: 'South Bend',
                streetAddress: '2506 Gordon Cir',
                zipcode: '46635',
                state: 'IN'
            }
        },
        {
            input: {
                url: 'https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/'
            },
            zpid: 38834410,
            city: 'Califon',
            state: 'NJ',
            homeStatus: 'FOR_SALE',
            address: {
                city: 'Califon',
                streetAddress: '76 Main St',
                zipcode: '07830',
                state: 'NJ'
            }
        }
    ];

    try {
        // Convert sample data to JSON string
        const jsonData = JSON.stringify(sampleData);

        // Compress the JSON data
        const compressedData = await gzipCompress(jsonData);

        // Send the POST request
        const response = await axios.post('https://worker-847b6ac96356.herokuapp.com/webhook2', compressedData, {
            headers: {
                'Content-Type': 'application/gzip',
                'DCA-Filename': 's_lyohfjll2i8309fk1y.json.gz',
                'DCA-Collection-ID': 's_lyohfjll2i8309fk1y',
                'Content-Encoding': 'gzip',
                'DCA-Dataset': 'true',
                'Snapshot-ID': 's_lyohfjll2i8309fk1y',
                'User-Agent': 'BRD dca-ds-delivery-worker/1.473.306'
            }
        });

        console.log('Data sent successfully:', response.data);
        res.status(200).send('Data sent successfully');
    } catch (error) {
        console.error('Failed to send data:', error);
        res.status(500).send('Failed to send data');
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
