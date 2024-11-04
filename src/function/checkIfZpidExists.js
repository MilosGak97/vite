// models/checkIfZpidExists.js
const { client } = require('../config/mongodb');

const checkIfZpidExists = async (zpid) => {
    try {
        const collection = client.db().collection('properties');
        const existingProperty = await collection.findOne({ zpid: zpid });
        if (existingProperty) {
            //console.log('Property with this zpid already exists:', existingProperty);
            return existingProperty; // or you can return the existingProperty itself
        } else {
            //console.log('No property with this zpid found.');
            return false;
        }
    } catch (error) {
        console.error('Error checking zpid:', error);
        throw error;
    }
};

const checkIfZpidExists2 = async (zpid) => {
    try {
        const collection = client.db().collection('listingslas');
        const existingProperty = await collection.findOne({ zpid: zpid });
        if (existingProperty) {
            //console.log('Property with this zpid already exists:', existingProperty);
            return true; // or you can return the existingProperty itself
        } else {
            //console.log('No property with this zpid found.');
            return false;
        }
    } catch (error) {
        console.error('Error checking zpid:', error);
        throw error;
    }
};

module.exports = { checkIfZpidExists, checkIfZpidExists2 };
