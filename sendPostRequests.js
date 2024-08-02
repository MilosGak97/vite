const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const { checkIfZpidExists } = require('./src/function/checkIfZpidExists');

async function sendPostRequests(req, res) {
    try {
        body = [
            { "url": "https://www.zillow.com/homedetails/13810-Longview-St-Houston-TX-77015/84027384_zpid/" }, //84027384
            { "url": "https://www.zillow.com/homedetails/1003-E-Wallisville-Rd-Highlands-TX-77562/27837391_zpid/" } //27837391
        ]

        const collection2 = client.db().collection('properties');
        // Query MongoDB for records with current_type as "forsale" or "comingsoon"
        /*
          const records = await collection2.find({
              current_status: { $in: ["ForSale", "ComingSoon"] },
              verified: {$in: ["Full", "NoPhotos"]}
          }).toArray();
  
          // Create the body for the POST request
          const body = records.map(record => ({ url: record.url }));
          console.log("Body: ", body)
  */
        const datasetId = "gd_lfqkr8wm13ixtbd8f5";
        const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webh';
        const format = 'json';
        const uncompressedWebhook = false;
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

        const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${encodeURIComponent(endpoint)}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

        const response = await axios.post(url, body, { headers });
        console.log(`Response for ${body[0].url}:`, response.data.snapshot_id);

        const snapshotId = response.data.snapshot_id;
        console.log("SnapshotID:", snapshotId);
        const collection = client.db().collection('snapshots');

        const shapshotData = {
            snapshot_id: snapshotId,
            requested_time: new Date()
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
                        //console.log('Snapshot is not ready yet, trying again in 10 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
                    } else {
                        //console.log('Response data:', response.data);
                        listAllListings(response.data);
                        return response.data;
                    }
                } catch (error) {
                    //console.error('Error fetching data:', error);
                    throw error; // or handle gracefully
                }
            }
        }

        async function listAllListings(data) {
            if (Array.isArray(data)) {



                const dataArray = data;
                const collection = client.db().collection('properties');

                // Logging individual items and inserting into MongoDB
                for (let i = 0; i < dataArray.length; i++) {
                    const listing = dataArray[i];
                    const photos = dataArray[i].photos;


                    const exists = await checkIfZpidExists(listing.zpid);
                    if (exists) {
                        // Initialize updateFields with an empty $set object
                        let updateFields = { $set: {} };
                        const hdpTypeDimension = listing.hdpTypeDimension;
                        //console.log("Correct loop: ", hdpTypeDimension);
                        //console.log("Correct loop2: ", exists);

                        if (hdpTypeDimension === "ForSale") {
                            if (exists.for_sale === null) {
                                //console.log("exists.for_sale is null:", exists.for_sale);

                                updateFields.$set.for_sale = "Yes";
                                updateFields.$set.for_sale_date = new Date();
                                updateFields.$set.current_status_date = new Date();
                            } else if (exists.for_sale !== null) {
                                //console.log("exists.for_sale is not null: ", exists.for_sale);
                            }
                        } else if (hdpTypeDimension === "Pending") {
                            if (exists.pending === null) {
                                //console.log("Correct loop4: ", exists.pending);

                                updateFields.$set.pending = "Yes";
                                updateFields.$set.pending_date = new Date();
                                updateFields.$set.current_status_date = new Date();
                            } else if (exists.pending !== null) {
                                //console.log("exists.pending: ", exists.pending);
                            }
                        } else if (hdpTypeDimension === "ComingSoon") {
                            if (exists.pending === null) {
                                //console.log("Correct loop4: ", exists.pending);

                                updateFields.$set.pending = "Yes";
                                updateFields.$set.pending_date = new Date();
                                updateFields.$set.current_status_date = new Date();
                            } else if (exists.pending !== null) {
                                //console.log("exists.pending: ", exists.pending);
                            }
                        } else if (hdpTypeDimension === "ComingSoon") {
                            if (exists.coming_soon === null) {
                                console.log("Correct loop5: ", exists.coming_soon);
                                updateFields.$set.coming_soon = "Yes";
                                updateFields.$set.coming_soon_date = new Date();
                                updateFields.$set.current_status_date = new Date();
                            } else if (exists.coming_soon !== null) {
                                //console.log("exists.coming_soon: ", exists.coming_soon);
                            }
                        }

                        // Set the current_status field
                        updateFields.$set.current_status = hdpTypeDimension;
                        //console.log("Update fields object: ", updateFields);
                        // Perform the update based on zpid
                        await collection.updateOne(
                            { zpid: Number(listing.zpid) },
                            updateFields
                        );
                    }
                    else {
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

                        let customer_first_name;//
                        let customer_last_name;//
                        let company_owned;//

                        let current_status;//
                        let current_status_date;//

                        let notes;//
                        let branch;


                        if (hdpTypeDimension === "ForSale") {
                            for_sale = "Yes";
                            for_sale_date = new Date();
                            current_status_date = for_sale_date;
                        }
                        if (hdpTypeDimension === "Pending") {
                            pending = "Yes";
                            pending_date = new Date();
                            current_status_date = for_pending_date;
                        }
                        if (hdpTypeDimension === "ComingSoon") {
                            coming_soon = "Yes";
                            coming_soon_date = new Date();
                            current_status_date = for_coming_soon_date;
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
                            photoCount: listing.photoCount,
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
                            customer_first_name: customer_first_name,
                            customer_last_name: customer_last_name,
                            company_owned: company_owned,
                            current_status: current_status,
                            current_status_date: current_status_date,
                            notes: notes,
                            branch: branch
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

module.exports = sendPostRequests;
