
async function test() {
    const url = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";

    // List of base URLs to test
    const bases = [
        "https://co.wuk.sh",
        "https://cobalt.kwiatekmiki.pl",
        "https://api.server.cobalt.tools"
    ];

    for (const base of bases) {
        // Test endpoint /api/json (v7 style)
        await tryEndpoint(base, '/api/json', url);
        // Test endpoint / (v10 style)
        await tryEndpoint(base, '/', url);
    }
}

async function tryEndpoint(base, path, url) {
    const full = base + path;
    console.log(`\nTesting ${full}...`);
    try {
        const response = await fetch(full, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        if (response.ok) {
            console.log("SUCCESS!", text.substring(0, 100));
        } else {
            console.log("Response:", text.substring(0, 200));
        }
    } catch (e) {
        console.log("Fetch Error:", e.message);
    }
}

test();
