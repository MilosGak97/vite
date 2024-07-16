const axios = require('axios');

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



async function sendPostRequests(req, res) {
    try {
        const body = [{ "url": "https://www.zillow.com/homedetails/2506-Gordon-Cir-South-Bend-IN-46635/77050198_zpid/?t=for_sale" }];

        const datasetId = "gd_lfqkr8wm13ixtbd8f5";
        const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webh';
        const format = 'json';
        const uncompressedWebhook = false;
        const headers = {
            'Content-Type': 'application/gzip',
            'dca-collection-id': 's_lyokoc2y2led7hycvu',
            'content-encoding': 'gzip',
            'dca-dataset': 'true',
            'User-Agent': 'BRD dca-ds-delivery-worker/1.473.306',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39'
        };

        const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${encodeURIComponent(endpoint)}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

        const response = await axios.post(url, body, { headers });
        console.log(`Response for ${body[0].url}:`, response.data.snapshot_id);


        // Introducing a delay of 10 seconds
        setTimeout(async () => {
            const snapshotId = response.data.snapshot_id;
            await fetchData(snapshotId);
        }, 10000); // 10 seconds delay
        /* test */

        /* end test */
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error sending POST request:', error);
        res.status(500).json({ error: 'Failed to send POST request' });
    }
}

module.exports = sendPostRequests;
