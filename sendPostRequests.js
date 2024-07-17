const axios = require('axios');
const { connectDB, client } = require('./src/config/mongodb');

async function sendPostRequests(req, res) {
    try {
        const body = [
            { "url": "https://www.zillow.com/homedetails/12-Hamilton-Ct-Lawrence-Township-NJ-08648/39004401_zpid/" },
            { "url": "https://www.zillow.com/homedetails/58-Montague-Ave-Ewing-NJ-08628/52622353_zpid/" },
            { "url": "https://www.zillow.com/homedetails/16-Brooktree-Rd-East-Windsor-NJ-08520/38956212_zpid/" },
            { "url": "https://www.zillow.com/homedetails/15-Woosamonsa-Rd-Pennington-NJ-08534/38994390_zpid/" },
            { "url": "https://www.zillow.com/homedetails/7-Brandywine-Way-Hamilton-NJ-08690/38976552_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1516-Cornell-Ave-Hamilton-NJ-08619/38972282_zpid/" },
            { "url": "https://www.zillow.com/homedetails/143-Lakedale-Dr-Lawrence-Township-NJ-08648/38999646_zpid/" },
            { "url": "https://www.zillow.com/homedetails/75-Athens-Ave-South-Amboy-NJ-08879/39120959_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-La-Jolla-Ct-Old-Bridge-NJ-08857/114473412_zpid/" },
            { "url": "https://www.zillow.com/homedetails/25-Philip-Dr-Princeton-NJ-08540/39012566_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3843-Park-Ave-Edison-NJ-08820/39080901_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Disbrow-Ct-East-Brunswick-NJ-08816/39048275_zpid/" },
            { "url": "https://www.zillow.com/homedetails/177-Dartmouth-St-Highland-Park-NJ-08904/39086112_zpid/" },
            { "url": "https://www.zillow.com/homedetails/23-Central-Pl-Branchburg-NJ-08876/39850002_zpid/" },
            { "url": "https://www.zillow.com/homedetails/55-Leuckel-Ave-Hamilton-NJ-08619/38975828_zpid/" },
            { "url": "https://www.zillow.com/homedetails/25-Cowperthwaite-Rd-Bedminster-NJ-07921/39831961_zpid/" },
            { "url": "https://www.zillow.com/homedetails/635-Prospect-Ave-Little-Silver-NJ-07739/39283498_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Tara-Dr-Matawan-NJ-07747/39119971_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Springhill-Dr-Howell-NJ-07731/39265395_zpid/" },
            { "url": "https://www.zillow.com/homedetails/7-David-Dr-Old-Bridge-NJ-08857/39126731_zpid/" },
            { "url": "https://www.zillow.com/homedetails/193-Milltown-Rd-Bridgewater-NJ-08807/39853372_zpid/" },
            { "url": "https://www.zillow.com/homedetails/828-Dunellen-Ave-Dunellen-NJ-08812/39046091_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1-Desai-Ct-Freehold-NJ-07728/39275603_zpid/" },
            { "url": "https://www.zillow.com/homedetails/386-Taylors-Mills-Rd-Manalapan-NJ-07726/39298561_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Doherty-Dr-Middletown-NJ-07748/39329945_zpid/" },
            { "url": "https://www.zillow.com/homedetails/38-Buttonwood-Dr-Marlboro-NJ-07746/39307733_zpid/" },
            { "url": "https://www.zillow.com/homedetails/108-Clinton-Pl-Neptune-NJ-07753/124761862_zpid/" },
            { "url": "https://www.zillow.com/homedetails/510-Jarrard-St-Piscataway-NJ-08854/39144151_zpid/" },
            { "url": "https://www.zillow.com/homedetails/90-Round-Top-Rd-Bernardsville-NJ-07924/39845483_zpid/" },
            { "url": "https://www.zillow.com/homedetails/29-Stockton-Rd-S-Kendall-Park-NJ-08824/377610464_zpid/" },
            { "url": "https://www.zillow.com/homedetails/25-Ashland-Pl-North-Brunswick-NJ-08902/39115606_zpid/" },
            { "url": "https://www.zillow.com/homedetails/44-Dewitt-Ter-Colonia-NJ-07067/39205367_zpid/" },
            { "url": "https://www.zillow.com/homedetails/110-Taylors-Mills-Rd-Manalapan-NJ-07726/39298268_zpid/" },
            { "url": "https://www.zillow.com/homedetails/383-Brook-Ave-North-Plainfield-NJ-07062/39904251_zpid/" },
            { "url": "https://www.zillow.com/homedetails/17-Beaumont-Rd-Hamilton-NJ-08620/38988856_zpid/" },
            { "url": "https://www.zillow.com/homedetails/12-Kremer-Ave-Eatontown-NJ-07724/39233392_zpid/" },
            { "url": "https://www.zillow.com/homedetails/54-Nevsky-St-Edison-NJ-08820/39080066_zpid/" },
            { "url": "https://www.zillow.com/homedetails/412-Chain-O-Hills-Rd-Colonia-NJ-07067/39199633_zpid/" },
            { "url": "https://www.zillow.com/homedetails/2-Appaloosa-Dr-Manalapan-NJ-07726/39301703_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1547-Sterling-Dr-Manasquan-NJ-08736/70158611_zpid/" },
            { "url": "https://www.zillow.com/homedetails/2-Soltes-Ave-Carteret-NJ-07008/55543398_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Timber-Grove-Ct-Old-Bridge-NJ-08857/88938474_zpid/" },
            { "url": "https://www.zillow.com/homedetails/10-Center-Ave-Leonardo-NJ-07737/39321568_zpid/" },
            { "url": "https://www.zillow.com/homedetails/57-Hartman-Dr-Hamilton-NJ-08690/38973698_zpid/" },
            { "url": "https://www.zillow.com/homedetails/413-New-Market-Rd-Piscataway-NJ-08854/39141563_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1623-Twin-Lakes-Dr-Manasquan-NJ-08736/61907885_zpid/" },
            { "url": "https://www.zillow.com/homedetails/416-Central-Ave-Spring-Lake-NJ-07762/325562560_zpid/" },
            { "url": "https://www.zillow.com/homedetails/294-Ocean-Blvd-Long-Branch-NJ-07740/39288104_zpid/" },
            { "url": "https://www.zillow.com/homedetails/14-Magnolia-Ct-Monroe-Township-NJ-08831/61835050_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Gates-Ct-West-Windsor-NJ-08550/39038222_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Lochatong-Rd-Ewing-NJ-08628/38965517_zpid/" },
            { "url": "https://www.zillow.com/homedetails/4-Twin-Ter-Holmdel-NJ-07733/39261769_zpid/" },
            { "url": "https://www.zillow.com/homedetails/224-Osborn-St-Keyport-NJ-07735/39107573_zpid/" },
            { "url": "https://www.zillow.com/homedetails/25-Candlewood-Dr-Hillsborough-NJ-08844/39862243_zpid/" },
            { "url": "https://www.zillow.com/homedetails/5-Pearl-St-Perrineville-NJ-08535/39293697_zpid/" },
            { "url": "https://www.zillow.com/homedetails/111-Woodbridge-Ave-Highland-Park-NJ-08904/39141682_zpid/" },
            { "url": "https://www.zillow.com/homedetails/38-Turtle-Creek-Rd-Skillman-NJ-08558/39103101_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Nottingham-Way-Basking-Ridge-NJ-07920/39836583_zpid/" },
            { "url": "https://www.zillow.com/homedetails/328-Pleasant-Plains-Rd-Staten-Island-NY-10309/32337273_zpid/" },
            { "url": "https://www.zillow.com/homedetails/70-Campbell-Ave-Edison-NJ-08817/39132317_zpid/" },
            { "url": "https://www.zillow.com/homedetails/22-Knothe-Rd-Madison-NJ-07940/39811468_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Normandy-Cir-Colts-Neck-NJ-07722/39248850_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Woodland-Rd-Eatontown-NJ-07724/39233162_zpid/" },
            { "url": "https://www.zillow.com/homedetails/92-Stonybrook-Rd-Hopewell-NJ-08525/39000246_zpid/" },
            { "url": "https://www.zillow.com/homedetails/17-Stonerise-Dr-Lawrence-Township-NJ-08648/39005188_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Sturbridge-Dr-Hamilton-NJ-08620/38989171_zpid/" },
            { "url": "https://www.zillow.com/homedetails/2-Beekman-Rd-Kendall-Park-NJ-08824/39113917_zpid/" },
            { "url": "https://www.zillow.com/homedetails/11-Tartan-Dr-Monroe-Township-NJ-08831/61845157_zpid/" },
            { "url": "https://www.zillow.com/homedetails/37-Davenport-Dr-Staten-Island-NY-10312/32332148_zpid/" },
            { "url": "https://www.zillow.com/homedetails/12-Woodside-Dr-Cranbury-NJ-08512/39108669_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Bellagio-Rd-Hamilton-NJ-08690/38972587_zpid/" },
            { "url": "https://www.zillow.com/homedetails/15-Forest-Dr-Colts-Neck-NJ-07722/39249022_zpid/" },
            { "url": "https://www.zillow.com/homedetails/37-Eagle-Ridge-Way-Clarksburg-NJ-08510/39273816_zpid/" },
            { "url": "https://www.zillow.com/homedetails/12-Pentland-Ct-Bedminster-NJ-07921/39830163_zpid/" },
            { "url": "https://www.zillow.com/homedetails/311-Hatfield-St-New-Brunswick-NJ-08901/39118778_zpid/" },
            { "url": "https://www.zillow.com/homedetails/129-Putnam-Ave-North-Plainfield-NJ-07060/39900555_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Crestwood-Dr-Freehold-NJ-07728/39275641_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1017-Edmonds-Ave-Drexel-Hill-PA-19026/38160506_zpid/" },
            { "url": "https://www.zillow.com/homedetails/68-S-Middletown-Rd-Nanuet-NY-10954/2083364017_zpid/" },
            { "url": "https://www.zillow.com/homedetails/23-Tumble-Idell-Rd-Ewing-NJ-08638/38962168_zpid/" },
            { "url": "https://www.zillow.com/homedetails/20-Winchester-Ct-Princeton-NJ-08540/39011773_zpid/" },
            { "url": "https://www.zillow.com/homedetails/5-Royce-Brook-Ct-Somerville-NJ-08876/39857583_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1865-Oak-Rd-Millstone-Township-NJ-08535/39292718_zpid/" },
            { "url": "https://www.zillow.com/homedetails/40-Longwood-Dr-Hamilton-NJ-08620/38988718_zpid/" },
            { "url": "https://www.zillow.com/homedetails/23-Sleepy-Hollow-Dr-Colts-Neck-NJ-07722/39248013_zpid/" },
            { "url": "https://www.zillow.com/homedetails/197-Washington-Valley-Rd-Warren-NJ-07059/39869200_zpid/" },
            { "url": "https://www.zillow.com/homedetails/4-Margaret-Dr-Clark-NJ-07066/39197914_zpid/" },
            { "url": "https://www.zillow.com/homedetails/62-Hooper-Ave-Atlantic-Highlands-NJ-07716/39275626_zpid/" },
            { "url": "https://www.zillow.com/homedetails/37-Carlton-Ave-Marlboro-NJ-07746/39305511_zpid/" },
            { "url": "https://www.zillow.com/homedetails/10-Oakland-St-Old-Bridge-NJ-08857/40012843_zpid/" }
        ];


        const datasetId = "gd_lfqkr8wm13ixtbd8f5";
        const endpoint = 'https://propertylisting-d1c1e167e1b1.herokuapp.com/webh';
        const format = 'json';
        const uncompressedWebhook = false;
        const headers = {
            'Content-Type': 'application/gzip',
            'dca-collection-id': 's_lyokoc2y2led7hycvu',
            'content-encoding': 'gzip',
            'dca-dataset': 'true',
            'User-Agent': 'BRD dca-ds-delivery-worker/1.473.306',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Authorization': 'Bearer a3a53d23-02a3-4b70-93b6-09cd3eda8f39'
        };

        const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${encodeURIComponent(endpoint)}&format=${format}&uncompressed_webhook=${uncompressedWebhook}`;

        const response = await axios.post(url, body, { headers });
        console.log(`Response for ${body[0].url}:`, response.data.snapshot_id);

        const snapshotId = response.data.snapshot_id;
        console.log(snapshotId);

        async function fetchData(snapshotId) {
            const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
            const url2 = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

            while (true) {
                try {
                    const response = await axios.get(url2, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (response.data.status === 'running') {
                        console.log('Snapshot is not ready yet, trying again in 10 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
                    } else {
                        console.log('Response data:', response.data);
                        listAllListings(response.data);
                        return response.data;
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    throw error; // or handle gracefully
                }
            }
        }

        async function listAllListings(data) {
            if (Array.isArray(data)) {
                const dataArray = data;
                const collection = client.db().collection('properties');

                // Logging individual items and inserting into MongoDB
                for (let i = 0; i < dataArray.length; i++) {
                    const listing = dataArray[i];
                    console.log("URL: ", listing.url);
                    console.log("ZPID: ", listing.zpid);
                    console.log("City: ", listing.city);
                    const propertyData = {
                        url: listing.url,
                        zpid: listing.zpid,
                        address: listing.address,
                        city: listing.city,
                        state: listing.state,
                        zipcode: listing.zipcode,
                        bedrooms: listing.bedrooms,
                        bathrooms: listing.bathrooms,
                        price: listing.price,
                        longitude: listing.longitude,
                        latitude: listing.latitude,
                        hasBadGeocode: listing.hasBadGeocode,
                        homeType: listing.homeType,
                        isNonOwnerOccupied: listing.isNonOwnerOccupied,
                        parcelId: listing.parcelId,
                        daysOnZillow: listing.daysOnZillow,
                        propertyTypeDimension: listing.propertyTypeDimension,
                        hdpTypeDimension: listing.hdpTypeDimension,
                        listingTypeDimension: listing.listingTypeDimension,
                        is_listed_by_management_company: listing.is_listed_by_management_company,
                        listing_provided_by_name: listing.listing_provided_by_name,
                        listing_provided_by_email: listing.listing_provided_by_email,
                        listing_provided_by_company: listing.listing_provided_by_company,
                        photoCount: listing.photoCount,
                        photo: listing.photo
                    };

                    await collection.insertOne(propertyData);
                }
            } else {
                console.log('Data is not in expected array format');
            }
        }

        try {
            await client.connect();
            const data = await fetchData(snapshotId);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching data' });
        } finally {
            console.log("Bravo, gotovo je!")
        }
    } catch (error) {
        console.error('Error sending POST request:', error);
        res.status(500).json({ error: 'Failed to send POST request' });
    }
}

module.exports = sendPostRequests;
