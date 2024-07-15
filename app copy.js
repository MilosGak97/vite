const express = require('express');
const bodyParser = require('body-parser');
const zlib = require('zlib');
const { saveProperty } = require('./propertyModel'); // Adjust path as needed

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1mb' }));

// Middleware to handle gzip encoded payloads
app.use((req, res, next) => {
    if (req.headers['content-encoding'] === 'gzip') {
        let chunks = [];
        req.on('data', chunk => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            zlib.gunzip(buffer, (err, decoded) => {
                if (err) {
                    console.error('Error decoding gzip data:', err);
                    return res.status(400).send('Bad Request: Invalid gzip data');
                }

                try {
                    req.body = JSON.parse(decoded.toString());
                    console.log('Decoded and parsed body:', req.body);
                    next();
                } catch (parseError) {
                    console.error('Failed to parse JSON:', parseError);
                    res.status(400).send('Bad Request: Invalid JSON');
                }
            });
        });
    } else {
        next();
    }
});

app.post('/webhook', (req, res) => {
    try {
        const dataArray = req.body; // Assuming req.body is an array of objects

        dataArray.forEach((data) => {
            // Extract and process data here
            // Example:
            const { url, zpid, address, city, state, zipcode, bedrooms, bathrooms, price } = data;

            // Prepare object to save to MongoDB (adjust as per your schema)
            const propertyToSave = {
                url, zpid, address, city, state, zipcode, bedrooms, bathrooms, price // Add more fields as needed
            };

            // Save property data to MongoDB
            saveProperty(propertyToSave);
            console.log('Property saved to MongoDB:', propertyToSave);
        });

        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Failed to handle webhook:', error);
        res.status(400).send('Bad Request: Invalid JSON');
    }
});

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
