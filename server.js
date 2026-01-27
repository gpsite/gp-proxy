const express = require('express');
const cors = require('cors');
const Unblocker = require('unblocker');
const path = require('path');
const app = express();

// ============================================
// AD BLOCKING CONFIGURATION
// ============================================
const AD_DOMAINS = [
    'dtscout.com',
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'google-analytics.com',
    'googletagmanager.com',
    'adservice.google.com',
    'pagead2.googlesyndication.com',
    'adnxs.com',
    'advertising.com',
    'quantserve.com',
    'scorecardresearch.com',
    'outbrain.com',
    'taboola.com',
    'ads-twitter.com',
    'popads.net',
    'popcash.net',
    'propellerads.com',
    'adsterra.com',
    'exoclick.com',
    'juicyads.com'
];

// Ad-related script patterns to block
const AD_SCRIPT_PATTERNS = [
    /\/ads\//i,
    /\/ad\./i,
    /\/adv\//i,
    /\/banner/i,
    /\/popup/i,
    /analytics/i,
    /tracking/i,
    /beacon/i
];

// Content Security Policy to prevent popups
const CSP_HEADER = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src * data: blob:; frame-src *; style-src * 'unsafe-inline';";

// Middleware to block ad requests
app.use((req, res, next) => {
    const url = req.url;

    // Block requests to known ad domains
    for (const domain of AD_DOMAINS) {
        if (url.includes(domain)) {
            console.log(`🚫 Blocked ad request: ${domain}`);
            return res.status(204).end(); // Return empty response
        }
    }

    // Block suspicious ad scripts
    for (const pattern of AD_SCRIPT_PATTERNS) {
        if (pattern.test(url)) {
            console.log(`🚫 Blocked suspicious script: ${url}`);
            return res.status(204).end();
        }
    }

    next();
});

// Initialize the proxy engine with response modification
const unblocker = new Unblocker({
    prefix: '/proxy/',
    responseMiddleware: [
        // Inject anti-popup and ad-blocking scripts into HTML responses
        function (data) {
            if (data.contentType && data.contentType.includes('text/html')) {
                const antiAdScript = `
                    <script>
                    // Aggressive popup blocking
                    (function() {
                        const originalOpen = window.open;
                        window.open = function() {
                            console.warn('Popup blocked by proxy');
                            return { closed: false, close: function() {}, focus: function() {} };
                        };
                        Window.prototype.open = window.open;
                        
                        // Block common ad functions
                        window.popunder = function() {};
                        window.popUp = function() {};
                    })();
                    </script>
                `;

                data.stream = data.stream.pipe(require('stream').Transform({
                    transform(chunk, encoding, callback) {
                        let html = chunk.toString();

                        // Remove known ad script tags
                        html = html.replace(/<script[^>]*dtscout[^>]*>.*?<\/script>/gi, '');
                        html = html.replace(/<script[^>]*doubleclick[^>]*>.*?<\/script>/gi, '');
                        html = html.replace(/<script[^>]*googlesyndication[^>]*>.*?<\/script>/gi, '');

                        // Inject anti-ad script before closing head tag
                        if (html.includes('</head>')) {
                            html = html.replace('</head>', antiAdScript + '</head>');
                        } else if (html.includes('<body')) {
                            html = html.replace('<body', antiAdScript + '<body');
                        }

                        callback(null, Buffer.from(html));
                    }
                }));
            }

            // Block ad scripts in JavaScript responses
            if (data.contentType && data.contentType.includes('javascript')) {
                const url = data.url || '';
                for (const domain of AD_DOMAINS) {
                    if (url.includes(domain)) {
                        console.log(`🚫 Blocked JS from ad domain: ${domain}`);
                        data.stream = require('stream').Readable.from(['// Ad script blocked']);
                        break;
                    }
                }
            }
        }
    ]
});

// Use CORS middleware to allow requests from any origin
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add security headers
app.use((req, res, next) => {
    // These headers help prevent ads and popups
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

// Use the unblocker middleware
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
    console.log(`🛡️  Ad-blocking enabled`);
    console.log(`Using prefix: /proxy/`);
});
