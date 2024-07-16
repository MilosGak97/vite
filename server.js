const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const sendPostRequests = require('./sendPostRequests');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/', webhookHandler);

app.post('/trigger', sendPostRequests);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
