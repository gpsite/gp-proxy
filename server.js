const express = require('express');
const cors = require('cors');
const Unblocker = require('unblocker');
const path = require('path');
const app = express();

// Initialize the proxy engine
// 'unblocker' rewrites HTML/CSS/JS to make external sites work inside our domain
const unblocker = new Unblocker({
    prefix: '/proxy/'
});

// Use CORS middleware to allow requests from any origin
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Use the unblocker middleware
// It intercepts requests starting with /proxy/ and handles them
app.use(unblocker);

// Serve the premium frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for any other routes to index.html (SPA feel)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/proxy/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`\n🚀 Proxy Portal running at http://localhost:${PORT}`);
    console.log(`Using prefix: /proxy/`);
});
