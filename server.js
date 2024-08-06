const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const processUrl = require('./sendPostRequests');
const sendPostRequests2 = require('./sendPostRequests2');
const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const path = require('path');
const { parse } = require('json2csv');
const moment = require('moment'); // To handle date operations
const tokenManager = require('./tokenManager');
const cron = require('node-cron');
const { checkIfZpidExists } = require('./src/function/checkIfZpidExists');
const { fetchData } = require('./src/function/fetchData');
const { checkPending } = require('./src/function/checkPending');

const { ObjectId } = require('mongodb');



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
app.post('/trigger', async (req, res) => {
    try {

        const body = [
            "https://www.zillow.com/homedetails/13-Delaware-Ct-APT-D-Matawan-NJ-07747/61841735_zpid/",
            "https://www.zillow.com/homedetails/1801-Wrangler-Ave-Marlboro-NJ-07746/2055042801_zpid/",
            "https://www.zillow.com/homedetails/30-Coventry-Rd-Hamburg-NJ-07419/338464562_zpid/",
            "https://www.zillow.com/homedetails/308-Saw-Mill-Rd-North-Haledon-NJ-07508/39746423_zpid/",
            "https://www.zillow.com/homedetails/90-Prospect-Ave-APT-5C-Hackensack-NJ-07601/67880563_zpid/",
            "https://www.zillow.com/homedetails/42-Overlook-Ave-Haledon-NJ-07508/402396101_zpid/",
            "https://www.zillow.com/homedetails/278-N-4th-St-Paterson-NJ-07522/39752869_zpid/",
            "https://www.zillow.com/homedetails/201-Luis-M-Marin-Blvd-UNIT-1307-Jersey-City-NJ-07302/2069581675_zpid/",
            "https://www.zillow.com/homedetails/19-Lauren-Ln-Sussex-NJ-07461/39965763_zpid/",
            "https://www.zillow.com/homedetails/48-Haven-Ave-Bergenfield-NJ-07621/37852507_zpid/"
        ];

        if (!Array.isArray(body)) {
            return res.status(400).json({ error: 'URLs should be an array' });
        }

        for (const url of body) {
            await processUrl(url); // Process each URL
        }

        res.status(200).json({ message: 'All URLs processed successfully.' });
    } catch (error) {
        console.error('Error processing URLs:', error);
        res.status(500).json({ error: 'Failed to process URLs' });
    }
});

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
        const shippingsCollection = database.collection('shippings');

        // Convert snapshot_id to ObjectId
        const objectId = new ObjectId('66b0a768f61059ddfaf44f37');


        const filteringQuery = {

            verified: { $in: ["NoPhotos", "Full"] },
            companyOwned: { $in: [null, false] },
            $or: [
                { current_status: "ForSale", for_sale_reachout: { $exists: false } },
                { current_status: "ForSale", for_sale_reachout: null },
                { current_status: "ComingSoon", coming_soon_reachout: { $exists: false } },
                { current_status: "ComingSoon", coming_soon_reachout: null },
                { current_status: "Pending", pending_reachout: { $exists: false } },
                { current_status: "Pending", pending_reachout: null },
            ],

            branch: { $in: ["TX", "NJ"] },

        };

        const properties = await propertiesCollection.find(filteringQuery).toArray();

        // Define the fields you want to include in the CSV
        const fields = ['owner_fullname', 'current_resident', 'address', 'city', 'state', 'zipcode'];


        // Function to generate owner_fullname based on owners array
        const generateOwnerFullname = (owners) => {
            if (!owners || owners.length === 0) {
                return '';
            }

            const owner = owners[0];
            const ownerName = owner.ownerName && owner.ownerName !== "Undefined" ? owner.ownerName : "";
            const firstName = owner.firstName && owner.firstName !== "Undefined" ? owner.firstName : "";
            const middleName = owner.middleName && owner.middleName !== "Undefined" ? owner.middleName : "";
            const lastName = owner.lastName && owner.lastName !== "Undefined" ? owner.lastName : "";

            if (ownerName) {
                return ownerName; // Display ownerName if available
            } else {
                // Trim the input to remove extra spaces
                const firstNameTrimmed = firstName.trim();
                const middleNameTrimmed = middleName.trim();
                const lastNameTrimmed = lastName.trim();

                // Check if the parts are non-empty
                const nameParts = [firstNameTrimmed, middleNameTrimmed, lastNameTrimmed].filter(part => part.length > 0);

                // Count the number of parts
                const namePartsCount = nameParts.length;

                // Check if any part contains more than one word
                const hasMultipleWords = nameParts.some(part => part.split(' ').length > 1);

                // If only one part is provided and it doesn't have multiple words, return "Current Resident"
                if (namePartsCount === 1 && !hasMultipleWords) {
                    return 'Current Resident';
                } else if (namePartsCount > 0) {
                    // Concatenate and trim the name parts
                    return nameParts.join(' ').trim();
                } else {
                    return '';
                }
            }
        };
        // Map properties to include only the specified fields and generate owner_fullname
        const filteredProperties = properties.map(property => {
            let owner_fullname = generateOwnerFullname(property.owners);
            let current_resident = "Or Current Resident";

            if (owner_fullname === '') {
                owner_fullname = "Current";
                current_resident = "Resident";
            }
            function formatZipcode(property) {
                if (property.zipcode !== undefined) {
                    // Convert zipcode to a string if it is not already
                    let zipcode = property.zipcode.toString();

                    // Check the length of the zipcode and format if necessary
                    if (zipcode.length === 4) {
                        property.zipcode = '0' + zipcode;
                    } else {
                        property.zipcode = zipcode; // Ensure it's stored as a string
                    }
                } else {
                    property.zipcode = ''; // Set a default value if zipcode is undefined
                }
                return property;
            }
            let zipcode = formatZipcode(property.zipcode);

            return {
                owner_fullname: owner_fullname,
                current_resident: current_resident,
                address: property.address,
                city: property.city,
                state: property.state,
                zipcode: zipcode
            };
        });

        // Create a new shipping document
        const shippingDate = new Date().toISOString().split('T')[0];
        const shippingDocument = {
            created_at: new Date(),
            shipping_date: shippingDate,
            total_count: properties.length
        };

        const shippingResult = await shippingsCollection.insertOne(shippingDocument);
        const shippingId = shippingResult.insertedId;

        // Update properties with the new shippingId in the appropriate field
        for (const property of properties) {
            let updateField;
            if (property.current_status === 'ForSale') {
                updateField = 'for_sale_reachout';
            } else if (property.current_status === 'ComingSoon') {
                updateField = 'coming_soon_reachout';
            } else if (property.current_status === 'Pending') {
                updateField = 'pending_reachout';
            }

            if (updateField) {
                await propertiesCollection.updateOne(
                    { _id: property._id },
                    { $set: { [updateField]: shippingId } }
                );
            }
        }

        // Convert filtered properties to CSV format
        const csv = parse(filteredProperties, { fields });
        // Add the header row
        const header = 'owner_fullname,current_resident,address,city,state,zipcode\n';
        const csvWithHeader = header + csv;

        console.log(csvWithHeader); // or save the CSV to a file

        // Send CSV file as response
        res.header('Content-Type', 'text/csv');
        let filename = `Postcards_${shippingDate}_ID_${shippingId}.csv`; // Adjust the file extension as needed
        res.attachment(filename);
        res.send(csvWithHeader);
    } catch (error) {
        console.error("Error exporting properties:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/filtering', async (req, res) => {
    try {
        const database = await connectDB();
        const Property = database.collection('properties');

        const query = {
            verified: null,
            initial_scrape: { $exists: false }
        }
        const totalCount = await Property.countDocuments(query)

        const property = await Property.findOne(query);

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
            res.render('filtering', { propertyFirst15, propertyOtherPhoto, PropertyZpid, totalCount });
        } else {
            // Handle the case where no property was found
            res.render('filtering', { propertyFirst15: [], propertyOtherPhoto: [], PropertyZpid: null, totalCount: 0 });
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
            let companyOwned = false; // Initialize the flag

            try {
                // Send the request to the Precisely API
                const response = await axios.get(`https://api.precisely.com/property/v2/attributes/byaddress?address=${encodedAddress}&attributes=owners`, {
                    headers: {
                        'Authorization': `Bearer ${tokenManager.accessTokenPrecisely}`, // Replace with your actual Bearer token
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                });

                console.log("API RESULT: ", response.data);

                // Extract owner details
                const owners = response.data.propertyAttributes.owners;


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
                { $set: { owners: formattedOwners, verified: verified, companyOwned: companyOwned } }
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


app.get('/fix/:zpid', async (req, res) => {
    const { zpid } = req.params;

    try {
        // Connect to the database
        const database = await connectDB();
        const Property = database.collection('properties');

        // Update the verified field to null
        const updateResult = await Property.updateOne(
            { zpid: Number(zpid) }, // Ensure zpid is a number
            { $set: { verified: null } }
        );

        if (updateResult.modifiedCount === 0) {
            console.error('Error updating property: No documents matched the query');
            return res.status(404).send('Property not found');
        }

        res.status(200).send('Property verified field updated to null successfully');
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send('An error occurred while updating the property');
    }
});

app.get('/fixing', async (req, res) => {
    res.render("fixing.ejs");
})

app.post('/fixing-updateOne', async (req, res) => {
    let client;
    try {
        // Convert snapshot_id to ObjectId
        const objectId = new ObjectId('66ad0330404ca0cf27a3597b');

        const filteringQuery = {
            $or: [
                { pending_reachout: objectId },
                { coming_soon_reachout: objectId },
                { for_sale_reachout: objectId }
            ]
        };

        // Connect to the database
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        const properties = await propertiesCollection.find(filteringQuery).toArray();

        for (const property of properties) {
            let updateQuery = {};
            if (property.pending_reachout && ObjectId.isValid(property.pending_reachout) && new ObjectId(property.pending_reachout).equals(objectId)) {
                updateQuery = { $unset: { pending_reachout: "" } };
            } else if (property.coming_soon_reachout && ObjectId.isValid(property.coming_soon_reachout) && new ObjectId(property.coming_soon_reachout).equals(objectId)) {
                updateQuery = { $unset: { coming_soon_reachout: "" } };
            } else if (property.for_sale_reachout && ObjectId.isValid(property.for_sale_reachout) && new ObjectId(property.for_sale_reachout).equals(objectId)) {
                updateQuery = { $unset: { for_sale_reachout: "" } };
            }

            if (Object.keys(updateQuery).length > 0) {
                try {
                    await propertiesCollection.updateOne(
                        { _id: property._id },
                        updateQuery
                    );
                    console.log(`Updated property ${property._id}`);
                } catch (updateError) {
                    console.error(`Error updating property ${property._id}:`, updateError);
                }
            }
        }

        res.send('Properties updated successfully');
    } catch (error) {
        console.error('Error updating properties:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (client) {
            client.close();
        }
    }
});

app.post('/fetchbysnapshotid', async (req, res) => {
    const { snapshot_id, branch } = req.body;
    async function fetchData(snapshot_id, branch) {
        const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
        const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshot_id}?format=json`;

        while (true) {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.data.status === 'running') {
                    console.log(snapshot_id, ': Not ready yet, trying again in 10 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
                } else {
                    console.log('Response data:', response.data);
                    await listAllListings(response.data, branch, snapshot_id);
                    return response.data;
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                throw error; // or handle gracefully
            }
        }
    }
    async function listAllListings(data, branch, snapshot_id) {
        try {

            if (Array.isArray(data)) {
                const dataArray = data;
                const collection = client.db().collection('properties');

                // Logging individual items and inserting into MongoDB
                for (let i = 0; i < dataArray.length; i++) {
                    const listing = dataArray[i];
                    const photos = dataArray[i].photos;
                    let duplicateCount = 0;  // Counter for duplicates
                    const exists = await checkIfZpidExists(listing.zpid);
                    if (exists) {
                        duplicateCount++;
                        // Handle the case where the property already exists
                        continue;
                    } else {
                        if (branch === listing.state) {
                            // Handle the case where the property does not exist
                            const extractPhotoUrls = (photos) => {
                                if (!photos || !Array.isArray(photos)) {
                                    return [];
                                }

                                return photos.flatMap(photo =>
                                    photo.mixedSources.jpeg
                                        .filter(jpeg => jpeg.width === 576)
                                        .map(jpeg => jpeg.url)
                                );
                            };

                            const photoUrls = extractPhotoUrls(photos);
                            const photoCount = listing.photoCount;
                            const hdpTypeDimension = listing.hdpTypeDimension;
                            let for_sale;
                            let for_sale_date;
                            let for_sale_reachout;
                            let coming_soon;
                            let coming_soon_date;
                            let coming_soon_reachout;
                            let pending;
                            let pending_date;
                            let pending_reachout;
                            let verified;
                            let companyOwned;
                            let current_status;
                            let current_status_date;
                            let formattedOwners = [];
                            let notes;

                            if (hdpTypeDimension === "ForSale") {
                                for_sale = "Yes";
                                for_sale_date = new Date();
                                current_status_date = for_sale_date;
                            }

                            if (hdpTypeDimension === "Pending") {
                                pending = "Yes";
                                pending_date = new Date();
                                current_status_date = pending_date;
                            }
                            if (hdpTypeDimension === "ComingSoon") {
                                coming_soon = "Yes";
                                coming_soon_date = new Date();
                                current_status_date = coming_soon_date;
                            }
                            current_status = hdpTypeDimension;


                            if (photoCount < 5) {
                                verified = "NoPhotos";

                                const fullAddress = `${listing.address.streetAddress} ${listing.city}, ${listing.state} ${listing.zipcode}`;
                                console.log(fullAddress);

                                // Encode the full address for the URL
                                const encodedAddress = encodeURIComponent(fullAddress);


                                try {
                                    // Send the request to the Precisely API
                                    const response = await axios.get(`https://api.precisely.com/property/v2/attributes/byaddress?address=${encodedAddress}&attributes=owners`, {
                                        headers: {
                                            'Authorization': `Bearer ${tokenManager.accessTokenPrecisely}`, // Replace with your actual Bearer token
                                            'Content-Type': 'application/json; charset=utf-8'
                                        }
                                    });

                                    console.log("API RESULT: ", response.data);
                                    // Extract owner details
                                    const owners = response.data.propertyAttributes.owners;

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
                            }

                            const propertyData = {
                                url: listing.url,
                                zpid: listing.zpid,
                                address: listing.address.streetAddress,
                                city: listing.city,
                                state: listing.state,
                                zipcode: listing.zipcode,
                                bedrooms: listing.bedrooms,
                                bathrooms: listing.bathrooms,
                                sqft: listing.livingArea,
                                price: listing.price,
                                longitude: listing.longitude,
                                latitude: listing.latitude,
                                hasBadGeocode: listing.hasBadGeocode,
                                homeType: listing.homeType,
                                isNonOwnerOccupied: listing.isNonOwnerOccupied,
                                parcelId: listing.parcelId,
                                daysOnZillow: listing.daysOnZillow,
                                propertyTypeDimension: listing.propertyTypeDimension,
                                hdpTypeDimension: listing.hdpTypeDimension,
                                listingTypeDimension: listing.listingTypeDimension,
                                status: listing.contingent_listing_type,
                                is_listed_by_management_company: listing.is_listed_by_management_company,
                                listing_provided_by_name: listing.listing_provided_by.name,
                                listing_provided_by_phone_number: listing.listing_provided_by.phone_number,
                                listing_provided_by_email: listing.listing_provided_by.email,
                                listing_provided_by_company: listing.listing_provided_by.company,
                                photoCount: photoCount,
                                photo: photoUrls,
                                for_sale: for_sale,
                                for_sale_date: for_sale_date,
                                for_sale_reachout: for_sale_reachout,
                                coming_soon: coming_soon,
                                coming_soon_date: coming_soon_date,
                                coming_soon_reachout: coming_soon_reachout,
                                pending: pending,
                                pending_date: pending_date,
                                pending_reachout: pending_reachout,
                                verified: verified,
                                owners: formattedOwners,
                                current_status: current_status,
                                current_status_date: current_status_date,
                                notes: notes,
                                companyOwned: companyOwned,
                                branch: branch,
                                snapshot_id: snapshot_id
                            };

                            await collection.insertOne(propertyData);
                        } else {
                            continue;
                        }

                    }
                    console.log("Total duplicates: ", duplicateCount)
                }
            } else {
                console.log('Data is not in expected array format');
            }

        } catch (error) {
            console.log(error);
        }
    }
    fetchData(snapshot_id, branch);
})


