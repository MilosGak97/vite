
const axios = require('axios');

// Function to send POST request to Bright Data API
async function sendPostRequest(link) {
    try {

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39', // Replace with your actual token
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'MyPropertyApp/1.0.0', // Replace with your application's identifier
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        };
        const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_lfqkr8wm13ixtbd8f5&endpoint=https://propertylisting-d1c1e167e1b1.herokuapp.com/webhook&format=json&uncompressed_webhook=false`;
        //*
        // The body should be an array of objects
        const body = [{ "url": link }]; // Wrap the link in an array




        const response = await axios.post(url2, body, { headers });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

// Function to send POST request to Bright Data API for multiple links
async function sendPostRequests2() {
    try {
        // Example usage with multiple links
        const links = [
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/',
            'https://www.zillow.com/homedetails/3358-Route-94-Hardyston-NJ-07419/39936089_zpid/',
            'https://www.zillow.com/homedetails/987-Buxton-Rd-Bridgewater-NJ-08807/39863486_zpid/',
            'https://www.zillow.com/homedetails/132-Selma-Blvd-Randolph-NJ-07869/39485868_zpid/',
            'https://www.zillow.com/homedetails/304-Fuller-Ter-Orange-NJ-07050/38727066_zpid/',
            'https://www.zillow.com/homedetails/2897-State-Route-138-Wall-Township-NJ-07719/39387900_zpid/',
            'https://www.zillow.com/homedetails/47-Carol-St-Ramsey-NJ-07446/38003139_zpid/',
            'https://www.zillow.com/homedetails/42-Oak-St-Lincoln-Park-NJ-07035/39436442_zpid/',
            'https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/',
            'https://www.zillow.com/homedetails/9-Farm-Meadows-Rd-Columbia-NJ-07832/40098282_zpid/'
            // Add more links as needed
        ];

        const url = 'https://api.brightdata.com/datasets/v3/trigger';
        const datasetId = "gd_lfqkr8wm13ixtbd8f5"; // Replace with your actual dataset ID
        const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webhook';
        const format = 'json';
        const uncompressedWebhook = false;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39', // Replace with your actual token
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'MyPropertyApp/1.0.0', // Replace with your application's identifier
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        };

        for (const link of links) {
            const body = [{ "url": link }]; // Wrap the link in an array

            const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${endpoint}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

            const response = await axios.post(url2, body, { headers });
            console.log(`Response for ${link}:`, response.data);

            // Optionally, add a delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
    } catch (error) {
        console.error('Error sending POST request:', error);
    }
}

module.exports = { sendPostRequests2, sendPostRequest };