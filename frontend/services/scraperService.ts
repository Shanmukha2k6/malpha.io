import { MediaData, MediaType } from "../types";

// List of Community Cobalt Instances (Fallback Strategy)
const COBALT_INSTANCES = [
    "https://cobalt.kwiatekmiki.pl",
    "https://api.cobalt.kwiatekmiki.pl",
    "https://cobalt.wuk.sh",
    "https://co.wuk.sh",
    "https://dl.khub.ky",
    "https://api.server.cobalt.tools"
];

// Helper to clean URL (remove tracking params)
const cleanUrl = (url: string): string => {
    try {
        const u = new URL(url);
        // Keep only path, remove query params for cleaner processing
        // But some reels need 'igsh', usually they don't. 
        // Let's just strip known tracking params if needed, or better, keep it simple.
        // Actually, Cobalt usually prefers clean URLs.
        return `${u.protocol}//${u.hostname}${u.pathname}`;
    } catch {
        return url;
    }
};

export const scrapeInstagram = async (inputUrl: string): Promise<MediaData> => {
    if (!inputUrl.startsWith('http')) {
        throw new Error("Please enter a valid URL starting with http:// or https://");
    }

    const allowedDomains = ["instagram.com", "instagr.am", "facebook.com", "fb.watch", "fb.com"];
    if (!allowedDomains.some(domain => inputUrl.toLowerCase().includes(domain))) {
        throw new Error("Only Instagram and Facebook URLs are supported.");
    }

    const url = cleanUrl(inputUrl);
    console.log(`Processing URL: ${url}`);

    // STRATEGY 1: Local Dev Proxy (Vite)
    // Works on Localhost (npm run dev) because we configured vite.config.ts to proxy /api/cobalt -> real cobalt
    try {
        console.log("Strategy 1: Trying Local Vite Proxy (/api/cobalt)...");
        const response = await fetch('/api/cobalt/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        // If 404, it means we are not on localhost/vite, so skip
        if (response.status !== 404) {
            const data = await response.json();
            if (!data.error && (data.url || data.picker || data.status === 'stream')) {
                console.log("Success via Vite Proxy!");
                return transformCobaltResponse(data, inputUrl);
            }
        }
    } catch (e) {
        // Expected to fail on Production/Hostinger (no vite proxy)
        console.log("Vite Proxy skipped.");
    }

    // STRATEGY 2: Production PHP Proxy (Hostinger)
    // Works on Hostinger because api.php acts as the server-side proxy
    try {
        console.log("Strategy 2: Trying PHP Proxy (/api.php)...");
        const response = await fetch('/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (!data.error && (data.url || data.picker || data.status === 'stream')) {
                console.log("Success via PHP Proxy!");
                return transformCobaltResponse(data, inputUrl);
            }
        }
    } catch (e) {
        console.warn("PHP Proxy failed (Expected on Localhost without PHP).");
    }

    // STRATEGY 3: Direct Fallback (Rarely works due to CORS, but worth a try with specific instances)
    let lastError = null;
    for (const base of COBALT_INSTANCES) {
        try {
            console.log(`Strategy 3: Direct -> ${base}`);
            const response = await fetch(`${base}/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (response.ok) {
                const data = await response.json();
                if (!data.error) return transformCobaltResponse(data, inputUrl);
            }
        } catch (e: any) {
            lastError = e;
        }
    }

    // We removed CORS Proxy because public ones are unreliable/blocked.
    // relying on Vite Proxy (Local) + PHP Proxy (Prod) covers all bases.

    throw new Error("Unable to process this video. The server might be busy or the content is private/region-locked.");
};

const transformCobaltResponse = (data: any, originalUrl: string): MediaData => {
    // Cobalt returns different structures: stream, picker (playlist/carousel), or redirect

    let sources: Array<{ uri: string, title: string }> = [];
    let mediaType = MediaType.REEL; // Default
    let thumbnailUrl = "https://placehold.co/600x400?text=No+Thumbnail";

    if (data.status === 'picker') {
        // Multiple items (Carousel or Playlist)
        sources = data.picker.map((item: any) => ({
            uri: item.url,
            title: "Download Item"
        }));

        // Try to guess type from first item
        if (data.picker[0]?.type === 'photo') {
            mediaType = MediaType.IMAGE;
        }

        if (data.picker[0]?.thumb) {
            thumbnailUrl = data.picker[0].thumb;
        }

    } else {
        // Single item (Stream or Redirect)
        sources = [{
            uri: data.url,
            title: "Download Media"
        }];

        // If Cobalt explicitly says audio (rare for IG/FB but possible)
        if (data.type === 'audio') {
            // We treat audio as video/reel for now or could add MediaType.AUDIO
        }
    }

    const finalUrl = sources.length > 0 ? sources[0].uri : "";

    return {
        id: `media_${Date.now()}`,
        type: mediaType,
        username: "Unknown User", // Cobalt doesn't always return metadata like username
        fullName: "Instagram User",
        avatarUrl: "https://cdn-icons-png.flaticon.com/512/87/87390.png",
        mediaUrl: finalUrl,
        mirrorUrl: finalUrl,
        caption: data.filename || "Video Download",
        thumbnailUrl: thumbnailUrl,
        stats: { likes: "N/A", views: "N/A" },
        hashtags: [],
        timestamp: new Date().toISOString(),
        sources: sources
    };
};