/* Running precisely again for selected query */
app.get('/fixing-precisely', async (req, res) => {
    let client;
    try {
        // Connect to the database
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        // Convert snapshot_id to ObjectId
        const objectIdSnapshotId = new ObjectId('66ab82a3ddcc33e60fbb130b');
        let query = {
            current_status: { $in: ["ForSale", "ComingSoon", "Pending"] },
            verified: { $in: ["Full", "NoPhotos"] },
            last_status_check: { $exists: true },
            initial_scrape: true,
            $or: [
                { current_status: "ForSale", for_sale_reachout: { $exists: false } },
                { current_status: "ForSale", for_sale_reachout: null },
                { current_status: "ComingSoon", coming_soon_reachout: { $exists: false } },
                { current_status: "ComingSoon", coming_soon_reachout: null },
                { current_status: "Pending", pending_reachout: { $exists: false } },
                { current_status: "Pending", pending_reachout: null }

            ]
        };

        const properties = await propertiesCollection.find(query).toArray();

        for (const property of properties) {
            try {
                const fullAddress = `${property.address} ${property.city}, ${property.state} ${property.zipcode}`;
                console.log(fullAddress);

                // Encode the full address for the URL
                const encodedAddress = encodeURIComponent(fullAddress);


                try {
                    // Send the request to the Precisely API
                    const response = await axios.get(`https://api.precisely.com/property/v2/attributes/byaddress?address=${encodedAddress}&attributes=owners`, {
                        headers: {
                            'Authorization': `Bearer ${tokenManager.accessTokenPrecisely}`, // Replace with your actual Bearer token
                            'Content-Type': 'application/json; charset=utf-8'
                        }
                    });
                    let companyOwned = false;
                    console.log("API RESULT: ", response.data);
                    // Extract owner details
                    const owners = response.data.propertyAttributes.owners;

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

                    await propertiesCollection.updateOne({
                        zpid: property.zpid

                    },
                        { $set: { owners: formattedOwners, companyOwned: companyOwned } })

                    console.log("Owners: ", owners);
                    console.log("Company Owned: ", companyOwned);
                } catch (error) {
                    console.log("Catch error2: ", error)
                }

            }
            catch (error) {
                console.log("Error in Catch of listing property: ", error)
            }
        }

        // Regex to check if a string starts with a number
        /*  const startsWithNumberRegex = /^\d+/;
         
          for (const property of properties) {
              try {
                  const address = property.address || "";
                  if (!startsWithNumberRegex.test(address)) {
                      await propertiesCollection.updateOne(
                          { _id: property._id },
                          { $set: { verified: "Empty" } },
                          { $set: { address_valid: false } }
                      );
                      console.log(`Updated property ID ${property._id}: verified set to Empty due to address "${address}"`);
                  } else {
                      await propertiesCollection.updateOne(
                          { _id: property._id },
         
                          { $set: { address_valid: true } }
                      );
                      console.log(`Property ID ${property._id} has a valid address: "${address}"`);
                  }
              } catch (updateError) {
                  console.error(`Error updating property ID ${property._id}:`, updateError);
              }
          }
        */

        res.send("Good Job!");
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        // Ensure the client is closed when done
        if (client) {
            await client.close();
        }
    }
});
/*
    _id
66a8b9bd22559afd6bd8c882
snapshot_id
"s_lz88z1ncgx1ske4eb"
requested_time
2024-07-30T10:00:29.890+00:00
branch
"TX"
THIS NEED TO BE FIXED, ALL ENTRIES WITH THIS SNAPSHOT ID ARE ACTUALLY BRANCH NJ
app.get('/fixing2', async (req, res) => {
    let client;
    try {
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');
 
        const properties = await propertiesCollection.find({ branch: "TX", verified: null, address_valid: { $exists: false } }).toArray();
        let counter;
        for (property of properties) {
            try {
                if (property.photoCount < 4) {
                    await propertiesCollection.updateOne(
                        { _id: property._id },
                        { $set: { verified: "NoPhotos", enoughphotos: false } }
                    );
                    console.log("Updated one...")
                } else {
                    await propertiesCollection.updateOne({
                        _id: property._id
                    },
                        {
                            $set: { enoughphotos: true }
                        });
                }
            } catch (error) {
                console.log("Error in foreach: ", error)
            }
        }
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send(error);
 
    } finally {
        if (client) {
            await client.close();
        }
    }
})
 
app.get('/fixing3', async (req, res) => {
    const database = await connectDB();
    const propertiesCollection = database.collection('properties');
 
    const properties = await propertiesCollection.find({ branches: "NJ", verified: null }).toArray();
    console.log(`Found ${properties.length} properties to process.`); // Log how many properties are found
 
    let counter = 0;
    for (const property of properties) {
        console.log(`Processing property with ID: ${property._id}`); // Detailed log for each property
        try {
            if (property.photoCount < 4) {
                console.log(`Property with ID ${property._id} has less than 4 photos.`);
                console.log('PhotoCount: ', property.photoCount);
                await propertiesCollection.updateOne(
                    { _id: property._id },
                    { $set: { verified: "NoPhotos", enoughphotos: false } }
                );
                console.log("Updated one (no photos or insufficient photos)...");
            } else {
                console.log('ELSE PhotoCount: ', property.photoCount);
                console.log(`Property with ID ${property._id} meets photo criteria.`);
                await propertiesCollection.updateOne(
                    { _id: property._id },
                    { $set: { enoughphotos: true } }
                );
                console.log("Updated one (sufficient photos)...");
            }
            counter++;
        } catch (error) {
            console.log("Error in foreach: ", error);
        }
    }
    console.log(`${counter} properties were processed.`);
 
})
*/
app.get('/listings', async (req, res) => {
    try {
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');


        // Build query object
        /*
                const filteringQuery = {
        
                    verified: { $in: ["NoPhotos", "Full"] },
                    companyOwned: { $in: [null, false] },
                    $or: [
                        { current_status: "ForSale", for_sale_reachout: { $exists: false } },
                        { current_status: "ForSale", for_sale_reachout: null },
                        { current_status: "ComingSoon", coming_soon_reachout: { $exists: false } },
                        { current_status: "ComingSoon", coming_soon_reachout: null },
                        { current_status: "Pending", pending_reachout: { $exists: false } },
                        { current_status: "Pending", pending_reachout: null },
                    ],
                    branch: { $in: ["TX", "NJ"] }
                };
        */
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
        const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));



        const filteringQuery = {
            current_status: { $in: ["ForSale", "ComingSoon"] },
            verified: { $in: ["Full", "NoPhotos"] },
            companyOwned: { $in: [false, null] },
            current_status_date: { $lt: fiveDaysAgo }

        };
        // Fetch filtered properties
        const properties = await propertiesCollection.find(filteringQuery).toArray();
        const totalResults = properties.length;

        // Render the template with parameters
        res.render('listings', {
            properties,
            totalResults // Pass totalResults to the EJS template
        });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }
});

