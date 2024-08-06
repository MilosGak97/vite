const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const { checkIfZpidExists } = require('./src/function/checkIfZpidExists');

const processUrl = async (urls) => {
    const body = urls.map(urlObj => ({ url: urlObj.url }));


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

    const url2 = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${encodeURIComponent(endpoint)}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

    try {
        const response = await axios.post(url2, body, { headers });
        console.log(`Started:`, response.data.snapshot_id);

        const snapshotId = response.data.snapshot_id;
        const collection = client.db().collection('snapshotsPending');

        const snapshotData = {
            snapshot_id: snapshotId,
            requested_time: new Date()
        };
        await collection.insertOne(snapshotData);

        // await fetchData(snapshotId);
    } catch (error) {
        console.error('Error sending data:', error);
    }

    return body;
};
/*
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
                console.log('Snapshot is not ready yet, trying again in 10 seconds...');
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
            } else {
                console.log('Response data:', response.data);
                await listAllListings(response.data);
                return response.data;
            }
        } catch (error) {
            throw error; // or handle gracefully
        }
    }
}
*/
/*
async function listAllListings(data) {
    if (Array.isArray(data)) {
        const dataArray = data;
        const collection = client.db().collection('properties');

        for (let i = 0; i < dataArray.length; i++) {
            const listing = dataArray[i];
            const photos = dataArray[i].photos;

            const exists = await checkIfZpidExists(listing.zpid);
            if (exists) {
                let updateFields = { $set: {} };
                const hdpTypeDimension = listing.hdpTypeDimension;

                if (hdpTypeDimension === "ForSale") {
                    if (exists.for_sale === null) {
                        updateFields.$set.for_sale = "Yes";
                        updateFields.$set.for_sale_date = new Date();
                        updateFields.$set.current_status_date = new Date();
                    }
                } else if (hdpTypeDimension === "Pending") {
                    if (exists.pending === null) {
                        updateFields.$set.pending = "Yes";
                        updateFields.$set.pending_date = new Date();
                        updateFields.$set.current_status_date = new Date();
                    }
                } else if (hdpTypeDimension === "UnderContract") {
                    if (exists.pending === null) {
                        updateFields.$set.pending = "Yes";
                        updateFields.$set.pending_date = new Date();
                        updateFields.$set.current_status_date = new Date();
                    }
                } else if (hdpTypeDimension === "ComingSoon") {
                    if (exists.coming_soon === null) {
                        updateFields.$set.coming_soon = "Yes";
                        updateFields.$set.coming_soon_date = new Date();
                        updateFields.$set.current_status_date = new Date();
                    }
                }

                updateFields.$set.current_status = hdpTypeDimension;
                updateFields.$set.contingent_listing_type = listing.contingent_listing_type;

                if (hdpTypeDimension === exists.current_status) {
                    await collection.updateOne(
                        { zpid: Number(listing.zpid) },
                        { $set: { last_status_check: new Date() } }
                    );
                    console.log("No Status Changes for: ", listing.zpid)
                } else {
                    updateFields.$set.last_status_check = new Date();
                    await collection.updateOne(
                        { zpid: Number(listing.zpid) },
                        updateFields
                    );
                    console.log("Updated status for: ", listing.zpid)
                }
            } else {
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

                let customer_first_name;
                let customer_last_name;
                let company_owned;

                let current_status;
                let current_status_date;

                let notes;
                let branch;
                let first_pending = true;

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
                    branch: branch,
                    first_pending: first_pending
                };
                console.log("Created: ", listing.zpid)
                await collection.insertOne(propertyData);
            }
        }
    } else {
        console.log('Data is not in expected array format');
    }
}
*/
await client.connect();
await fetchData(snapshotId);

module.exports = processUrl;
