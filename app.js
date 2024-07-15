// app.js
const http = require('http');

// Create a simple HTTP server that responds with 'Hello, World!' to all requests
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
});

// Listen on port 3000 or the PORT environment variable
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
