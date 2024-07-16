const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const sendPostRequests = require('./sendPostRequests');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Use body-parser for JSON
app.use(bodyParser.json());

// Use the webhook handler
app.use('/', webhookHandler);

// Endpoint to trigger sendPostRequests
app.post('/trigger', sendPostRequests);

// Function to fetch data from Bright Data API
async function fetchData(snapshotId) {
    const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
    const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // or handle gracefully
    }
}

// Endpoint to trigger fetchData on GET /trigger2
app.get('/trigger2', async (req, res) => {
    try {
        const data = await fetchData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error triggering fetchData:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});





app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
