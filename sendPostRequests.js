const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
//const { checkIfZpidExists } = require('./src/function/checkIfZpidExists');


const processUrl = async (urls) => {
    const body = urls.map(urlObj => ({ url: urlObj.url }));


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

    const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${encodeURIComponent(endpoint)}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

    try {
        const response = await axios.post(url2, body, { headers });
        console.log(`Started:`, response.data.snapshot_id);

        const snapshotId = response.data.snapshot_id;
        const collection = client.db().collection('snapshotsPending');

        const snapshotData = {
            snapshot_id: snapshotId,
            requested_time: new Date()
        };
        await collection.insertOne(snapshotData);

        // await fetchData(snapshotId);
    } catch (error) {
        console.error('Error sending data:', error);
    }

    return body;
};

 

module.exports = processUrl;
