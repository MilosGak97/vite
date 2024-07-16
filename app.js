const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB URI
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

// Connect to MongoDB
client.connect(err => {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
    db = client.db('propertyListings');
    console.log('Connected to MongoDB');
});

// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1mb' }));

// Webhook endpoint
app.post('/webhook', async (req, res) => {
    try {
        const dataArray = req.body; // Assuming req.body is an array of objects
        console.log("DATA ARRAY: ", dataArray);

        const collection = db.collection('properties'); // Use your collection name

        // Save all properties to MongoDB
        await collection.insertMany(dataArray);

        console.log('Properties saved to MongoDB');
        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Failed to handle webhook:', error);
        res.status(400).send('Bad Request: Invalid JSON');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
