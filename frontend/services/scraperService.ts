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

export const scrapeInstagram = async (url: string): Promise<MediaData> => {
    // Validate URL basic pattern
    if (!url.startsWith('http')) {
        throw new Error("Please enter a valid URL starting with http:// or https://");
    }

    const allowedDomains = ["instagram.com", "instagr.am", "facebook.com", "fb.watch", "fb.com"];
    if (!allowedDomains.some(domain => url.toLowerCase().includes(domain))) {
        throw new Error("Only Instagram and Facebook URLs are supported.");
    }

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
                return transformCobaltResponse(data, url);
            }
        }
    } catch (e) {
        console.warn("PHP Proxy failed (might be running locally without PHP):", e);
    }

    // STRATEGY 2: Direct Client-Side Request (Fallback if PHP is invalid)
    let lastError = null;

    // Try each instance until one works
    for (const base of COBALT_INSTANCES) {
        // For each instance, try both v10 (root) and v7 (/api/json) endpoints
        const endpoints = [`${base}/`, `${base}/api/json`];

        for (const endpoint of endpoints) {
            try {
                console.log(`Strategy 2: Trying Direct Cobalt: ${endpoint}`);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url })
                });

                // Check content type to ensure it's JSON
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    continue; // Skip non-JSON responses (404 pages etc)
                }

                const data = await response.json();

                if (data.status === 'error' || data.error) {
                    throw new Error(data.text || "Extraction failed");
                }

                // If we got here, success!
                return transformCobaltResponse(data, url);

            } catch (e: any) {
                // console.warn(`Endpoint ${endpoint} failed:`, e.message);
                lastError = e;
                // Continue to next endpoint/instance
            }
        }
    }

    // If all failed
    throw new Error("Failed to fetch media. All servers are busy or the link is private.");
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