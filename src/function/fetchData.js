
const { client } = require('../config/mongodb');
const { checkPending } = require('./src/function/checkPending');

async function fetchData(snapshotId) {
    const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
    const url2 = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

    while (true) {
        try {
            const response = await axios.get(url2, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data.status === 'running') {
                console.log('Snapshot is not ready yet, trying again in 10 seconds...');
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
            } else {
                console.log('Response data2:', response.data);

                await checkPending(response.data, snapshotId);

                return response.data;

            }
        } catch (error) {
            throw error; // or handle gracefully
        }
    }
}


module.exports = { fetchData };