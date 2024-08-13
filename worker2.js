const { checkPending } = require('./src/function/checkPending'); // Ensure this path is correct
const { fetchData } = require('./src/function/fetchData');
const { connectDB } = require('./src/config/mongodb');
const moment = require('moment');


async function processPendingChecks() {
    // Example: Fetching a list of snapshot IDs to process
    /*   const snapshotIds = [
           's_lzkufw7h1b01addi7t',
           's_lzkug3kj14rcq7skiu',
           's_lzkugbphgifyn6nzh',
           's_lzkugh7fcq00llj41',
           's_lzkugn6q1wec76557h',
           's_lzkugtva2lz47gtihh',
           's_lzkuh0s329wfz9x057',
           's_lzkuh7vzifc22yrox',
           's_lzkuhf1syles1zxqg',
           's_lzkuhmwl10g80q4frg',
           's_lzkuhvli1q5s7wxghc',
           's_lzkui3pj2nj0naeknz',
           's_lzkuiau42jsvoo6km3',
           's_lzkuiiu9itckqe9w2',
           's_lzkuiq0g2etzenadsc',
           's_lzkuix5d1n5rqwl5ab',
           's_lzkuj4l3ieg7y6n8n',
           's_lzkujbjb26eueqbvf7',
           's_lzkujhvb1uea5fk1h8',
           's_lzkujo6nbvi51koi7',
           's_lzkuju6g2psh2i1zm3',
           's_lzkuk0rv10yvjgo2co',
           's_lzkuk79225v05lvz7w',
           's_lzkukdwl1okcrp8p8g',
           's_lzkukl2j21cd532on8',
           's_lzkuksm48s2mdym45',
           's_lzkukzd3xbuyr15jh',
           's_lzkul67r1hk48movmv',
           's_lzkuldbep4ynvjk1o',
           's_lzkulkck3qh7ppe43',
           's_lzkulrqeyp9eysgjb',
           's_lzkulz3e16g8obwq57',
           's_lzkum5zq1mkugwivpw',
           's_lzkumcfc2k15m8ls12'
       ];*/


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



    } catch (error) {
        console.error('Error processing pending checks:', error);
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
