const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const sendPostRequests = require('./sendPostRequests');
const sendPostRequests2 = require('./sendPostRequests2');
const sendPostRequests3 = require('./getSnapshotData');
const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const path = require('path');
const { parse } = require('json2csv');




const app = express();
const port = process.env.PORT || 3000;

connectDB();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/public')); // Set views directory


// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON bodies (if needed)
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'src/public')));

// Use the webhook handler
app.use('/', webhookHandler);
// Endpoint to trigger sendPostRequests
app.post('/trigger', sendPostRequests);

// Endpoint to trigger sendPostRequests
app.post('/trigger2', sendPostRequests2);

// Endpoint to trigger sendPostRequests 

// Define routes
app.get('/dashboard', (req, res) => {
    res.render('index.ejs');
});

// Endpoint to export properties as CSV
app.get('/export-csv', async (req, res) => {
    try {
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        // Get query parameters
        const { state, date_start, date_end, forsale, comingsoon, pending } = req.query;

        // Build query object
        let query = {
            verified: { $in: ["Full", "NoPhotos"] }
        };

        // Add state filter if provided
        if (state) {
            query.state = state;
        }

        // Add date range filter if provided
        if (date_start && date_end) {
            query.current_status_date = {
                $gte: new Date(date_start),
                $lt: new Date(new Date(date_end).getTime() + 24 * 60 * 60 * 1000) // Add one day to end date to make it inclusive
            };
        } else if (date_start) {
            query.current_status_date = { $gte: new Date(date_start) };
        } else if (date_end) {
            query.current_status_date = {
                $lt: new Date(new Date(date_end).getTime() + 24 * 60 * 60 * 1000) // Add one day to end date to make it inclusive
            };
        }

        // Add status filter if provided
        const statusFilters = [];
        if (forsale) statusFilters.push("ForSale");
        if (comingsoon) statusFilters.push("ComingSoon");
        if (pending) statusFilters.push("Pending");

        if (statusFilters.length > 0) {
            query.current_status = { $in: statusFilters };
        }

        const properties = await propertiesCollection.find(query).toArray();

        // Define the fields you want to include in the CSV
        const fields = ['address', 'city', 'state', 'zipcode', 'owner_fullname'];

        // Function to generate owner_fullname based on owners array
        // Function to generate owner_fullname based on owners array
        const generateOwnerFullname = (owners) => {
            if (!owners || owners.length === 0) {
                return 'No Data';
            }

            const owner = owners[0];
            const ownerName = owner.ownerName && owner.ownerName !== "Undefined" ? owner.ownerName : "";
            const firstName = owner.firstName !== "Undefined" ? owner.firstName : "";
            const middleName = owner.middleName && owner.middleName !== "Undefined" ? owner.middleName : "";
            const lastName = owner.lastName !== "Undefined" ? owner.lastName : "";

            if (ownerName) {
                return ownerName; // Display ownerName if available
            } else if (firstName || middleName || lastName) {
                return `${firstName} ${middleName} ${lastName}`.trim();
            } else {
                return 'No Data';
            }
        };

        // Map properties to include only the specified fields and generate owner_fullname
        const filteredProperties = properties.map(property => {
            return {
                address: property.address,
                city: property.city,
                state: property.state,
                zipcode: property.zipcode,
                owner_fullname: generateOwnerFullname(property.owners)
            };
        });

        // Convert filtered properties to CSV format
        const csv = parse(filteredProperties, { fields });



        console.log(csv); // or save the CSV to a file

        // Send CSV file as response
        res.header('Content-Type', 'text/csv');
        res.attachment('properties.csv');
        res.send(csv);
    } catch (error) {
        console.error("Error exporting properties:", error);
        res.status(500).send("Internal Server Error");
    }
});




