
async function testCorsScraping() {
    // The specific URL provided by the user
    const targetUrl = "https://www.instagram.com/reel/DMXxaSzTfDH/?igsh=MTZyZWh2c2ZrMmZkZw==";

    // Using corsproxy.io
    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(targetUrl);

    console.log(`Fetching: ${proxyUrl}`);

    try {
        const response = await fetch(proxyUrl);
        console.log(`Status: ${response.status}`);

        const html = await response.text();
        console.log(`HTML Length: ${html.length}`);

        // Try to find meta tags for video
        const ogVideo = html.match(/property="og:video" content="([^"]+)"/);
        const twitterVideo = html.match(/property="twitter:player:stream" content="([^"]+)"/);
        const videoTag = html.match(/<video[^>]+src="([^"]+)"/);

        if (ogVideo) console.log("Found og:video:", ogVideo[1]);
        if (twitterVideo) console.log("Found twitter:video:", twitterVideo[1]);
        if (videoTag) console.log("Found <video> src:", videoTag[1]);

        // Check for specific error text (Login wall)
        if (html.includes("Login • Instagram")) console.log("Hit Login Wall");

    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testCorsScraping();
