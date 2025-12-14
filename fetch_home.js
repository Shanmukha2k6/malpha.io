
const fs = require('fs');

async function fetchHome() {
    try {
        const response = await fetch('https://fastvideosave.net/');
        const text = await response.text();
        fs.writeFileSync('fastvideosave_home.html', text);
        console.log("Downloaded homepage.");
    } catch (e) {
        console.log("Error:", e.message);
    }
}

fetchHome();
