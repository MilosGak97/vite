const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');
const { checkIfZpidExists } = require('./src/function/checkIfZpidExists');
const tokenManager = require('./tokenManager');


async function fetchData2(snapshotId, branch) {
    const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
    const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

    while (true) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data.status === 'running') {
                console.log(snapshotId, ': Not ready yet, trying again in 10 seconds...');
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
            } else {
                console.log('Response data:', response.data);
                await listAllListings(response.data, branch, snapshotId);
                return response.data;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error; // or handle gracefully
        }
    }
}

async function listAllListings(data, branch, snapshot_id) {


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
}

module.exports = fetchData2;
