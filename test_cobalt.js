
async function testInstances() {
    const url = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";

    // Potential instances - usually endpoint is / or /api/json
    const instances = [
        "https://cobalt.kwiatekmiki.pl",
        "https://api.cobalt.kwiatekmiki.pl",
        "https://cobalt.wuk.sh", // often used
        "https://api.server.cobalt.tools", // old?
        "https://co.wuk.sh",
        "https://cobalt.tools" // web UI?
    ];

    for (const base of instances) {
        console.log(`Testing ${base}...`);

        // Try both root / and /api/json just in case
        const endpoints = [`${base}/`, `${base}/api/json`];

        for (const endpoint of endpoints) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 3000); // 3s timeout

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url }),
                    signal: controller.signal
                });
                clearTimeout(id);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`SUCCESS: ${endpoint}`);
                    console.log(JSON.stringify(data).substring(0, 200));
                    return; // Found one!
                } else {
                    console.log(`Failed ${endpoint}: ${response.status}`);
                    // check if text body gives hint
                    try {
                        const t = await response.text();
                        if (t.includes("error")) console.log("Err: " + t.substring(0, 100));
                    } catch (e) { }
                }
            } catch (e) {
                console.log(`Error ${endpoint}: ${e.message}`);
            }
        }
    }
}

testInstances();
