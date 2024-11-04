const { checkIfZpidExists, checkIfZpidExists2 } = require('./checkIfZpidExists');
const { client } = require('../config/mongodb');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
/*
async function checkPending(data, status_check_snapshot_id) {
    if (data && Array.isArray(data)) {
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

                        updateFields.$set.last_status_check = new Date();
                        await collection.updateOne(
                            { zpid: Number(zpid) },
                            updateFields
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
        console.log("Invalid data format:", data);
    }
}
*/

async function checkPending2(data, status_check_snapshot_id) {
    if (data) {
        const dataArray = data;

        // Log the type of dataArray
        console.log("Type of dataArray:", typeof dataArray); // This will return 'object' since arrays are objects in JavaScript

        // Log whether it is an array
        console.log("Is dataArray an array?:", Array.isArray(dataArray)); // This will return true if it's an array


        const collection = client.db().collection('listingslas');

        for (let i = 0; i < dataArray.length; i++) {
            const listing = dataArray[i];
            const { zpid, hdpTypeDimension } = listing;
            console.log("ZPID: " + zpid);
            console.log("STATUS: " + hdpTypeDimension)
            console.log("COUNTER: " + i);
            try {
                const exists = await checkIfZpidExists2(zpid);
                if (exists) {

                    if (( hdpTypeDimension === "Pending" || hdpTypeDimension === "UnderContract")) {


                        const last_status_check_snapshot = status_check_snapshot_id
                        const pending_status = true; // Set this to the value you want to add for the new field
                        const pending_status_date = new Date();
                        // Update the document to add a new field
                        await collection.updateOne(
                            { zpid: zpid },
                            { $set: { pending_status, pending_status_date, last_status_check_snapshot } } // Replace 'newFieldName' with the actual field name
                        );

                        console.log("Added new field to:", zpid);
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
        console.log("Invalid data format:", data);
    }
}

module.exports = { checkPending2 }