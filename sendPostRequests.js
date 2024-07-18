const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');

async function sendPostRequests(req, res) {
    try {
        const body = [
            { "url": "https://www.zillow.com/homedetails/12-Hamilton-Ct-Lawrence-Township-NJ-08648/39004401_zpid/" },
            { "url": "https://www.zillow.com/homedetails/58-Montague-Ave-Ewing-NJ-08628/52622353_zpid/" }

        ];


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
        console.log(snapshotId);
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
                        console.log('Snapshot is not ready yet, trying again in 10 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
                    } else {
                        //console.log('Response data:', response.data);
                        listAllListings(response.data);
                        return response.data;
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
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

                    let notes;

                    if (hdpTypeDimension === "ForSale") {
                        for_sale = "Yes";
                    }

                    const propertyData = {
                        url: listing.url,
                        zpid: listing.zpid,
                        address: listing.address,
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
                        notes: notes
                    };

                    await collection.insertOne(propertyData);
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
