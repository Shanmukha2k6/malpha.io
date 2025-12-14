
async function checkCorsSupport() {
    const instances = [
        "https://cobalt.kwiatekmiki.pl",
        "https://api.cobalt.kwiatekmiki.pl",
        "https://cobalt.wuk.sh",
        "https://co.wuk.sh",
        "https://dl.khub.ky",
        "https://api.server.cobalt.tools",
        "https://cobalt.tools"
    ];

    for (const base of instances) {
        try {
            console.log(`Checking ${base}...`);
            const response = await fetch(base + '/', { method: 'OPTIONS' });
            const allowOrigin = response.headers.get('access-control-allow-origin');
            console.log(`  Allowed Origin: ${allowOrigin}`);

            if (allowOrigin === '*' || allowOrigin === 'null') {
                console.log("  !!! FOUND CORS OPEN INSTANCE !!!");
            }
        } catch (e) {
            console.log(`  Failed: ${e.message}`);
        }
    }
}

checkCorsSupport();
