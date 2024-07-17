const axios = require('axios');

// Function to fetch data from Bright Data API
/*
async function fetchData(snapshotId) {
    const accessToken = 'a3a53d23-02a3-4b70-93b6-09cd3eda8f39';
    const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('Response dataYEEEEEY:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // or handle gracefully
    }
}
*/
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
            { "url": "https://www.zillow.com/homedetails/224-Osborn-St-Keyport-NJ-07735/39281274_zpid/" },
            { "url": "https://www.zillow.com/homedetails/4-Wellington-Pl-Parlin-NJ-08859/39123157_zpid/" },
            { "url": "https://www.zillow.com/homedetails/2-Morris-Pl-Edison-NJ-08820/39082240_zpid/" },
            { "url": "https://www.zillow.com/homedetails/27-Heyward-Hills-Dr-Princeton-NJ-08540/39847966_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Sussex-Rd-Old-Bridge-NJ-08857/39124053_zpid/" },
            { "url": "https://www.zillow.com/homedetails/68-Clover-St-Orange-NJ-07050/40020576_zpid/" },
            { "url": "https://www.zillow.com/homedetails/31-Nature-Blvd-Jackson-NJ-08527/40057178_zpid/" },
            { "url": "https://www.zillow.com/homedetails/405-Lincoln-Ave-Dunellen-NJ-08812/39045310_zpid/" },
            { "url": "https://www.zillow.com/homedetails/2-Winding-Way-Piscataway-NJ-08854/39140309_zpid/" },
            { "url": "https://www.zillow.com/homedetails/70-Demott-Ln-Somerset-NJ-08873/39159511_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-W-River-Rd-Rumson-NJ-07760/39286228_zpid/" },
            { "url": "https://www.zillow.com/homedetails/129-Water-St-New-Brunswick-NJ-08901/39149887_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-Bogert-Dr-Washington-Township-NJ-07676/38077526_zpid/" },
            { "url": "https://www.zillow.com/homedetails/153-Phillips-Mill-Rd-New-Hope-PA-18938/10126482_zpid/" },
            { "url": "https://www.zillow.com/homedetails/37-Brookside-Dr-Randolph-NJ-07869/39815396_zpid/" },
            { "url": "https://www.zillow.com/homedetails/146-Jessica-Ln-Monroe-Township-NJ-08831/89039358_zpid/" },
            { "url": "https://www.zillow.com/homedetails/100-Crescent-Dr-Middlesex-NJ-08846/39103063_zpid/" },
            { "url": "https://www.zillow.com/homedetails/220-Piscataway-Rd-Highland-Park-NJ-08904/39086163_zpid/" },
            { "url": "https://www.zillow.com/homedetails/55-Muirhead-St-Highland-Park-NJ-08904/39086423_zpid/" },
            { "url": "https://www.zillow.com/homedetails/33-Pleasant-Ridge-Rd-Caldwell-NJ-07006/40026598_zpid/" },
            { "url": "https://www.zillow.com/homedetails/37-Jefferson-Pl-Cranbury-NJ-08512/39006283_zpid/" },
            { "url": "https://www.zillow.com/homedetails/112-Orange-St-Manasquan-NJ-08736/70158655_zpid/" },
            { "url": "https://www.zillow.com/homedetails/505-Langford-Ln-Manalapan-NJ-07726/39402638_zpid/" },
            { "url": "https://www.zillow.com/homedetails/85-S-Church-Rd-Middletown-NJ-07748/39326464_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1138-Tower-Rd-Wall-Township-NJ-07719/39403662_zpid/" },
            { "url": "https://www.zillow.com/homedetails/110-Hurley-Dr-Freehold-NJ-07728/39408797_zpid/" },
            { "url": "https://www.zillow.com/homedetails/55-Hartman-Dr-Hamilton-NJ-08690/38973706_zpid/" },
            { "url": "https://www.zillow.com/homedetails/115-Fox-Hill-Rd-Piscataway-NJ-08854/39140223_zpid/" },
            { "url": "https://www.zillow.com/homedetails/25-Wendover-Rd-Yardley-PA-19067/9669149_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1033-Pinewood-Dr-Monmouth-Junction-NJ-08852/39132588_zpid/" },
            { "url": "https://www.zillow.com/homedetails/74-Beechwood-Dr-Cranbury-NJ-08512/39005825_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1151-Alexander-Ave-Union-NJ-07083/40079266_zpid/" },
            { "url": "https://www.zillow.com/homedetails/60-Old-New-York-Rd-Bordentown-NJ-08505/39027425_zpid/" },
            { "url": "https://www.zillow.com/homedetails/18-Morningside-Rd-Colts-Neck-NJ-07722/39258470_zpid/" },
            { "url": "https://www.zillow.com/homedetails/307-Hawthorne-St-Browns-Mills-NJ-08015/38064167_zpid/" },
            { "url": "https://www.zillow.com/homedetails/98-Elm-St-Florence-NJ-08518/39122553_zpid/" },
            { "url": "https://www.zillow.com/homedetails/119-Oakwood-Ct-Medford-NJ-08055/38092884_zpid/" },
            { "url": "https://www.zillow.com/homedetails/405-Hoffman-St-Franklinville-NJ-08322/38205856_zpid/" },
            { "url": "https://www.zillow.com/homedetails/127-Hickory-Ln-Glassboro-NJ-08028/38225475_zpid/" },
            { "url": "https://www.zillow.com/homedetails/66-Ledden-Ln-Lawrence-Township-NJ-08648/39003488_zpid/" },
            { "url": "https://www.zillow.com/homedetails/21-Arlington-Blvd-Woolwich-Township-NJ-08085/38274292_zpid/" },
            { "url": "https://www.zillow.com/homedetails/22-Landings-Dr-Lumberton-NJ-08048/38099516_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1336-Charleston-Ave-Gloucester-City-NJ-08030/38223418_zpid/" },
            { "url": "https://www.zillow.com/homedetails/7-Macintosh-Ln-Tabernacle-NJ-08088/38089869_zpid/" },
            { "url": "https://www.zillow.com/homedetails/32-Candlelight-Dr-Tabernacle-NJ-08088/38090166_zpid/" },
            { "url": "https://www.zillow.com/homedetails/51-Delaware-River-Dr-Pennsville-NJ-08070/38237645_zpid/" },
            { "url": "https://www.zillow.com/homedetails/54-N-Main-St-Swedesboro-NJ-08085/38274592_zpid/" },
            { "url": "https://www.zillow.com/homedetails/136-County-Road-519-Bloomsbury-NJ-08804/39927684_zpid/" },
            { "url": "https://www.zillow.com/homedetails/26-Harding-Ave-Dover-NJ-07801/39806555_zpid/" },
            { "url": "https://www.zillow.com/homedetails/22-Lake-Shore-Dr-Sandyston-NJ-07826/39823530_zpid/" },
            { "url": "https://www.zillow.com/homedetails/47-Grove-Rd-Hope-NJ-07844/39832683_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1607-Edwin-Rd-Toms-River-NJ-08755/39193236_zpid/" },
            { "url": "https://www.zillow.com/homedetails/28-Bay-Harbour-Blvd-Brick-NJ-08723/39197188_zpid/" },
            { "url": "https://www.zillow.com/homedetails/2317-Lauren-Ln-Manasquan-NJ-08736/61907946_zpid/" },
            { "url": "https://www.zillow.com/homedetails/21-Baremore-Rd-Scotch-Plains-NJ-07076/40071731_zpid/" },
            { "url": "https://www.zillow.com/homedetails/16-Patrick-Ave-Florham-Park-NJ-07932/40007984_zpid/" },
            { "url": "https://www.zillow.com/homedetails/12-Andrew-St-Jackson-NJ-08527/40055192_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Sunrise-Ter-Mahwah-NJ-07430/37951689_zpid/" },
            { "url": "https://www.zillow.com/homedetails/13-Pine-Ave-Mahwah-NJ-07430/37951596_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Craig-Pl-Mahwah-NJ-07430/37951544_zpid/" },
            { "url": "https://www.zillow.com/homedetails/19-Pleasant-Ridge-Rd-Washington-Township-NJ-07676/38078547_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Wildwood-Dr-Randolph-NJ-07869/39815377_zpid/" },
            { "url": "https://www.zillow.com/homedetails/212-Northfield-Rd-Bedminster-NJ-07921/39832323_zpid/" },
            { "url": "https://www.zillow.com/homedetails/11-Tuttle-St-Middletown-NJ-07748/39326977_zpid/" },
            { "url": "https://www.zillow.com/homedetails/11-Whitman-St-Old-Bridge-NJ-08857/38997800_zpid/" },
            { "url": "https://www.zillow.com/homedetails/407-Simon-Ave-Hackettstown-NJ-07840/40027896_zpid/" },
            { "url": "https://www.zillow.com/homedetails/219-Sunnymede-St-Englewood-NJ-07631/37975211_zpid/" },
            { "url": "https://www.zillow.com/homedetails/39-Lewis-St-Raritan-NJ-08869/39852664_zpid/" },
            { "url": "https://www.zillow.com/homedetails/37-Glenside-Dr-Blauvelt-NY-10913/33097439_zpid/" },
            { "url": "https://www.zillow.com/homedetails/41-Tudor-Cir-Roslyn-Heights-NY-11577/2062349045_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Harborview-Rd-Setauket-NY-11733/2062336913_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1-Mill-Rd-Eastchester-NY-10709/2062311981_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1-Pine-Valley-Dr-Stony-Point-NY-10980/2062282621_zpid/" },
            { "url": "https://www.zillow.com/homedetails/10-Coleman-Dr-Rye-NY-10580/2062313545_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1-Lake-Dr-East-Hampton-NY-11937/2076534131_zpid/" },
            { "url": "https://www.zillow.com/homedetails/107-Harbor-Ln-Bayville-NY-11709/2062342678_zpid/" },
            { "url": "https://www.zillow.com/homedetails/112-Asharoken-Ave-Northport-NY-11768/2062332717_zpid/" },
            { "url": "https://www.zillow.com/homedetails/112-Park-Cir-Mamaroneck-NY-10543/2062274073_zpid/" },
            { "url": "https://www.zillow.com/homedetails/114-E-Circuit-Rd-Tuxedo-Park-NY-10987/2076634441_zpid/" },
            { "url": "https://www.zillow.com/homedetails/118-River-Ave-Massapequa-Park-NY-11762/2062311889_zpid/" },
            { "url": "https://www.zillow.com/homedetails/132-Boston-Post-Rd-Waterford-CT-06385/173434603_zpid/" },
            { "url": "https://www.zillow.com/homedetails/16-Captains-Walk-Bay-Shore-NY-11706/2062324393_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1628-Central-Ave-Far-Rockaway-NY-11691/2082123752_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1-N-Surrey-Dr-Great-Neck-NY-11021/2071765076_zpid/" },
            { "url": "https://www.zillow.com/homedetails/193-Forge-Rd-Medford-NY-11763/2062325806_zpid/" },
            { "url": "https://www.zillow.com/homedetails/21-E-Hills-Rd-Corona-NY-11368/2071766820_zpid/" },
            { "url": "https://www.zillow.com/homedetails/24-Continental-Dr-S-Poughkeepsie-NY-12603/2062342086_zpid/" },
            { "url": "https://www.zillow.com/homedetails/2-Winterberry-Ln-Mount-Kisco-NY-10549/2062283415_zpid/" },
            { "url": "https://www.zillow.com/homedetails/221-Heritage-Hls-Unit-B-Somers-NY-10589/2076634447_zpid/" },
            { "url": "https://www.zillow.com/homedetails/35-Ridgefield-Rd-Smithtown-NY-11787/2062324730_zpid/" },
            { "url": "https://www.zillow.com/homedetails/5-Cathedral-Ave-Hempstead-NY-11550/2076545131_zpid/" },
            { "url": "https://www.zillow.com/homedetails/53-Colonial-Dr-Massapequa-NY-11758/2062319820_zpid/" },
            { "url": "https://www.zillow.com/homedetails/58-Harbor-Cir-Roslyn-NY-11576/2062348960_zpid/" },
            { "url": "https://www.zillow.com/homedetails/60-Lake-Shore-Rd-Rocky-Point-NY-11778/2062323797_zpid/" },
            { "url": "https://www.zillow.com/homedetails/7-Canterbury-Rd-Great-Neck-NY-11021/2071792812_zpid/" },
            { "url": "https://www.zillow.com/homedetails/7-Marine-St-City-Island-NY-10464/2062276330_zpid/" },
            { "url": "https://www.zillow.com/homedetails/71-N-Harborview-Rd-Setauket-NY-11733/2062336911_zpid/" },
            { "url": "https://www.zillow.com/homedetails/73-Palisade-Blvd-Palisades-NY-10964/33097448_zpid/" },
            { "url": "https://www.zillow.com/homedetails/81-Deer-Run-Mount-Kisco-NY-10549/2062280410_zpid/" },
            { "url": "https://www.zillow.com/homedetails/99-Lowell-Rd-North-Massapequa-NY-11758/2076644448_zpid/" },
            { "url": "https://www.zillow.com/homedetails/1485-Galley-Ave-West-Islip-NY-11795/2062312780_zpid/" },
            { "url": "https://www.zillow.com/homedetails/23-Donmoor-Pl-Scotch-Plains-NJ-07076/40070758_zpid/" },
            { "url": "https://www.zillow.com/homedetails/408-Greaves-Ave-Staten-Island-NY-10308/32302534_zpid/" },
            { "url": "https://www.zillow.com/homedetails/128-Peppermint-Rd-Mahopac-NY-10541/2062280097_zpid/" },
            { "url": "https://www.zillow.com/homedetails/163-Nesconset-Port-Jefferson-Hwy-Port-Jefferson-Station-NY-11776/2062324833_zpid/" },
            { "url": "https://www.zillow.com/homedetails/15-Foxwood-Rd-Westhampton-Beach-NY-11978/2076638151_zpid/" },
            { "url": "https://www.zillow.com/homedetails/213-E-Halls-Corner-Rd-Dover-Plains-NY-12522/2062313334_zpid/" },
            { "url": "https://www.zillow.com/homedetails/22-Willowbrook-Ln-Mount-Kisco-NY-10549/2062280223_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Mountain-Top-Rd-Hopewell-NJ-08525/39073196_zpid/" },
            { "url": "https://www.zillow.com/homedetails/24-Knightsbridge-Rd-Great-Neck-NY-11021/2071793016_zpid/" },
            { "url": "https://www.zillow.com/homedetails/276-Livingston-St-New-Haven-CT-06511/174107916_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Greyrock-Rd-Cos-Cob-CT-06807/177212776_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Lakeview-Dr-Old-Saybrook-CT-06475/2062197787_zpid/" },
            { "url": "https://www.zillow.com/homedetails/30-Arcadia-Rd-Old-Greenwich-CT-06870/177223347_zpid/" },
            { "url": "https://www.zillow.com/homedetails/301-Clubhouse-Rd-Avon-CT-06001/2076637876_zpid/" },
            { "url": "https://www.zillow.com/homedetails/39-Shadblow-Ln-Madison-CT-06443/2062124580_zpid/" },
            { "url": "https://www.zillow.com/homedetails/5-Hamilton-Ave-Madison-CT-06443/2062124488_zpid/" },
            { "url": "https://www.zillow.com/homedetails/7-Chester-Ferry-Rd-Haddam-CT-06438/2062213796_zpid/" },
            { "url": "https://www.zillow.com/homedetails/7-Treetop-Ln-Weston-CT-06883/2071665887_zpid/" },
            { "url": "https://www.zillow.com/homedetails/72-Stoddards-View-Rd-Morris-CT-06763/2076638158_zpid/" },
            { "url": "https://www.zillow.com/homedetails/89-Blueberry-Hill-Rd-Killingworth-CT-06419/2076645745_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-N-Seir-Hill-Rd-Norwalk-CT-06850/177226127_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-Ridgewood-Dr-New-Haven-CT-06511/174106824_zpid/" },
            { "url": "https://www.zillow.com/homedetails/98-Melba-St-Unit-203-Milford-CT-06460/2076639411_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Melba-St-Milford-CT-06460/177235514_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Overbrook-Dr-Weston-CT-06883/177193014_zpid/" },
            { "url": "https://www.zillow.com/homedetails/41-Central-Rd-Rye-NY-10580/2071711808_zpid/" },
            { "url": "https://www.zillow.com/homedetails/46-Wolcott-Rd-Brookfield-CT-06804/177221162_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Hickory-Ridge-Ln-Harrison-NY-10528/2062273202_zpid/" },
            { "url": "https://www.zillow.com/homedetails/96-Boston-Post-Rd-Waterford-CT-06385/173434602_zpid/" },
            { "url": "https://www.zillow.com/homedetails/20-Western-Park-Rd-Westport-CT-06880/177217352_zpid/" },
            { "url": "https://www.zillow.com/homedetails/280-Aspetuck-Trl-Weston-CT-06883/177178929_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Shady-Ln-Darien-CT-06820/177209021_zpid/" },
            { "url": "https://www.zillow.com/homedetails/350-Wayside-Ln-Orange-CT-06477/177253163_zpid/" },
            { "url": "https://www.zillow.com/homedetails/40-Quarry-Ridge-Rd-Washington-Depot-CT-06794/2071654082_zpid/" },
            { "url": "https://www.zillow.com/homedetails/41-Dearfield-Dr-Greenwich-CT-06831/177224162_zpid/" },
            { "url": "https://www.zillow.com/homedetails/53-Chestnut-Hill-Rd-Killingworth-CT-06419/2062118688_zpid/" },
            { "url": "https://www.zillow.com/homedetails/56-Hickory-Knoll-Dr-Killingworth-CT-06419/2062118700_zpid/" },
            { "url": "https://www.zillow.com/homedetails/58-Davis-Ln-Middlefield-CT-06455/2076642468_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Carey-Rd-West-Redding-CT-06896/177238473_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Daniels-Farm-Rd-Wilton-CT-06897/177241409_zpid/" },
            { "url": "https://www.zillow.com/homedetails/61-Dandy-Dr-Madison-CT-06443/2062124554_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Ridgewood-Rd-Higganum-CT-06441/2062206024_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Stanwich-Rd-Greenwich-CT-06830/177217452_zpid/" },
            { "url": "https://www.zillow.com/homedetails/68-Creamery-Rd-South-Kent-CT-06785/177187478_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Irvington-Ln-Ridgefield-CT-06877/2071604176_zpid/" },
            { "url": "https://www.zillow.com/homedetails/81-W-Hollow-Rd-Woodbury-CT-06798/2062222067_zpid/" },
            { "url": "https://www.zillow.com/homedetails/89-Blueberry-Hill-Rd-Killingworth-CT-06419/2076645745_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-N-Seir-Hill-Rd-Norwalk-CT-06850/177226127_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-Ridgewood-Dr-New-Haven-CT-06511/174106824_zpid/" },
            { "url": "https://www.zillow.com/homedetails/98-Melba-St-Unit-203-Milford-CT-06460/2076639411_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Melba-St-Milford-CT-06460/177235514_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Overbrook-Dr-Weston-CT-06883/177193014_zpid/" },
            { "url": "https://www.zillow.com/homedetails/41-Central-Rd-Rye-NY-10580/2071711808_zpid/" },
            { "url": "https://www.zillow.com/homedetails/46-Wolcott-Rd-Brookfield-CT-06804/177221162_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Hickory-Ridge-Ln-Harrison-NY-10528/2062273202_zpid/" },
            { "url": "https://www.zillow.com/homedetails/96-Boston-Post-Rd-Waterford-CT-06385/173434602_zpid/" },
            { "url": "https://www.zillow.com/homedetails/20-Western-Park-Rd-Westport-CT-06880/177217352_zpid/" },
            { "url": "https://www.zillow.com/homedetails/280-Aspetuck-Trl-Weston-CT-06883/177178929_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Shady-Ln-Darien-CT-06820/177209021_zpid/" },
            { "url": "https://www.zillow.com/homedetails/350-Wayside-Ln-Orange-CT-06477/177253163_zpid/" },
            { "url": "https://www.zillow.com/homedetails/40-Quarry-Ridge-Rd-Washington-Depot-CT-06794/2071654082_zpid/" },
            { "url": "https://www.zillow.com/homedetails/41-Dearfield-Dr-Greenwich-CT-06831/177224162_zpid/" },
            { "url": "https://www.zillow.com/homedetails/53-Chestnut-Hill-Rd-Killingworth-CT-06419/2062118688_zpid/" },
            { "url": "https://www.zillow.com/homedetails/56-Hickory-Knoll-Dr-Killingworth-CT-06419/2062118700_zpid/" },
            { "url": "https://www.zillow.com/homedetails/58-Davis-Ln-Middlefield-CT-06455/2076642468_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Carey-Rd-West-Redding-CT-06896/177238473_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Daniels-Farm-Rd-Wilton-CT-06897/177241409_zpid/" },
            { "url": "https://www.zillow.com/homedetails/61-Dandy-Dr-Madison-CT-06443/2062124554_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Ridgewood-Rd-Higganum-CT-06441/2062206024_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Stanwich-Rd-Greenwich-CT-06830/177217452_zpid/" },
            { "url": "https://www.zillow.com/homedetails/68-Creamery-Rd-South-Kent-CT-06785/177187478_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Irvington-Ln-Ridgefield-CT-06877/2071604176_zpid/" },
            { "url": "https://www.zillow.com/homedetails/81-W-Hollow-Rd-Woodbury-CT-06798/2062222067_zpid/" },
            { "url": "https://www.zillow.com/homedetails/89-Blueberry-Hill-Rd-Killingworth-CT-06419/2076645745_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-N-Seir-Hill-Rd-Norwalk-CT-06850/177226127_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-Ridgewood-Dr-New-Haven-CT-06511/174106824_zpid/" },
            { "url": "https://www.zillow.com/homedetails/98-Melba-St-Unit-203-Milford-CT-06460/2076639411_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Melba-St-Milford-CT-06460/177235514_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Overbrook-Dr-Weston-CT-06883/177193014_zpid/" },
            { "url": "https://www.zillow.com/homedetails/41-Central-Rd-Rye-NY-10580/2071711808_zpid/" },
            { "url": "https://www.zillow.com/homedetails/46-Wolcott-Rd-Brookfield-CT-06804/177221162_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Hickory-Ridge-Ln-Harrison-NY-10528/2062273202_zpid/" },
            { "url": "https://www.zillow.com/homedetails/96-Boston-Post-Rd-Waterford-CT-06385/173434602_zpid/" },
            { "url": "https://www.zillow.com/homedetails/20-Western-Park-Rd-Westport-CT-06880/177217352_zpid/" },
            { "url": "https://www.zillow.com/homedetails/280-Aspetuck-Trl-Weston-CT-06883/177178929_zpid/" },
            { "url": "https://www.zillow.com/homedetails/3-Shady-Ln-Darien-CT-06820/177209021_zpid/" },
            { "url": "https://www.zillow.com/homedetails/350-Wayside-Ln-Orange-CT-06477/177253163_zpid/" },
            { "url": "https://www.zillow.com/homedetails/40-Quarry-Ridge-Rd-Washington-Depot-CT-06794/2071654082_zpid/" },
            { "url": "https://www.zillow.com/homedetails/41-Dearfield-Dr-Greenwich-CT-06831/177224162_zpid/" },
            { "url": "https://www.zillow.com/homedetails/53-Chestnut-Hill-Rd-Killingworth-CT-06419/2062118688_zpid/" },
            { "url": "https://www.zillow.com/homedetails/56-Hickory-Knoll-Dr-Killingworth-CT-06419/2062118700_zpid/" },
            { "url": "https://www.zillow.com/homedetails/58-Davis-Ln-Middlefield-CT-06455/2076642468_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Carey-Rd-West-Redding-CT-06896/177238473_zpid/" },
            { "url": "https://www.zillow.com/homedetails/6-Daniels-Farm-Rd-Wilton-CT-06897/177241409_zpid/" },
            { "url": "https://www.zillow.com/homedetails/61-Dandy-Dr-Madison-CT-06443/2062124554_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Ridgewood-Rd-Higganum-CT-06441/2062206024_zpid/" },
            { "url": "https://www.zillow.com/homedetails/65-Stanwich-Rd-Greenwich-CT-06830/177217452_zpid/" },
            { "url": "https://www.zillow.com/homedetails/68-Creamery-Rd-South-Kent-CT-06785/177187478_zpid/" },
            { "url": "https://www.zillow.com/homedetails/8-Irvington-Ln-Ridgefield-CT-06877/2071604176_zpid/" },
            { "url": "https://www.zillow.com/homedetails/81-W-Hollow-Rd-Woodbury-CT-06798/2062222067_zpid/" },
            { "url": "https://www.zillow.com/homedetails/89-Blueberry-Hill-Rd-Killingworth-CT-06419/2076645745_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-N-Seir-Hill-Rd-Norwalk-CT-06850/177226127_zpid/" },
            { "url": "https://www.zillow.com/homedetails/94-Ridgewood-Dr-New-Haven-CT-06511/174106824_zpid/" },
            { "url": "https://www.zillow.com/homedetails/98-Melba-St-Unit-203-Milford-CT-06460/2076639411_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Melba-St-Milford-CT-06460/177235514_zpid/" },
            { "url": "https://www.zillow.com/homedetails/9-Overbrook-Dr-Weston-CT-06883/177193014_zpid/" }
        ]

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
                        console.log('Response dataYEEEEEY:', response.data);
                        return response.data;
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    throw error; // or handle gracefully
                }
            }
        }

        try {
            const data = await fetchData(snapshotId);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching data' });
        }

    } catch (error) {
        console.error('Error sending POST request:', error);
        res.status(500).json({ error: 'Failed to send POST request' });
    }
}



module.exports = sendPostRequests;
