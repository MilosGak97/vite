const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import Axios for HTTP requests
const { saveProperty } = require('./propertyModel'); // Adjust path as needed
const { sendPostRequests2 } = require('./worker'); // Adjust the path if necessary
const { sendPostRequest } = require('./worker'); // Adjust the path if necessary

const compression = require('compression');

const zlib = require('zlib');

const app = express();
const port = process.env.PORT || 3000;


app.use((req, res, next) => {
    // Log the incoming request headers
    console.log('Incoming request headers:', req.headers);
})

// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1024mb' }));

require('dotenv').config();



// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1024mb' }));

app.post('/webhook', async (req, res) => {
    try {
        const dataArray = req.body; // Assuming req.body is an array of objects
        console.log("DATA ARRAY: ", dataArray); // delete
        for (let data of dataArray) {
            // Extract and process data
            const { url, zpid, address, city, state, zipcode, bedrooms, bathrooms, price, /* other fields */ } = data;

            const propertyToSave = {
                url, zpid, address, city, state, zipcode, bedrooms, bathrooms, price // Add other fields as needed
            };

            // Save property asynchronously (assuming saveProperty returns a promise)
            await saveProperty(propertyToSave);
            console.log('Property saved to MongoDB:', propertyToSave);
        }

        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Failed to handle webhook:', error);
        res.status(400).send('Bad Request: Invalid JSON');
    }
});




//* END OF TESTING PHASE 

/*
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
*/


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
/*
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

*/




const server = app.listen(port, () => {
    server.timeout = 7200000; // 120 minutes timeout (in milliseconds)
    console.log(`Server is running on http://localhost:${port}`);
});
