const express = require('express');
const zlib = require('zlib');
const router = express.Router();

router.post('/webhook2', (req, res) => {
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
