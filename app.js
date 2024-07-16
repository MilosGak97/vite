const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const zlib = require('zlib');
const { connectDB, client } = require('./src/config/mongodb');

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
app.post('/webhook', async (req, res) => {
    try {
        console.log('Request body:', req.body);

        if (!Array.isArray(req.body)) {
            throw new Error('Request body is not an array');
        }

        const dataArray = req.body; // Assuming req.body is an array of objects
        const collection = client.db('propertyListings').collection('properties'); // Access collection through client

        // Save all properties to MongoDB
        await collection.insertMany(dataArray);

        console.log('Properties saved to MongoDB');
        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Failed to handle webhook:', error);
        res.status(400).send(`Bad Request: ${error.message}`);
    }
});

// Default route to handle other requests
app.get('/', (req, res) => {
    res.send('Hello, this is the Property Listings Webhook Service.');
});

// Handle invalid JSON
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        res.status(400).send({ error: 'Invalid JSON' });
    } else {
        next();
    }
});