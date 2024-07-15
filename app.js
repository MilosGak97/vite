const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import Axios for HTTP requests
const { saveProperty } = require('./src/models/propertyModel'); // Adjust path as needed

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1024mb' }));

app.post('/webhook', (req, res) => {
    try {
        console.log("Runned Webhook Succesfully")
        // Retrieve parsed JSON data from request body
        const dataArray = req.body; // Assuming req.body is an array of objects

        // Iterate through each object in dataArray
        dataArray.forEach((data) => {
            // Log relevant data
            const url = data.url;
            const zpid = data.zpid;

            const address = data.address?.streetAddress;
            const city = data.address?.city;
            const state = data.address?.state;
            const zipcode = data.address?.zipcode;
            const bedrooms = data.bedrooms;
            const bathrooms = data.bathrooms;
            const price = data.price;

            const longitude = data.longitude;
            const latitude = data.latitude;
            const hasBadGeocode = data.hasBadGeocode;

            const homeType = data.homeType;
            const isNonOwnerOccupied = data.isNonOwnerOccupied;
            const parcelId = data.parcelId;

            const daysOnZillow = data.daysOnZillow;

            const propertyTypeDimension = data.propertyTypeDimension;
            const hdpTypeDimension = data.hdpTypeDimension;
            const listingTypeDimension = data.listingTypeDimension;
            const is_listed_by_management_company = data.is_listed_by_management_company;

            // Ensure listing_provided_by is defined before accessing its properties
            const listing_provided_by_name = data.listing_provided_by?.name;
            const listing_provided_by_email = data.listing_provided_by?.email;
            const listing_provided_by_company = data.listing_provided_by?.company;

            const photoCount = data.photoCount;
            const photos = data.photos;

            // Prepare object to save to MongoDB (adjust as per your schema)
            const propertyToSave = {
                url,
                zpid,
                address,
                city,
                state,
                zipcode,
                bedrooms,
                bathrooms,
                price,
                longitude,
                latitude,
                hasBadGeocode,
                homeType,
                isNonOwnerOccupied,
                parcelId,
                daysOnZillow,
                propertyTypeDimension,
                hdpTypeDimension,
                listingTypeDimension,
                is_listed_by_management_company,
                listing_provided_by_name,
                listing_provided_by_email,
                listing_provided_by_company,
                photoCount,
                photos
                // Add more fields as needed
            };


            // Save property data to MongoDB
            saveProperty(propertyToSave);
            console.log('Property saved to MongoDB:', propertyToSave);
            console.log(photoCount)
        });


        // Log the received data (parsed JSON)
        //console.log('Received webhook data:', dataArray);

        // Optionally, process or store the data here

        // Send success response
        res.status(200).send('Webhook received successfully');
    } catch (error) {
        // Log and send error response if parsing fails
        console.error('Failed to handle webhook:', error);
        res.status(400).send('Bad Request: Invalid JSON');
    }
});



//* END OF TESTING PHASE 

// Function to send POST request to Bright Data API
async function sendPostRequest(link) {
    try {

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39', // Replace with your actual token
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'MyPropertyApp/1.0.0', // Replace with your application's identifier
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        };
        const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_lfqkr8wm13ixtbd8f5&endpoint=https://propertylisting-d1c1e167e1b1.herokuapp.com/webhook&format=json&uncompressed_webhook=false`;
        //*
        // The body should be an array of objects
        const body = [{ "url": link }]; // Wrap the link in an array




        const response = await axios.post(url2, body, { headers });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

// Function to send POST request to Bright Data API for multiple links
async function sendPostRequests2() {
    try {
        // Example usage with multiple links
        const links = [
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/'
            // Add more links as needed
        ];

        const url = 'https://api.brightdata.com/datasets/v3/trigger';
        const datasetId = "gd_lfqkr8wm13ixtbd8f5"; // Replace with your actual dataset ID
        const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webhook';
        const format = 'json';
        const uncompressedWebhook = false;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39', // Replace with your actual token
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'MyPropertyApp/1.0.0', // Replace with your application's identifier
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        };

        for (const link of links) {
            const body = [{ "url": link }]; // Wrap the link in an array

            const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${endpoint}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

            const response = await axios.post(url2, body, { headers });
            console.log(`Response for ${link}:`, response.data);

            // Optionally, add a delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

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


// Endpoint to trigger the POST request with a specific link
app.get('/trigger-post-request', async (req, res) => {
    try {
        const link = req.query.link; // Get the link from query parameter
        if (!link) {
            throw new Error('Link parameter is required');
        }

        const response = await sendPostRequest(link);
        res.send('POST request sent successfully');
    } catch (error) {
        console.error('Error triggering POST request:', error);
        res.status(500).send('Failed to send POST request');
    }
});

// Endpoint to handle the input and generate JSON array
app.get('/generate-json', (req, res) => {
    try {
        // Retrieve the 'urls' query parameter from the request
        const urlsParam = req.query.urls;

        // Split the input by comma to get individual URLs
        const urls = urlsParam.split(',');

        // Create an array of objects with 'url' property
        const urlsArray = urls.map(url => ({ url }));


        const response = sendPostRequest(urlsArray);
        res.send('POST request sent successfully');
    } catch (error) {
        console.error('Failed to generate JSON:', error);
        res.status(500).send('Failed to generate JSON');
    }


});




/* THIS IS TESTING PHASE */
app.get('/searchscrape', async (req, res) => {
    try {

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39', // Replace with your actual token
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'MyPropertyApp/1.0.0', // Replace with your application's identifier
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        };
        const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_lfqkr8wm13ixtbd8f5&format=json&uncompressed_webhook=true&type=discover_new&discover_by=url`;
        //*
        // The body should be an array of objects
        const body = [{ "url": "https://www.zillow.com/south-bend-in/houses/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-86.29675344700124%2C%22east%22%3A-86.19633154148366%2C%22south%22%3A41.673161055863744%2C%22north%22%3A41.723404617140616%7D%2C%22mapZoom%22%3A14%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A20555%2C%22regionType%22%3A6%7D%5D%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22tow%22%3A%7B%22value%22%3Afalse%7D%2C%22mf%22%3A%7B%22value%22%3Afalse%7D%2C%22con%22%3A%7B%22value%22%3Afalse%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22apa%22%3A%7B%22value%22%3Afalse%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22apco%22%3A%7B%22value%22%3Afalse%7D%2C%22doz%22%3A%7B%22value%22%3A%227%22%7D%7D%2C%22isListVisible%22%3Atrue%2C%22usersSearchTerm%22%3A%22South%20Bend%20IN%22%7D" }]; // Wrap the link in an array



        const response = await axios.post(url2, body, { headers });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error sending POST request:', error);
    }


});
/* END OF TESTING PHASE */


const server = app.listen(port, () => {
    server.timeout = 7200000; // 120 minutes timeout (in milliseconds)
    console.log(`Server is running on http://localhost:${port}`);
});
