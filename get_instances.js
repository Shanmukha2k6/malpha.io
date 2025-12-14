
async function getInstances() {
    try {
        console.log("Fetching instances list...");
        const response = await fetch('https://instances.cobalt.best/api/instances');
        const data = await response.json();

        console.log(`Found ${data.length} instances.`);

        // Filter for high score or trustworthy ones
        const valid = data.filter(i => parseFloat(i.score) > 0.8 && i.version.startsWith('10')); // Prefer v10 but check score

        console.log("Top 3 candidates:");
        const candidates = valid.filter(i => i.protocol === 'https').slice(0, 3).map(i => i.url);
        console.log(candidates);

        // Test them
        for (const url of candidates) {
            await testInstance(url);
        }

    } catch (e) {
        console.error("Failed to get instances:", e);
    }
}

async function testInstance(baseUrl) {
    const url = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";
    console.log(`Testing ${baseUrl}...`);
    try {
        const response = await fetch(`${baseUrl}/`, { // v10 uses root
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        if (response.ok) {
            const d = await response.json();
            console.log("SUCCESS!", JSON.stringify(d).substring(0, 100));
        } else {
            console.log("Failed " + response.status);
            const t = await response.text();
            console.log("Err: " + t.substring(0, 50));
        }
    } catch (e) { console.log("Err: " + e.message); }
}

getInstances();
