const axios = require('axios');

let accessTokenPrecisely = null;
let tokenExpirationTime = null;

const encodeBase64 = (key, secret) => {
    const credentials = `${key}:${secret}`;
    return Buffer.from(credentials).toString('base64');
};

const fetchAndStoreToken = async () => {
    const key = 'QKs8U4IfxnfSAUXZCA9ttMBBOzS6rIWW';
    const secret = 'L4VZlKATR5wy56lo';
    const encodedCredentials = encodeBase64(key, secret);

    const config = {
        headers: {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    const data = new URLSearchParams({
        grant_type: 'client_credentials'
    });

    try {
        const response = await axios.post('https://api.precisely.com/oauth/token', data, config);
        accessTokenPrecisely = response.data.access_token;
        tokenExpirationTime = Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000); // 5 minutes before actual expiration
        console.log('Fetched and stored new access token:', accessTokenPrecisely);
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
    }
};

// Initialize token and set up refresh interval
(async () => {
    await fetchAndStoreToken();
    setInterval(fetchAndStoreToken, 18000000); // 5 hours
})();

module.exports = {
    get accessTokenPrecisely() {
        return accessTokenPrecisely;
    }
};
