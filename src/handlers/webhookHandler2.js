// src/handlers/webhookHandler.js
const axios = require('axios');
const { client } = require('../config/mongodb');

const multiProperty = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        if (!Array.isArray(req.body)) {
            throw new Error('Request body is not an array');
        }

        const dataArray = req.body;
        const collection = client.db().collection('properties');

        for (let i = 0; i < dataArray.length; i++) {
            const propertyUrl = dataArray[i].url;
            const propertyData = await fetchDataFromAPI(propertyUrl);

            // Save each property to MongoDB
            await collection.insertOne(propertyData);

            console.log(`Property ${propertyData.propertyId} saved to MongoDB`);
        }

        console.log('All properties saved to MongoDB');
        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('Failed to handle webhook:', error);
        res.status(400).send(`Bad Request: ${error.message}`);
    }
};

const fetchDataFromAPI = async (propertyUrl) => {
    try {
        // Example: Fetch data from Bright Data API or another source based on the property URL
        const response = await axios.get(propertyUrl);

        // Example: Extract relevant data from the response
        const propertyData = {
            propertyId: response.data.propertyId,
            name: response.data.name,
            price: response.data.price,
            // Add more fields as needed
        };

        return propertyData;
    } catch (error) {
        console.error(`Failed to fetch data from ${propertyUrl}:`, error);
        throw error;
    }
};

module.exports = { multiProperty };
