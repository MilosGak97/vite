const { checkIfZpidExists } = require('./checkIfZpidExists');
const { client } = require('../config/mongodb');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function checkPending(data, status_check_snapshot_id) {
    if (Array.isArray(data)) {
        const dataArray = data;
        const collection = client.db().collection('properties');

        for (let i = 0; i < dataArray.length; i++) {
            const listing = dataArray[i];
            const { zpid, hdpTypeDimension, contingent_listing_type } = listing;
            console.log(status_check_snapshot_id);
            try {
                const exists = await checkIfZpidExists(zpid);
                if (exists) {
                    let updateFields = { $set: {} };

                    // Determine fields to update based on the status
                    if (hdpTypeDimension === "ForSale" && exists.for_sale === null) {
                        updateFields.$set.for_sale = "Yes";
                        updateFields.$set.for_sale_date = new Date();
                        updateFields.$set.current_status_date = new Date();
                    } else if ((hdpTypeDimension === "Pending" || hdpTypeDimension === "UnderContract") && exists.pending === null) {
                        updateFields.$set.pending = "Yes";
                        updateFields.$set.pending_date = new Date();
                        updateFields.$set.current_status_date = new Date();
                    } else if (hdpTypeDimension === "ComingSoon" && exists.coming_soon === null) {
                        updateFields.$set.coming_soon = "Yes";
                        updateFields.$set.coming_soon_date = new Date();
                        updateFields.$set.current_status_date = new Date();
                    }

                    // Common fields to update
                    updateFields.$set.current_status = hdpTypeDimension;
                    updateFields.$set.contingent_listing_type = contingent_listing_type;
                    updateFields.$set.last_status_check_snapshot = status_check_snapshot_id;

                    if (hdpTypeDimension === exists.current_status) {
                        await collection.updateOne(
                            { zpid: Number(zpid) },
                            { $set: { last_status_check: new Date() } }
                        );
                        console.log("No Status Changes for:", zpid);
                    } else {
                        updateFields.$set.last_status_check = new Date();
                        await collection.updateOne(
                            { zpid: Number(zpid) },
                            updateFields
                        );
                        console.log("Updated status for:", zpid);
                    }
                } else {
                    continue;  // Skip to the next iteration if the property does not exist
                }
            } catch (error) {
                console.error(`Error processing zpid ${zpid}:`, error);
            }

            // Add a delay to avoid overwhelming the server
            await delay(100); // Adjust the delay as needed
        }
    } else {
        console.log('Data is not in the expected array format');
    }
}

module.exports = { checkPending }