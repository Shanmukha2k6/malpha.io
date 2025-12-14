
const https = require('https');

async function scrapeIG(url) {
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

    console.log(`Scraping: ${url}`);

    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Sec-Fetch-Mode': 'navigate'
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400) {
                // Follow redirect
                console.log(`Redirecting to: ${res.headers.location}`);
                return scrapeIG(res.headers.location).then(resolve).catch(reject);
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Data Length: ${data.length}`);

                // 1. Check for og:video
                const ogVideo = data.match(/property="og:video" content="([^"]+)"/);
                if (ogVideo) {
                    console.log("SUCCESS! Found og:video");
                    console.log(ogVideo[1]);
                    return resolve(ogVideo[1]);
                }

                // 2. Check for twitter:player:stream
                const twitterVideo = data.match(/property="twitter:player:stream" content="([^"]+)"/);
                if (twitterVideo) {
                    console.log("SUCCESS! Found twitter:video");
                    console.log(twitterVideo[1]);
                    return resolve(twitterVideo[1]);
                }

                // 3. Check specific GraphQl data (keywords)
                if (data.includes('video_url')) {
                    console.log("Found 'video_url' in content (needs parsing)");
                    // Simple regex for JSON video_url
                    const matches = data.match(/"video_url":"([^"]+)"/g);
                    if (matches) {
                        // clean up slashes
                        const clean = matches[0].replace('"video_url":"', '').replace('"', '').replace(/\\u0026/g, '&');
                        console.log("Extracted: " + clean);
                        return resolve(clean);
                    }
                }

                if (data.includes('Login • Instagram')) {
                    console.error("FAILED: Login Wall");
                } else {
                    console.error("FAILED: Unknown structure");
                }
                reject("No video found");
            });
        }).on('error', reject);
    });
}

const target = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";
scrapeIG(target);
