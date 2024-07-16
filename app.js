const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;



// MongoDB URI
const uri = "mongodb+srv://milo:TheDVTN2020!!!@propertylistings.tdecqcu.mongodb.net/propertyListings?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let db;


const connectDB = async () => {
    if (!db) {
        try {
            await client.connect();
            db = client.db('propertyListings'); // Ensure correct case
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Could not connect to MongoDB", error);
            process.exit(1);
        }
    }
    return db.collection('properties'); // Ensure correct case
};

connectDB();

// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1mb' }));

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
        const collection = db.collection('properties'); // Use your collection name

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



// Start the server after successful DB connection
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});