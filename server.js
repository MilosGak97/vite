const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const sendPostRequests = require('./sendPostRequests');
const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');


const app = express();
const port = process.env.PORT || 3000;

// Use body-parser for JSON
app.use(bodyParser.json());

// Use the webhook handler
app.use('/', webhookHandler);

// Endpoint to trigger sendPostRequests
app.post('/trigger', sendPostRequests);

// Endpoint to trigger sendPostRequests
app.post('/trigger2', sendPostRequests2);


app.get('/pull', async (req, res) => {
    console.log("PULL REQUEST START HERE");
    async function fetchData() {
        const snapshotId = 's_lyqc3q52p9qgunwyd';
        const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
        const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            console.log('Response dataYEEEEEY:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error; // or handle gracefully
        }
    }

    try {
        const data = await fetchData();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// s_lyqcle8xcffyidjcs