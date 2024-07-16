const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const sendPostRequests = require('./sendPostRequests');


const app = express();
const port = process.env.PORT || 3000;

// Use body-parser for JSON
app.use(bodyParser.json());

// Use the webhook handler
app.use('/', webhookHandler);

// Endpoint to trigger sendPostRequests
app.post('/trigger', sendPostRequests);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
