const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const zlib = require('zlib');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a Mongoose schema and model for the properties
const propertySchema = new mongoose.Schema({
    url: String,
    zpid: String,
    address: String,
    city: String,
    state: String,
    zipcode: String,
    bedrooms: Number,
    bathrooms: Number,
    price: Number,
    // Add more fields as needed
});

const Property = mongoose.model('Property', propertySchema);

// Middleware to handle gzip encoded payloads
app.use((req, res, next) => {
    if (req.headers['content-encoding'] === 'gzip') {
        let chunks = [];
        req.on('data', (chunk) => {
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

// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1mb' }));

app.post('/webhook', async (req, res) => {
    try {
        const dataArray = req.body; // Assuming req.body is an array of objects
        console.log("DATA ARRAY: ", dataArray);

        for (let data of dataArray) {
            // Extract and process data
            const { url, zpid, address, city, state, zipcode, bedrooms, bathrooms, price } = data;

            const propertyToSave = new Property({
                url, zpid, address, city, state, zipcode, bedrooms, bathrooms, price // Add other fields as needed
            });

            // Save property asynchronously
            await propertyToSave.save();
            console.log('Property saved to MongoDB:', propertyToSave);
        }

        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Failed to handle webhook:', error);
        res.status(400).send('Bad Request: Invalid JSON');
    }
});

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
