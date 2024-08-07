const { checkPending } = require('./src/function/checkPending'); // Ensure this path is correct
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');

async function processPendingChecks() {
    // Example: Fetching a list of snapshot IDs to process
    const snapshotIds = [
        's_lzigglhqd1o69mk9h',
        's_lziggszg17shnhsqub',
        's_lziggzgqcdp106w74',
        's_lzigh61e2qebumpbcs',
        's_lzighc8q20ujju9a1d',
        's_lzighibc2apa075wno',
        's_lzighond2e86bbersn',
        's_lzighuwy1ibm2t047w',
        's_lzigi1ei26r9wc9kvo',
        's_lzigi87i15mxpjc4ab',
        's_lzigiflr1g126yk85r',
        's_lzigin2sa6v8tqpg1',
        's_lzigitcg1w19chtw21',
        's_lzigizw3ze0dih9o8'
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
