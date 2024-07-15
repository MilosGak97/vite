// src/config/mongodb.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://milo:TheDVTN2020!!!@propertylistings.tdecqcu.mongodb.net/propertyListings?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

const connectDB = async () => {
    if (!db) {
        try {
            await client.connect();
            db = client.db('propertyListings'); // Ensure correct case
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Could not connect to MongoDB", error);
            process.exit(1);
        }
    }
    return db.collection('properties'); // Ensure correct case
};

module.exports = { connectDB };
