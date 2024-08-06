const { checkPending } = require('./src/function/checkPending'); // Ensure this path is correct
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');


/*
async function processPendingChecks() {
    // Example: Fetching a list of snapshot IDs to process
    const snapshotIds = [
        's_lzigao042o93jb11ou'
    ];

    for (const snapshotId of snapshotIds) {
        try {
            const data = await fetchData(snapshotId);
            await checkPending(data, snapshotId);
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
*/

// Read the parameter from command line arguments
const snapshotId = process.argv[2];

async function processSnapshot(snapshotId) {
    console.log(`Received snapshot ID: ${snapshotId}`);
    // Your existing processing logic here
    // ...
}

// Connect to the database and start processing
connectDB().then(() => {
    processSnapshot(snapshotId).then(() => {
        console.log('Processing completed');
        process.exit(0);
    }).catch((error) => {
        console.error('Error during processing:', error);
        process.exit(1);
    });
}).catch((err) => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
});