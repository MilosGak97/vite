// src/middleware/gzipMiddleware.js
const zlib = require('zlib');

const zlibMiddleware = (req, res, next) => {
    if (req.headers['content-encoding'] === 'gzip') {
        let buf = Buffer.from('');
        req.on('data', (chunk) => {
            buf = Buffer.concat([buf, chunk]);
        });
        req.on('end', () => {
            zlib.gunzip(buf, (err, decoded) => {
                if (err) {
                    console.error('Error decoding gzip content:', err);
                    return res.status(400).send('Bad Request: Error decoding gzip content');
                }
                try {
                    req.body = JSON.parse(decoded.toString());
                    next();
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    return res.status(400).send('Bad Request: Error parsing JSON');
                }
            });
        });
    } else {
        next();
    }
};

module.exports = { zlibMiddleware };
