const express = require('express');
const zlib = require('zlib');
const router = express.Router();
const axios = require('axios');


// Function to fetch data from Bright Data API
/*
async function fetchData() {
    const snapshotId = 's_lyosox91fhcaktoor';
    const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
    const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('Response data YEEEEEY:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // or handle gracefully
    }
}
*/



router.post('/webh', (req, res) => {
    let chunks = [];

    req.on('data', (chunk) => {
        chunks.push(chunk);
    });

    req.on('end', () => {
        const buffer = Buffer.concat(chunks);

        if (req.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(buffer, (err, decoded) => {
                if (err) {
                    console.error('Error decompressing gzip:', err);
                    return res.status(500).send('Error decompressing gzip');
                }

                try {

                    const body = JSON.parse(decoded.toString());

                    //console.log('Incoming POST request headers:', req.headers);
                    //console.log('Incoming POST request bodyAAAAAAAAAAAA:', body);
                    // console.log('ZPIDA:', body[0].zpid);
                    /* OVDE SI STAO, SVE JE SUPER, SADA CEPAJ U BAZU !!!!!!!!!!! */

                    // Process the data as needed
                    res.status(200).send('Webhook received');
                } catch (parseErr) {
                    console.error('Error parsing JSON:', parseErr);
                    res.status(400).send('Invalid JSON');
                }
            });
        } else {
            try {
                const body = JSON.parse(buffer.toString());
                console.log('Incoming POST request headers:', req.headers);
                console.log('Incoming POST request body:', body);
                // Process the data as needed
                res.status(200).send('Webhook received');
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
                res.status(400).send('Invalid JSON');
            }
        }
    });

    req.on('error', (err) => {
        console.error('Error receiving data:', err);
        res.status(500).send('Error receiving data');
    });
});

router.post('/webh2', (req, res) => {
    let chunks = [];

    req.on('data', (chunk) => {
        chunks.push(chunk);
    });

    req.on('end', () => {
        const buffer = Buffer.concat(chunks);

        if (req.headers['content-encoding'] === 'gzip') {
            zlib.gunzip(buffer, (err, decoded) => {
                if (err) {
                    console.error('Error decompressing gzip:', err);
                    return res.status(500).send('Error decompressing gzip');
                }

                try {
                    const body = JSON.parse(decoded.toString());
                    console.log('Incoming POST request headers:', req.headers);
                    console.log('Incoming POST request body:', body);
                    console.log('Incoming snapshot ID:', body.snapshotId);
                    // Process the data as needed
                    res.status(200).send('Webhook received');
                } catch (parseErr) {
                    console.error('Error parsing JSON:', parseErr);
                    res.status(400).send('Invalid JSON');
                }
            });
        } else {
            try {
                const body = JSON.parse(buffer.toString());
                console.log('Incoming POST request headers:', req.headers);
                console.log('Incoming POST request body:', body);
                // Process the data as needed
                res.status(200).send('Webhook received');
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
                res.status(400).send('Invalid JSON');
            }
        }
    });

    req.on('error', (err) => {
        console.error('Error receiving data:', err);
        res.status(500).send('Error receiving data');
    });
});

module.exports = router;



/*

curl -H "Authorization: Bearer API_TOKEN" "https://api.brightdata.com/datasets/v3/progress/snapshot_id"

curl -k "https://api.brightdata.com/datasets/v3/snapshot/s_lyorbdie241nwhztkq?format=json" -H "Authorization: Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39"


curl -X POST "https://api.brightdata.com/datasets/v3/trigger" \
-H "Authorization: Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39" \
-H "Content-Type: application/json" \
-d '{
  "dataset_id": "gd_lfqkr8wm13ixtbd8f5",
  "endpoint": "https://worker-847b6ac96356.herokuapp.com//webh",
  "format": "json",
  "uncompressed_webhook": false
}'
*/


// curl -k "https://api.brightdata.com/datasets/v3/snapshot/s_lyqxhv8i2dhnakw152?format=json" -H "Authorization: Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39"
