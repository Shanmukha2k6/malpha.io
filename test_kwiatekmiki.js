
async function testCorsAndPost() {
    const url = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";
    const base = "https://cobalt.kwiatekmiki.pl";

    console.log(`Checking ${base}...`);

    // 1. Check CORS (OPTIONS)
    try {
        const cors = await fetch(base + '/', { method: 'OPTIONS' });
        console.log(`CORS Status: ${cors.status}`);
        console.log(`Allow-Origin: ${cors.headers.get('access-control-allow-origin')}`);
    } catch (e) { console.log('CORS check failed:', e.message); }

    // 2. Check POST (v10)
    try {
        const response = await fetch(base + '/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`POST Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 300)}`);
    } catch (e) { console.log('POST check failed:', e.message); }
}

testCorsAndPost();
