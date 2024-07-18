const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');

async function sendPostRequests2(req, res) {
    try {
        const body = [{
            "url": "https://www.zillow.com/mercer-county-nj/?searchQueryState=%7B%22mapBounds%22%3A%7B%22north%22%3A40.84567812635663%2C%22south%22%3A39.99045155841231%2C%22east%22%3A-73.61060925585937%2C%22west%22%3A-75.21735974414062%7D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22doz%22%3A%7B%22value%22%3A%221%22%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22pnd%22%3A%7B%22value%22%3Atrue%7D%2C%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22sf%22%3A%7B%22value%22%3Afalse%7D%7D%2C%22isListVisible%22%3Atrue%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A1201%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2802%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2441%2C%22regionType%22%3A4%7D%2C%7B%22regionId%22%3A2552%2C%22regionType%22%3A4%7D%5D%2C%22pagination%22%3A%7B%7D%7D"
        }
        ];


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
                    console.log("PHOTOS DATA IS HERE: ", photos)

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

                    const propertyData = {
                        url: listing.url,
                        zpid: listing.zpid,
                        address: listing.address,
                        city: listing.city,
                        state: listing.state,
                        zipcode: listing.zipcode,
                        bedrooms: listing.bedrooms,
                        bathrooms: listing.bathrooms,
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
                        photo2: listing.photos
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

module.exports = sendPostRequests2;
