// src/handlers/webhookHandler.js
const axios = require('axios');
const { client } = require('../config/mongodb');

const bodyParser = require('body-parser');


const multiProperty = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        if (!Array.isArray(req.body)) {
            throw new Error('Request body is not an array');
        }

        const dataArray = req.body;
        const collection = client.db().collection('properties');

        // Iterate through each property URL with a 1-second delay
        for (let i = 0; i < dataArray.length; i++) {
            const propertyUrl = dataArray[i].input.url;
            const propertyData = await fetchDataFromAPI(propertyUrl);

            // Save each property to MongoDB
            await collection.insertOne(propertyData);

            console.log(`Property ${propertyData.propertyId} saved to MongoDB`);

            // Delay for 1 second before processing the next URL
            if (i < dataArray.length - 1) {
                await delay(1000); // 1000 milliseconds = 1 second
            }
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { multiProperty };



/* URL FORMATION
[
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },
      {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
        ,  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    },  {
        "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale"
    },
    {
        "url": "https://www.zillow.com/homedetails/76-Main-St-Califon-NJ-07830/38834410_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/122-Market-St-Bangor-PA-18013/10090342_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/107-Cortland-Ln-Bedminster-NJ-07921/39835158_zpid/"
    },
    {
        "url": "https://www.zillow.com/homedetails/19-Pine-Woods-Ct-Reading-PA-19607/8872791_zpid/"
    }
]
    */