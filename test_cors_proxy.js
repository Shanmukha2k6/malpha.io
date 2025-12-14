
async function testCorsProxy() {
    const target = "https://cobalt.kwiatekmiki.pl/";
    const url = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";

    // Testing free cors proxy: https://corsproxy.io/?
    const proxy = "https://corsproxy.io/?";
    const fullUrl = proxy + encodeURIComponent(target);

    console.log(`Testing via Proxy: ${fullUrl}`);

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 200)}`);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

testCorsProxy();
