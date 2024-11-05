
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');
const moment = require('moment');
const { checkPending2 } = require('./src/function/checkPending');


async function processPendingChecks() { 
    // Connect to MongoDB
    const db = await connectDB();
    const collection = db.collection('snapshotsPending');

    // Define your start and end times

    //11/5/2024, 11:55:24 AM
    const startTime = moment('11/5/2024, 11:40:00 AM', 'MM/DD/YYYY, hh:mm:ss A').utc().toDate();
    const endTime = moment('11/5/2024, 11:59:55 AM', 'MM/DD/YYYY, hh:mm:ss A').utc().toDate();

    // Query for snapshot_ids with requested_time between the specified range
    const snapshots = await collection.find({
        requested_time: { $gte: startTime, $lte: endTime }
    }).toArray();



    const snapshotIds = snapshots.map(snapshot => snapshot.snapshot_id);

    console.log('Snapshot IDs:', snapshotIds);



    for (const snapshotId of snapshotIds) {
        try {
            const data = await fetchData(snapshotId);
            await checkPending2(data, snapshotId);
            console.log(`Processed snapshot: ${snapshotId}`);
        } catch (error) {
            console.error(`Error processing snapshot ${snapshotId}:`, error);
        }
    }
}
// Connect to the database and start processing
connectDB().then(() => {
    processPendingChecks().then(() => {
        console.log('All snapshots processed');
        process.exit(0);
    }).catch((error) => {
        console.error('Error processing snapshots:', error);
        process.exit(1);
    });
}).catch((err) => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
});
