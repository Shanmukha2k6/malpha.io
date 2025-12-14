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
    // Validate URL basic pattern
    if (!inputUrl.startsWith('http')) {
        throw new Error("Please enter a valid URL starting with http:// or https://");
    }

    const allowedDomains = ["instagram.com", "instagr.am", "facebook.com", "fb.watch", "fb.com"];
    if (!allowedDomains.some(domain => inputUrl.toLowerCase().includes(domain))) {
        throw new Error("Only Instagram and Facebook URLs are supported.");
    }

    const url = cleanUrl(inputUrl);
    console.log(`Processing URL: ${url}`);

    // STRATEGY 1: Try local PHP Proxy (Hostinger / Server way)
    // This bypasses browser CORS header issues by doing the request server-side
    try {
        console.log("Strategy 1: Trying PHP Proxy...");
        const response = await fetch('/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (!data.error && (data.url || data.picker)) {
                return transformCobaltResponse(data, inputUrl);
            }
        }
    } catch (e) {
        console.warn("Strategy 1 (PHP Proxy) failed/skipped (Expected on Localhost).");
    }

    // STRATEGY 2 & 3: Direct Cobalt & CORS Proxy
    let lastError = null;

    // Try each instance until one works
    for (const base of COBALT_INSTANCES) {
        // We try both Direct (Strategy 2) and via CORS Proxy (Strategy 3)
        // Direct might work if the instance allows CORS.
        // CORS Proxy (corsproxy.io) works on Localhost effectively.

        const endpoints = [`${base}/`, `${base}/api/json`];

        for (const endpoint of endpoints) {

            // Sub-Strategy 2: Direct
            try {
                console.log(`Strategy 2: Direct -> ${endpoint}`);
                const response = await fetch(endpoint, {
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
            } catch (e) {
                // Ignore direct failure
            }

            // Sub-Strategy 3: Via Public CORS Proxy (Fixes Localhost issue!)
            try {
                const corsProxy = "https://corsproxy.io/?";
                const proxiedUrl = corsProxy + encodeURIComponent(endpoint);
                console.log(`Strategy 3: Via CORS Proxy -> ${proxiedUrl}`);

                const response = await fetch(proxiedUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (!data.error && (data.status === 'stream' || data.status === 'picker' || data.url)) {
                        console.log("Success via CORS Proxy!");
                        return transformCobaltResponse(data, inputUrl);
                    }
                }
            } catch (e: any) {
                lastError = e;
                console.warn(`CORS Proxy failed for ${endpoint}:`, e.message);
            }
        }
    }

    // Final Fallback: If everything fails, throw strict error
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