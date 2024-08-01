const express = require('express');
const bodyParser = require('body-parser');
const webhookHandler = require('./webhookHandler');
const sendPostRequests = require('./sendPostRequests');
const sendPostRequests2 = require('./sendPostRequests2');
const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const path = require('path');
const { parse } = require('json2csv');

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
        const shippingsCollection = database.collection('shippings');


        // Build query object with fixed criteria
        /* let query = {
             verified: { $in: ["Full", "NoPhotos"] },
             companyOwned: { $in: [false] },
             $or: [
                 { current_status: "ForSale", for_sale_reachout: { $exists: false } },
                 { current_status: "ForSale", for_sale_reachout: null },
                 { current_status: "ComingSoon", coming_soon_reachout: { $exists: false } },
                 { current_status: "ComingSoon", coming_soon_reachout: null },
                 { current_status: "Pending", pending_reachout: { $exists: false } },
                 { current_status: "Pending", pending_reachout: null }
             ]
         };
 */
        let query = {
            verified: { $in: ["Full", "NoPhotos"] },
            companyOwned: {
                $in: [null, false]
            },
            initial_scrape: { $exists: false },
            snapshot_id: { $in: ['s_lz9j0sz38leb9761m', 's_lz9j0cde2gvjdt3yex', 's_lz9j060h1hkjnc3r06', 's_lz9iztoe1nbsx2xgt9'] }
        };


        const properties = await propertiesCollection.find(query).toArray();

        // Define the fields you want to include in the CSV
        const fields = ['owner_fullname', 'current_resident', 'address', 'city', 'state', 'zipcode'];

        // Function to generate owner_fullname based on owners array
        const generateOwnerFullname = (owners) => {
            if (!owners || owners.length === 0) {
                return '';
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
                return '';
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

            return {
                owner_fullname: owner_fullname,
                current_resident: current_resident,
                address: property.address,
                city: property.city,
                state: property.state,
                zipcode: property.zipcode
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


app.get('/filtering-tx', async (req, res) => {
    try {
        const database = await connectDB();
        const Property = database.collection('properties');

        const query = {
            verified: null,
            branch: "TX",
            initial_scrape: true
        }

        // Count the total number of properties matching the parameters
        const totalCount = await Property.countDocuments(query);


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
            res.render('filtering-tx', { propertyFirst15, propertyOtherPhoto, PropertyZpid, totalCount });
        } else {
            // Handle the case where no property was found
            res.render('filtering-tx', { propertyFirst15: [], propertyOtherPhoto: [], PropertyZpid: null, totalCount: 0 });
        }
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/filtering-nj', async (req, res) => {
    try {
        const database = await connectDB();
        const Property = database.collection('properties');

        const query = {
            verified: null,
            branches: "NJ",
            initial_scrape: true
        }

        // Count the total number of properties matching the parameters
        const totalCount = await Property.countDocuments(query);


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
            res.render('filtering-nj', { propertyFirst15, propertyOtherPhoto, PropertyZpid, totalCount });
        } else {
            // Handle the case where no property was found
            res.render('filtering-nj', { propertyFirst15: [], propertyOtherPhoto: [], PropertyZpid: null, totalCount: 0 });
        }
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/update-verified-nj/:zpid', async (req, res) => {

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
        const formattedOwners = [{
            firstName: 'Initial_Scrape',
            lastName: 'Initial_Scrape'
        }];

        let companyOwned = false; // Initialize the flag

        const updateResult = await Property.updateOne(
            { zpid: Number(zpid) }, // Ensure zpid is a number
            { $set: { owners: formattedOwners, verified: verified, companyOwned: companyOwned } }
        );

        if (updateResult.modifiedCount === 0) {
            console.error('Error updating property: No documents matched the query');
            return res.status(404).send('Property not found');
        }
        console.log("Redirecting to /filtering-nj")
        res.redirect('/filtering-nj');
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send('Internal Server Error');
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
                        'Authorization': 'Bearer 99W2OboFyVEacX8UqZFcIflvzmks', // Replace with your actual Bearer token
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



app.post('/update-verified-tx/:zpid', async (req, res) => {

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
        const formattedOwners = [{
            firstName: 'Initial_Scrape',
            lastName: 'Initial_Scrape'
        }];

        let companyOwned = false; // Initialize the flag

        const updateResult = await Property.updateOne(
            { zpid: Number(zpid) }, // Ensure zpid is a number
            { $set: { owners: formattedOwners, verified: verified, companyOwned: companyOwned } }
        );

        if (updateResult.modifiedCount === 0) {
            console.error('Error updating property: No documents matched the query');
            return res.status(404).send('Property not found');
        }
        console.log("Redirecting to /filtering-tx")
        res.redirect('/filtering-tx');
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

/*
app.get('/fix-address', async (req, res) => {
    try {
        // Connect to the database
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        // Fetch all properties
        const properties = await propertiesCollection.find({}).toArray();
        console.log(`Fetched ${properties.length} properties`);

        // Regex to check if a string starts with a number
        const startsWithNumberRegex = /^\d+/;

        // Iterate through each property and update verified field if address doesn't start with a number
        for (const property of properties) {
            try {
                const address = property.address || "";
                if (!startsWithNumberRegex.test(address)) {
                    await propertiesCollection.updateOne(
                        { _id: property._id },
                        { $set: { verified: "Empty" } }
                    );
                    console.log(`Updated property ID ${property._id}: verified set to Empty due to address "${address}"`);
                } else {
                    console.log(`Property ID ${property._id} has a valid address: "${address}"`);
                }
            } catch (updateError) {
                console.error(`Error updating property ID ${property._id}:`, updateError);
            }
        }

        console.log('Address check and update completed successfully.');
        res.send('Address check and update completed successfully.');
    } catch (error) {
        console.error('Error checking and updating addresses:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        // Ensure the client is closed when done
        await client.close();
    }
});
*/


app.get('/fixing', async (req, res) => {





    let client;
    try {
        // Connect to the database
        const database = await connectDB();
        const propertiesCollection = database.collection('properties');

        const properties = await propertiesCollection.find({
            companyOwned: null, verified: "NoPhotos", $or: [
                { current_status: "ForSale", for_sale_reachout: { $exists: false } },
                { current_status: "ForSale", for_sale_reachout: null },
                { current_status: "ComingSoon", coming_soon_reachout: { $exists: false } },
                { current_status: "ComingSoon", coming_soon_reachout: null },
                { current_status: "Pending", pending_reachout: { $exists: false } },
                { current_status: "Pending", pending_reachout: null }
            ],
            initial_scrape: { $exists: false }
        }).toArray();


        for (const property of properties) {
            try {
                if (property.photoCount < 4) {
                    const fullAddress = `${property.address} ${property.city}, ${property.state} ${property.zipcode}`;
                    console.log(fullAddress);

                    // Encode the full address for the URL
                    const encodedAddress = encodeURIComponent(fullAddress);


                    try {
                        // Send the request to the Precisely API
                        const response = await axios.get(`https://api.precisely.com/property/v2/attributes/byaddress?address=${encodedAddress}&attributes=owners`, {
                            headers: {
                                'Authorization': 'Bearer 99W2OboFyVEacX8UqZFcIflvzmks', // Replace with your actual Bearer token
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

        let query = {
            verified: { $in: ["Full", "NoPhotos"] },
            companyOwned: {
                $in: [null, false]
            },
            initial_scrape: { $exists: false },
            $or: [
                { for_sale_reachout: { $in: '66aa215a4cedc36cccb68e44' } },
                { pending_reachout: { $in: '66aa215a4cedc36cccb68e44' } },
                { coming_soon_reachout: { $in: '66aa215a4cedc36cccb68e44' } }
            ]
        };

        /*
        
                    $or: [
                        { current_status: "ForSale", for_sale_reachout: { $exists: false } },
                        { current_status: "ForSale", for_sale_reachout: null },
                        { current_status: "ComingSoon", coming_soon_reachout: { $exists: false } },
                        { current_status: "ComingSoon", coming_soon_reachout: null },
                        { current_status: "Pending", pending_reachout: { $exists: false } },
                        { current_status: "Pending", pending_reachout: null }
                    ],*/


        // Fetch filtered properties
        const properties = await propertiesCollection.find(query).toArray();
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
            if (property.for_sale_reachout && property.for_sale_reachout.equals(shippingId)) {
                shipped_at_status = 'For Sale';
            } else if (property.pending_reachout && property.pending_reachout.equals(shippingId)) {
                shipped_at_status = 'Pending';
            } else if (property.coming_soon_reachout && property.coming_soon_reachout.equals(shippingId)) {
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


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// s_lyqxhv8i2dhnakw152