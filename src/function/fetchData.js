
const { client } = require('../config/mongodb');
const { checkPending } = require('./checkPending');

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

            console.log("THIS RESPONE:", response.data);

            await checkPending(response.data, snapshotId);
        } catch (error) {
            throw error; // or handle gracefully
        }
    }
}


module.exports = { fetchData };