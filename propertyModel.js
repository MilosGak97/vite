const { connectDB } = require('./mongodb');

let propertiesCollection;

// Initialize MongoDB connection and get collection
connectDB().then(collection => {
    propertiesCollection = collection;
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit process on connection failure
});

// Property model functions
const saveProperty = async (propertyData) => {
    if (!propertiesCollection) {
        throw new Error('MongoDB connection not established');
    }

    try {
        const result = await propertiesCollection.insertOne(propertyData);
        console.log(`Property saved with ID: ${result.insertedId}`);
        return result.insertedId;
    } catch (error) {
        console.error('Error saving property to MongoDB:', error);
        throw error;
    }
};

module.exports = {
    saveProperty,
};
