const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const sendPostRequests = require('./sendPostRequests');
const sendPostRequests2 = require('./sendPostRequests2');
const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const path = require('path');



const app = express();
const port = process.env.PORT || 3000;

connectDB();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/public')); // Set views directory

// Use body-parser for JSON
app.use(bodyParser.json());



app.use(express.static(path.join(__dirname, 'src/public')));

// Use the webhook handler
app.use('/', webhookHandler);
// Endpoint to trigger sendPostRequests
app.post('/trigger', sendPostRequests);

// Endpoint to trigger sendPostRequests
app.post('/trigger2', sendPostRequests2);

// Define routes
app.get('/dashboard', (req, res) => {
    res.render('index.ejs');
});

app.get('/filtering', (req, res) => {
    res.render('filtering.ejs');
});
/*
app.get('/listings', async (req, res) => {

    // Middleware to parse JSON and form data
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    try {
        const database = await connectDB(); // Ensure the database connection is established
        const propertiesCollection = database.collection('properties');

        // Modify the query to filter for records with verified as "Full" or "NoData"
        const query = {
            verified: { $in: ["Full", "NoData"] }
        };

        const properties = await propertiesCollection.find(query).toArray();
        res.render('listings', { properties });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }

});
*/

app.get('/listings', async (req, res) => {
    try {
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        // Get query parameters
        const { state, date_start, date_end, forsale, comingsoon, pending } = req.query;

        // Build query object
        let query = {
            verified: { $in: ["Full", "NoData"] }
        };

        // Add state filter if provided
        if (state) {
            query.state = state;
        }

        // Add date range filter if provided
        if (date_start && date_end) {
            query.current_status_date = {
                $gte: new Date(date_start),
                $lte: new Date(date_end)
            };
        } else if (date_start) {
            query.current_status_date = { $gte: new Date(date_start) };
        } else if (date_end) {
            query.current_status_date = { $lte: new Date(date_end) };
        }

        // Add status filter if provided
        const statusFilters = [];
        if (forsale) statusFilters.push("ForSale");
        if (comingsoon) statusFilters.push("ComingSoon");
        if (pending) statusFilters.push("Pending");

        if (statusFilters.length > 0) {
            query.current_status = { $in: statusFilters };
        }

        // Fetch filtered properties
        const properties = await propertiesCollection.find(query).toArray();
        res.render('listings', { properties });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/shipping', (req, res) => {
    res.render('shipping.ejs');
});

app.get('/skiptracing', (req, res) => {
    res.render('skiptracing.ejs');
});

app.get('/scrapper', (req, res) => {
    res.render('scrapper.ejs');
});

app.get('/pull', async (req, res) => {
    console.log("PULL REQUEST START HERE");
    async function fetchData() {
        const snapshotId = 's_lyqc3q52p9qgunwyd';
        const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
        const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            console.log('Response dataYEEEEEY:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error; // or handle gracefully
        }
    }

    try {
        const data = await fetchData();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// s_lyqxhv8i2dhnakw152