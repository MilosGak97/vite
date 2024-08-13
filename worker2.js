const { checkPending } = require('./src/function/checkPending'); // Ensure this path is correct
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');
const moment = require('moment');


async function processPendingChecks() {
    // Example: Fetching a list of snapshot IDs to process
    const snapshotIds = [
        's_lzsb07vt2len9w197i',
        's_lzsb09k31az2v87ib8',
        's_lzsb0app132a7pfuh'
    ];

    /*
        // Connect to MongoDB
        const db = await connectDB();
        const collection = db.collection('snapshotsPending');
    
        // Define the start and end of today
        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();
    
        try {
            // Query for snapshot_ids with today's requested_time
            const snapshots = await collection.find({
                requested_time: { $gte: startOfDay, $lte: endOfDay }
            }).toArray();
    
            const snapshotIds = snapshots.map(snapshot => snapshot.snapshot_id);
    */
    console.log('Snapshot IDs:', snapshotIds);



    for (const snapshotId of snapshotIds) {
        try {
            const data = await fetchData(snapshotId);
            await checkPending(data, snapshotId);
            console.log(`Processed snapshot: ${snapshotId}`);
        } catch (error) {
            console.error(`Error processing snapshot ${snapshotId}:`, error);
        }
    }


    /*
    } catch (error) {
        console.error('Error processing pending checks:', error);
    }
        */
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
