
async function debugScraper() {
    const inputUrl = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";

    // Clean URL logic
    const u = new URL(inputUrl);
    const url = `${u.protocol}//${u.hostname}${u.pathname}`;
    console.log(`Cleaned URL: ${url}`);

    const instances = [
        "https://cobalt.kwiatekmiki.pl",
        "https://api.cobalt.kwiatekmiki.pl",
        "https://cobalt.wuk.sh",
        "https://co.wuk.sh",
        "https://dl.khub.ky",
        "https://api.server.cobalt.tools"
    ];

    for (const base of instances) {
        console.log(`\nTesting Instance: ${base}`);
        const endpoints = [`${base}/`, `${base}/api/json`];

        for (const endpoint of endpoints) {
            const corsProxy = "https://corsproxy.io/?";
            const proxiedUrl = corsProxy + encodeURIComponent(endpoint);

            console.log(`  Target: ${proxiedUrl}`);

            try {
                const response = await fetch(proxiedUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url })
                });

                console.log(`  Status: ${response.status}`);
                const text = await response.text();

                if (response.ok) {
                    console.log(`  SUCCESS BODY: ${text.substring(0, 100)}...`);
                } else {
                    console.log(`  ERROR BODY: ${text.substring(0, 100)}...`);
                }

            } catch (e) {
                console.log(`  FETCH FAILED: ${e.message}`);
            }
        }
    }
}

debugScraper();
