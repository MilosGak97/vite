const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const zlib = require('zlib');
const { connectDB } = require('./src/config/mongodb');

const app = express();
const port = process.env.PORT || 3000;





connectDB();

// Middleware to parse JSON bodies with a size limit of 1MB
app.use(bodyParser.json({ limit: '1mb' }));


// Middleware to handle gzip decompression
app.use((req, res, next) => {
    if (req.headers['content-encoding'] === 'gzip') {
        let buf = Buffer.from('');
        req.on('data', (chunk) => {
            buf = Buffer.concat([buf, chunk]);
        });
        req.on('end', () => {
            zlib.gunzip(buf, (err, decoded) => {
                if (err) {
                    console.error('Error decoding gzip content:', err);
                    return res.status(400).send('Bad Request: Error decoding gzip content');
                }
                try {
                    req.body = JSON.parse(decoded.toString());
                    next();
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    return res.status(400).send('Bad Request: Error parsing JSON');
                }
            });
        });
    } else {
        next();
    }
});



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