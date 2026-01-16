const express = require('express');
const Unblocker = require('unblocker');
const path = require('path');
const app = express();

// Initialize the proxy engine
// 'unblocker' rewrites HTML/CSS/JS to make external sites work inside our domain
const unblocker = new Unblocker({
    prefix: '/proxy/'
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