// server.js or app.js
app.get('/shippings', async (req, res) => {
    try {
        const database = await connectDB();
        const shippingsCollection = database.collection('shippings');

        // Fetch all shippings, sorted by created_at in descending order
        const shippings = await shippingsCollection.find().sort({ created_at: -1 }).toArray();

        // Render the EJS template with shippings data
        res.render('shippings', { shippings });
    } catch (error) {
        console.error("Error fetching shippings:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/shipping/:id', async (req, res) => {
    try {
        const shippingId = new ObjectId(req.params.id); // Convert shippingId to ObjectId
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        // Fetch all properties with the given shipping ID
        const properties = await propertiesCollection.find({
            $or: [
                { for_sale_reachout: shippingId },
                { pending_reachout: shippingId },
                { coming_soon_reachout: shippingId }
            ]
        }).toArray();

        // Add the shipped_at_status field based on the matching condition
        const propertiesWithStatus = properties.map(property => {
            let shipped_at_status = '';
            if (property.for_sale_reachout && property.for_sale_reachout instanceof ObjectId && property.for_sale_reachout.equals(shippingId)) {
                shipped_at_status = 'For Sale';
            } else if (property.pending_reachout && property.pending_reachout instanceof ObjectId && property.pending_reachout.equals(shippingId)) {
                shipped_at_status = 'Pending';
            } else if (property.coming_soon_reachout && property.coming_soon_reachout instanceof ObjectId && property.coming_soon_reachout.equals(shippingId)) {
                shipped_at_status = 'Coming Soon';
            }
            return {
                ...property,
                shipped_at_status
            };
        });

        console.log('Properties:', propertiesWithStatus); // Log properties for debugging

        // Render the properties in a new template
        res.render('shipping_properties', { properties: propertiesWithStatus });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }
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

app.post('/refresh-count', async (req, res) => {
    try {
        const database = await connectDB();
        const snapshotsCollection = database.collection('snapshots');
        const propertiesCollection = database.collection('properties');

        const snapshot_id = req.body.snapshot_id;
        console.log("SNAPSHOT: ", snapshot_id)
        // Count properties with the given snapshot_id
        const count = await propertiesCollection.countDocuments({ snapshot_id: snapshot_id });
        console.log("COUNT: ", count)
        // Update the snapshot with the count
        await snapshotsCollection.updateOne(
            { snapshot_id: snapshot_id },
            { $set: { count: count } }
        );

        res.redirect('/snapshots');
    } catch (error) {
        console.error("Error updating count:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/snapshots', async (req, res) => {
    try {
        const database = await connectDB();
        const snapshotsCollection = database.collection('snapshots');

        // Define start and end of today
        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        // Define start and end of yesterday
        const startOfYesterday = moment().subtract(1, 'days').startOf('day').toDate();
        const endOfYesterday = moment().subtract(1, 'days').endOf('day').toDate();

        // Define start and end of this month
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        // Define start and end of last month
        const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toDate();
        const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toDate();

        // Find snapshots requested today
        const snapshotsToday = await snapshotsCollection.find({
            requested_time: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).sort({ requested_time: -1 }).toArray();

        // Find snapshots requested yesterday
        const snapshotsYesterday = await snapshotsCollection.find({
            requested_time: {
                $gte: startOfYesterday,
                $lt: endOfYesterday
            }
        }).sort({ requested_time: -1 }).toArray();

        // Find snapshots requested this month
        const snapshotsThisMonth = await snapshotsCollection.find({
            requested_time: {
                $gte: startOfMonth,
                $lt: endOfMonth
            }
        }).sort({ requested_time: -1 }).toArray();

        // Find snapshots requested last month
        const snapshotsLastMonth = await snapshotsCollection.find({
            requested_time: {
                $gte: startOfLastMonth,
                $lt: endOfLastMonth
            }
        }).sort({ requested_time: -1 }).sort({ requested_time: -1 }).toArray();

        // Render the EJS template with the snapshots data
        res.render('snapshots', {
            snapshotsToday,
            snapshotsYesterday,
            snapshotsThisMonth,
            snapshotsLastMonth
        });
    } catch (error) {
        console.error("Error fetching snapshots:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/snapshotsall', async (req, res) => {
    try {
        const database = await connectDB();
        const snapshotsCollection = database.collection('snapshots');


        // Find snapshots requested today
        const snapshots = await snapshotsCollection.find().sort({ requested_time: -1 }).toArray();


        // Render the EJS template with the snapshots data
        res.render('snapshotsall', {
            snapshots
        });
    } catch (error) {
        console.error("Error fetching snapshots:", error);
        res.status(500).send("Internal Server Error");
    }
});


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


app.post('/trigger3', async (req, res) => {
    try {
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        let skip = 0;
        const limit = 250;
        let hasMore = true;

        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
        const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));



        const filteringQuery = {
            current_status: { $in: ["ForSale", "ComingSoon"] },
            verified: { $in: ["Full", "NoPhotos"] },
            companyOwned: { $in: [false, null] },
            current_status_date: { $lt: fiveDaysAgo }

        };

        // while (hasMore) {
        const properties = await propertiesCollection.find(filteringQuery).skip(skip).limit(limit).toArray();
        //if (properties.length === 0) {
        //   hasMore = false;
        //     break;
        //   }
        // Extract the URL field
        //        const urls = properties.map(property => property.url).filter(Boolean); // Ensure URL is not undefined or null - ARRAY

        const urls = properties.map(property => ({ url: property.url }));

        console.log("URLS:", urls);
        // }
        if (!Array.isArray(urls)) {
            return res.status(400).json({ error: 'URLs should be an array' });
        }

        await processUrl(urls);

        //console.log(`Iteration ${i + 1} completed. Waiting for 30 seconds before the next iteration.`);
        // Wait for 30 seconds before the next iteration
        await delay(1000);

        // Update the skip for the next batch
        skip += limit;

        res.status(200).json({ message: 'All URLs are being processed.' });
    } catch (error) {
        console.error('Error processing URLs:', error);
        res.status(500).json('Failed to process URLs');
    }
});

app.post('/pending-check', async (req, res) => {
    try {
        const snapshot_id = req.body.snapshot_id;
        console.log("SNAPSHOT ID: ", snapshot_id);
        await fetchData(snapshot_id);
        res.status(200).json({ message: "Great Job ${snapshot_id} is Successfully sent" });
    } catch (error) {
        res.status(500).json({ message: error })
    }

})

app.get('/pendingtrigger', async (req, res) => {
    try {
        axios.post('https://worker-847b6ac96356.herokuapp.com/pending-check', {
            snapshot_id: 's_lzi56pmh9qfg68teg'
        })
    } catch (error) {
        console.log(error);
        return error;
    }
})




// Function to trigger the script
const triggerScript = async (url, branch) => {
    try {
        const response = await axios.post('https://worker-847b6ac96356.herokuapp.com/trigger2', {
            requrl: url,
            branch: branch
        });
        console.log(`Script triggered successfully for branch ${branch}:`, response.data);
    } catch (error) {
        console.error(`Error triggering script for branch ${branch}:`, error.response ? error.response.data : error.message);
    }
};


// Schedule the cron job to run at 12:45 AM every day (Fairfield, NJ time) / 6:45AM Serbia time
cron.schedule('45 0 * * *', () => {
    console.log('Running the cron job to trigger the script at 4:00 AM');
    triggerScript('https://www.zillow.com/homes/for_sale/?searchQueryState=%7B%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-96.23800374414061%2C%22east%22%3A-94.63125325585936%2C%22south%22%3A29.366468858307613%2C%22north%22%3A30.300427680002166%7D%2C%22usersSearchTerm%22%3A%22%22%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22doz%22%3A%7B%22value%22%3A%221%22%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%2C%22customRegionId%22%3A%221095b66a9eX1-CRmt13j7zyeyra_znvef%22%7D', 'TX');
}, {
    scheduled: true,
    timezone: "America/New_York" // Set the timezone to Eastern Time
});


// Schedule the cron job to run at 1:15 AM every day (Fairfield, NJ time) / 7:15AM Serbia time
cron.schedule('15 1 * * *', () => {
    console.log('Running the cron job to trigger the script at 4:00 AM');
    triggerScript('https://www.zillow.com/mercer-county-nj/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-76.02073498828125%2C%22east%22%3A-72.80723401171875%2C%22south%22%3A39.594757066152056%2C%22north%22%3A41.23410438869997%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A1201%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2802%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2441%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2552%2C%22regionType%22%3A4%7D%5D%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22doz%22%3A%7B%22value%22%3A%221%22%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A9%2C%22usersSearchTerm%22%3A%22Mercer%20County%20NJ%2C%20Middlesex%20County%20NJ%2C%20Monmouth%20County%20NJ%2C%20Somerset%20County%20NJ%22%7D', 'NJ');
}, {
    scheduled: true,
    timezone: "America/New_York" // Set the timezone to Eastern Time
});


// Schedule the cron job to run at 1:40 AM every day (Fairfield, NJ time) / 7:40AM Serbia time
cron.schedule('40 1 * * *', () => {
    console.log('Running the cron job to trigger the script at 4:00 AM');
    triggerScript('https://www.zillow.com/hunterdon-county-nj/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-78.09196867577545%2C%22east%22%3A-71.66496672265045%2C%22south%22%3A39.1423901263726%2C%22north%22%3A42.40274786156916%7D%2C%22mapZoom%22%3A8%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A2729%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A1478%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A1241%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A771%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A504%2C%22regionType%22%3A4%7D%5D%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22doz%22%3A%7B%22value%22%3A%221%22%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%2C%22usersSearchTerm%22%3A%22Hunterdon%20County%20NJ%2C%20Warren%20County%20NJ%2C%20Morris%20County%20NJ%2C%20Union%20County%20NJ%2C%20Essex%20County%20NJ%22%7D', 'NJ');
}, {
    scheduled: true,
    timezone: "America/New_York" // Set the timezone to Eastern Time
});


// Schedule the cron job to run at the same time every day (e.g., at 2:10 AM) / 8:10am serbia time
cron.schedule('10 2 * * *', () => {
    console.log('Running the cron job to trigger the script');
    triggerScript('https://www.zillow.com/hudson-county-nj/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-76.04974748828124%2C%22east%22%3A-72.83624651171874%2C%22south%22%3A40.18319814696894%2C%22north%22%3A41.80829765600374%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A1106%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A874%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A1964%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A1413%2C%22regionType%22%3A4%7D%5D%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22doz%22%3A%7B%22value%22%3A%221%22%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A9%2C%22usersSearchTerm%22%3A%22Hudson%20County%20NJ%2C%20Bergen%20County%20NJ%2C%20Passaic%20County%20NJ%2C%20Sussex%20County%20NJ%22%7D', 'NJ');
}, {
    scheduled: true,
    timezone: "America/New_York" // Set the timezone as needed 
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
