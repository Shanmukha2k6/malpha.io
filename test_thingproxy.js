
async function checkThingProxy() {
    const target = "https://cobalt.kwiatekmiki.pl/";
    const url = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";
    const proxy = "https://thingproxy.freeboard.io/fetch/";

    console.log(`Testing ThingProxy...`);
    try {
        const response = await fetch(proxy + target, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Body: ${text.substring(0, 200)}`);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

checkThingProxy();
