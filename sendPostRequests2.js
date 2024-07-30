const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const { checkIfZpidExists } = require('./src/function/checkIfZpidExists');

async function sendPostRequests2(req, res) {
    try {

        /*
        const { requrl } = req.body;

        // Validate URL (basic example)
        if (!requrl || typeof requrl !== 'string') {
            console.log("Type Of:", typeof requrl);
            console.log(requrl);
            return res.status(400).send('Invalid URL');
        }
        const body = [{ url: requrl }];
*/
        /*
        const body = [{
            "url": "https://www.zillow.com/mercer-county-nj/?searchQueryState=%7B%22mapBounds%22%3A%7B%22north%22%3A40.84567812635663%2C%22south%22%3A39.99045155841231%2C%22east%22%3A-73.61060925585937%2C%22west%22%3A-75.21735974414062%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22doz%22%3A%7B%22value%22%3A%221%22%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A1201%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2802%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2441%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2552%2C%22regionType%22%3A4%7D%5D%2C%22pagination%22%3A%7B%7D%7D"
        }
        ];
        */

        const { requrl, branch } = req.body;

        // Validate URL (basic example)
        if (!requrl || typeof requrl !== 'string') {
            console.log("Type Of (URL):", typeof requrl);
            console.log("URL: ", requrl);
            return res.status(400).send('Invalid URL');
        }

        const body = [{ url: requrl }];
        // Validate URL (basic example)
        if (!branch || typeof branch !== 'string') {
            console.log("Type Of (BRANCH):", typeof branch);
            console.log("Branch: ", branch);
            return res.status(400).send('Invalid URL');
        }

        // Log received parameters
        console.log("Received URL: ", requrl);
        console.log("Received Branch: ", branch);



        const datasetId = "gd_lfqkr8wm13ixtbd8f5";
        const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webh';
        const format = 'json';
        const uncompressedWebhook = false;
        const type = 'discover_new';
        const discover_by = 'url'
        const headers = {
            'Content-Type': 'application/gzip',
            'dca-collection-id': 's_lyokoc2y2led7hycvu',
            'content-encoding': 'gzip',
            'dca-dataset': 'true',
            'User-Agent': 'BRD dca-ds-delivery-worker/1.473.306',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39'
        };

        const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${encodeURIComponent(endpoint)}&format=${format}&uncompressed_webhook=${uncompressedWebhook}&type=${type}&discover_by=${discover_by}`;

        const response = await axios.post(url, body, { headers });
        console.log(`Response for ${body[0].url}:`, response.data.snapshot_id);

        const snapshotId = response.data.snapshot_id;
        console.log(snapshotId);
        const collection = client.db().collection('snapshots');

        const shapshotData = {
            snapshot_id: snapshotId,
            requested_time: new Date(),
            branch: branch
        }
        await collection.insertOne(shapshotData);

        async function fetchData(snapshotId) {
            const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
            const url2 = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

            while (true) {
                try {
                    const response = await axios.get(url2, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (response.data.status === 'running') {
                        console.log(snapshotId, ': Not ready yet, trying again in 10 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
                    } else {
                        console.log('Response data:', response.data);
                        listAllListings(response.data, branch);
                        return response.data;
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    throw error; // or handle gracefully
                }
            }
        }


        async function listAllListings(data, branch) {
            if (Array.isArray(data)) {
                const dataArray = data;
                const collection = client.db().collection('properties');

                // Logging individual items and inserting into MongoDB
                for (let i = 0; i < dataArray.length; i++) {
                    const listing = dataArray[i];
                    const photos = dataArray[i].photos;


                    const exists = await checkIfZpidExists(listing.zpid);
                    if (exists) {
                        // Handle the case where the property already exists
                        continue;
                    } else {
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
                        let for_sale; //
                        let for_sale_date; //
                        let for_sale_reachout;//

                        let coming_soon;//
                        let coming_soon_date;//
                        let coming_soon_reachout;//

                        let pending;//
                        let pending_date;//
                        let pending_reachout;//

                        let verified;//

                        let companyOwned;//

                        let current_status;//
                        let current_status_date;//
                        let initial_scrape = true;
                        // Initialize owners array
                        let formattedOwners = [];
                        let notes;//
                        let readytodelete = true;
                        /*
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
                                        'Authorization': 'Bearer SHxoIFrmTCE9HTlue9HMDvqkua6g', // Replace with your actual Bearer token
                                        'Content-Type': 'application/json; charset=utf-8'
                                    }
                                });

                                console.log("API RESULT: ", response.data);


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
*/

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
                            is_listed_by_management_company: listing.is_listed_by_management_company,
                            listing_provided_by_name: listing.listing_provided_by.name,
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
                            readytodelete
                        };

                        await collection.insertOne(propertyData);
                    }

                }
            } else {
                console.log('Data is not in expected array format');
            }
        }


        try {
            await client.connect();
            const data = await fetchData(snapshotId);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching data' });
        } finally {
            console.log("Bravo, gotovo je!")
        }
    } catch (error) {
        console.error('Error sending POST request:', error);
        res.status(500).json({ error: 'Failed to send POST request' });
    }
}

module.exports = sendPostRequests2;