app.get('/filtering', async (req, res) => {
    try {
        const database = await connectDB();
        const Property = database.collection('properties');

        // Fetch one property with 'verified' field as null  
        const property = await Property.findOne({ verified: null });

        if (property) {
            // Convert photo strings to arrays if needed
            if (typeof property.photo === 'string') {
                try {
                    property.photo = JSON.parse(property.photo);
                } catch (e) {
                    console.error('Error parsing photos JSON:', e);
                    property.photo = [];
                }
            }

            // Extract the first 15 photos and the rest
            const propertyFirst15 = property.photo.slice(0, 15);
            const propertyOtherPhoto = property.photo.slice(15);

            // Extract the zpid
            const PropertyZpid = property.zpid;

            // Render the EJS template with property data
            res.render('filtering', { propertyFirst15, propertyOtherPhoto, PropertyZpid });
        } else {
            // Handle the case where no property was found
            res.render('filtering', { propertyFirst15: [], propertyOtherPhoto: [], PropertyZpid: null });
        }
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/update-verified/:zpid', async (req, res) => {

    try {
        const { zpid } = req.params;
        const { verified } = req.body;

        console.log('Received ZPID:', zpid);
        console.log('Received Verified:', verified);

        if (verified === undefined) {
            console.error('Error: Verified field is undefined');
            return res.status(400).send('Invalid form submission');
        }
        console.log("Verified: ", verified);


        const database = await connectDB();
        const Property = database.collection('properties');
        if (verified === "Full" || verified === "NoPhotos") {


            const getAddress = await Property.findOne(
                { zpid: Number(zpid) }
            )

            const fullAddress = `${getAddress.address} ${getAddress.city}, ${getAddress.state} ${getAddress.zipcode}`;
            console.log(fullAddress);

            // Encode the full address for the URL
            const encodedAddress = encodeURIComponent(fullAddress);


            // Initialize owners array
            let formattedOwners = [];

            try {
                // Send the request to the Precisely API
                const response = await axios.get(`https://api.precisely.com/property/v2/attributes/byaddress?address=${encodedAddress}&attributes=owners`, {
                    headers: {
                        'Authorization': 'Bearer SHxoIFrmTCE9HTlue9HMDvqkua6g', // Replace with your actual Bearer token
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                });

                console.log("API RESULT: ", response.data);

                let companyOwned = false; // Initialize the flag

                // Function to check if a string contains any of the keywords
                const containsKeywords = (str) => {
                    const keywords = ["LLC", "BANK", "TRUST"];
                    return keywords.some(keyword => str.toUpperCase().includes(keyword));
                };

                // Format owner details and check for keywords
                formattedOwners = owners.map(owner => {
                    const firstName = owner.firstName || 'Undefined';
                    const middleName = owner.middleName || 'Undefined';
                    const lastName = owner.lastName || 'Undefined';
                    const ownerName = owner.ownerName || 'Undefined';

                    // Check if any of the fields contain the keywords
                    if (containsKeywords(firstName) || containsKeywords(middleName) || containsKeywords(lastName) || containsKeywords(ownerName)) {
                        companyOwned = true;
                    }

                    return {
                        firstName,
                        middleName,
                        lastName,
                        ownerName
                    };
                });

            } catch (apiError) {
                console.error('Error fetching property data from API:', apiError.response ? apiError.response.data : apiError.message);

                // Set default values if API request fails
                formattedOwners = [{
                    firstName: 'Undefined',
                    lastName: 'Undefined'
                }];
            }


            console.log("Formatted Owners: ", formattedOwners);
            const updateResult = await Property.updateOne(
                { zpid: Number(zpid) }, // Ensure zpid is a number
                { $set: { owners: formattedOwners, verified: verified } }
            );

            if (updateResult.modifiedCount === 0) {
                console.error('Error updating property: No documents matched the query');
                return res.status(404).send('Property not found');
            }

        } else {
            const updateResult = await Property.updateOne(
                { zpid: Number(zpid) }, // Ensure zpid is a number
                { $set: { verified: verified } }
            );
            if (updateResult.modifiedCount === 0) {
                console.error('Error updating property: No documents matched the query');
                return res.status(404).send('Property not found');
            }


        }
        res.redirect('/filtering');
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/listings', async (req, res) => {
    try {
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        // Get query parameters
        const { state, date_start, date_end, forsale, comingsoon, pending } = req.query;

        // Build query object
        let query = {
            verified: { $in: ["Full", "NoPhotos"] }
        };

        // Add state filter if provided
        if (state) {
            query.state = state;
        }

        // Add date range filter if provided
        if (date_start && date_end) {
            query.current_status_date = {
                $gte: new Date(date_start),
                $lt: new Date(new Date(date_end).getTime() + 24 * 60 * 60 * 1000) // Add one day to end date to make it inclusive
            };
        } else if (date_start) {
            query.current_status_date = { $gte: new Date(date_start) };
        } else if (date_end) {
            query.current_status_date = {
                $lt: new Date(new Date(date_end).getTime() + 24 * 60 * 60 * 1000) // Add one day to end date to make it inclusive
            };
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
        const totalResults = properties.length;

        // Render the template with parameters
        res.render('listings', {
            properties,
            state,
            date_start,
            date_end,
            forsale: forsale || undefined,
            comingsoon: comingsoon || undefined,
            pending: pending || undefined,
            totalResults // Pass totalResults to the EJS template
        });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }
});

// server.js or app.js



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