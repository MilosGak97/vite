// src/config/mongodb.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://milo:TheDVTN2020!!!@propertylistings.tdecqcu.mongodb.net/vitemoving?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let db;

const connectDB = async () => {
    if (!db) {
        try {
            await client.connect();
            db = client.db('vitemoving'); // Ensure correct case
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Could not connect to MongoDB", error);
            process.exit(1);
        }
    }
    return db; // Return the database client
};

module.exports = { client, connectDB };
