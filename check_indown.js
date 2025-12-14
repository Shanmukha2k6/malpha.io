
async function checkIndown() {
    try {
        const response = await fetch('https://indown.io/ajax', {
            method: 'OPTIONS'
        });
        console.log(`Indown CORS: ${response.headers.get('access-control-allow-origin')}`);
    } catch (e) { console.log('Indown check failed', e.message); }
}
checkIndown();
