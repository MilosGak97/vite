


app.post('/handle-url', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json('URL is required');
        }

        await processUrl(url);
        res.status(200).json('URL processed successfully');
    } catch (error) {
        console.error('Error processing URL:', error);
        res.status(500).json('Failed to process URL');
    }
});



const sendUrls = async (urls) => {
    urls.forEach(url => {
        axios.post('https://worker-847b6ac96356.herokuapp.com/handle-url', { url })
            .then(response => console.log(`URL processed successfully:`))
            .catch(error => console.error(`Error processing URL`));
    });
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


app.post('/trigger3', async (req, res) => {
    try {
        for (let i = 0; i < 150; i++) {
            const database = await connectDB();
            const propertiesCollection = database.collection('properties');

            const filteringQuery = {
                current_status: { $in: ["ForSale", "ComingSoon"] },
                verified: { $in: ["Full", "NoPhotos"] },
                last_status_check: { $exists: false },
                companyOwned: { $in: [false, null] }
            };

            // Fetch the first 75 properties
            const properties = await propertiesCollection.find(filteringQuery).limit(75).toArray();
            // console.log("PROPERTIES: ", properties);

            // Extract the URL field
            const urls = properties.map(property => property.url).filter(Boolean); // Ensure URL is not undefined or null
            // console.log("URLS:", urls);

            if (!Array.isArray(urls)) {
                return res.status(400).json('URLs should be an array');
            }

            await sendUrls(urls);

            console.log(`Iteration ${i + 1} completed. Waiting for 30 seconds before the next iteration.`);
            // Wait for 30 seconds before the next iteration
            await delay(30000);
        }

        res.status(200).json({ message: 'All iterations completed.' });
    } catch (error) {
        console.error('Error processing URLs:', error);
        res.status(500).json('Failed to process URLs');
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
