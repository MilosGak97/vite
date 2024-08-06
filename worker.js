const { checkPending } = require('./src/function/checkPending'); // Ensure this path is correct
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');

async function processPendingChecks() {
    // Example: Fetching a list of snapshot IDs to process
    const snapshotIds = [
        's_lzigctji2nnuh053ds',
        's_lzigd12l1rqdt90d10',
        's_lzigd7rgjbrld2c4i',
        's_lzigdf0q17p57a94uu',
        's_lzigdmt11igrpsgpt3'
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
