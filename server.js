const express = require('express');
const cors = require('cors');
const Unblocker = require('unblocker');
const path = require('path');
const { AdBlockClient } = require('@cliqz/adblocker-node');
const fetch = require('cross-fetch');
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

// Initialize AdBlocker
let adBlocker;
AdBlockClient.fromList(fetch, [
    'https://easylist.to/easylist/easylist.txt',
    'https://easylist.to/easylist/easyprivacy.txt'
]).then(blocker => {
    adBlocker = blocker;
    console.log('🛡️  AdBlocker Engine Ready!');
}).catch(err => console.error('❌ Failed to load AdBlocker:', err));

// AdBlock Middleware
app.use((req, res, next) => {
    if (!adBlocker || !req.path.startsWith('/proxy/')) {
        return next();
    }

    const urlToProxy = req.path.replace('/proxy/', ''); // Extract URL
    try {
        const { match } = adBlocker.match(urlToProxy, 'script', urlToProxy);
        if (match) {
            console.log(`🚫 Blocked Ad/Tracker: ${urlToProxy}`);
            return res.status(200).send(''); // Block request
        }
    } catch (e) {
        // Ignore errors in matching
    }

    next();
});

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
