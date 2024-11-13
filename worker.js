const express = require('express');
const bodyParser = require('body-parser');
const { connectDB } = require('./src/config/mongodb');
const { checkPending } = require('./src/function/checkPending');
const { fetchData } = require('./src/function/fetchData');

// Create an Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.get('/tester', (req, res) => {
    res.send('Worker server is running!');
});

app.post('/process-snapshot', async (req, res) => {
    const snapshotId = req.body.snapshot_id;
    if (!snapshotId) {
        return res.status(400).json({ message: 'snapshot_id is required' });
    }

    console.log(`Received snapshot ID: ${snapshotId}`);

    try {
        await connectDB();
        const data = await fetchData(snapshotId);
        await checkPending(data, snapshotId);
        console.log(`Processed snapshot: ${snapshotId}`);
        res.status(200).json({ message: 'Processing completed' });
    } catch (error) {
        console.error('Error during processing:', error);
        res.status(500).json({ message: 'Failed to process snapshot', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Worker server is running on port ${PORT}`);
});
