// src/handlers/webhookHandler.js
const { client } = require('../config/mongodb');

const singleWebhook = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        if (!Array.isArray(req.body)) {
            throw new Error('Request body is not an array');
        }

        const dataArray = req.body;
        const collection = client.db().collection('properties');

        // Process your Bright Data API integration here
        // Example: fetch data from Bright Data API and save to MongoDB
        // Replace with your actual Bright Data API integration logic

        await collection.insertMany(dataArray);

        console.log('Properties saved to MongoDB');
        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Failed to handle webhook:', error);
        res.status(400).send(`Bad Request: ${error.message}`);
    }
};

module.exports = { singleWebhook };
