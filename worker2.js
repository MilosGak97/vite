const { checkPending } = require('./src/function/checkPending'); // Ensure this path is correct
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');

async function processPendingChecks() {
    // Example: Fetching a list of snapshot IDs to process
    const snapshotIds = [
        's_lzkucwlt1pdg58xeo4',
        's_lzkud3wu2btsqpyb1y',
        's_lzkudb0m10b3jmtovl',
        's_lzkuditco8wafu036',
        's_lzkudqxlgypp2w5ko',
        's_lzkudylr17p41ke8mv',
        's_lzkue74c19gkiq3je4',
        's_lzkuef75w8l68oxbq',
        's_lzkuemta1qnjq9mzv',
        's_lzkueuoi1z7o94dh2m',
        's_lzkuf2iv29sbi4c28j',
        's_lzkufagn1a5k205cg2',
        's_lzkufhy38n0zv3nbw',
        's_lzkufp1g1q7ixyi2r0'
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
