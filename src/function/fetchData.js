const axios = require('axios');
const { client } = require('../config/mongodb');
const { checkPending } = require('./checkPending');

async function fetchData(snapshotId) {
    const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
    const url2 = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

    try {
        const response = await axios.get(url2, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        //console.log("THIS RESPONSE:", response.data);
        if (Array.isArray(response.data)) {
            console.log("Response is an array with length:", response.data.length);
        } else {
            console.log("Response is not an array");
        }
        console.log("Type of response.data:", typeof response.data);

        const responseSize = JSON.stringify(response.data).length;
        console.log("Size of JSON response in bytes:", responseSize);


        if (typeof response.data === 'object' && response.data !== null) {
            console.log("Response is an object with keys:", Object.keys(response.data));
        }

        await checkPending(response.data);

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // or handle gracefully
    }

}

module.exports = { fetchData };
