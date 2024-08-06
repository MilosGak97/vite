const { checkPending } = require('./src/function/checkPending'); // Ensure this path is correct
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');

async function processPendingChecks() {
    // Example: Fetching a list of snapshot IDs to process
    const snapshotIds = [
        's_lzigavwhlahozf6kv',
        's_lzigb3vttixk57f4l',
        's_lzigbbcj10mlwi9ybt',
        's_lzigbjbncn8v0c5yh',
        's_lzigbrczes55vgow',
        's_lzigbyy6jqx5sp1l5',
        's_lzigc6maf3ltgnvry',
        's_lzigcedchaokcnhbr',
        's_lzigcm5yup6unnjox' // Add more snapshot IDs as needed
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
