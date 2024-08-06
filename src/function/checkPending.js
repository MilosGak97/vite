const { checkIfZpidExists } = require('./checkIfZpidExists');
const { client } = require('../config/mongodb');

async function checkPending(data, status_check_snapshot_id) {
    if (Array.isArray(data)) {
        const dataArray = data;
        const collection = client.db().collection('properties');

        for (let i = 0; i < dataArray.length; i++) {
            const listing = dataArray[i];

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
                updateFields.$set.last_status_check_snapshot = status_check_snapshot_id
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
                continue;
            }
        }
    } else {
        console.log('Data is not in expected array format');
    }
}

module.exports = { checkPending }