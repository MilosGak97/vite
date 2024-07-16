const { connectDB } = require('./src/config/mongodb');
const { processWebhooks } = require('./src/workers/webhookWorker');

connectDB()
    .then(() => {
        console.log("MongoDB connected successfully");
        // Example: Processing webhooks every 5 seconds
        setInterval(() => {
            processWebhooks().catch(error => {
                console.error('Failed to process webhooks:', error);
            });
        }, 5000); // Process webhooks every 5 seconds
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });
