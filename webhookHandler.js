const express = require('express');
const router = express.Router();

router.post('/webh', (req, res) => {
    console.log('Incoming POST request headers:', req.headers);
    console.log('Incoming POST request body:', req.body);
    // Process the data as needed
    res.status(200).send('Webhook received');
});

module.exports = router;
