import { MediaData, MediaType } from "../types";

// List of Community Cobalt Instances (Fallback Strategy)
const COBALT_INSTANCES = [
    "https://cobalt.kwiatekmiki.pl",
    "https://api.cobalt.kwiatekmiki.pl",
    "https://cobalt.wuk.sh",
    "https://co.wuk.sh",
    "https://dl.khub.ky"
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

    let lastError = null;

    // Try each instance until one works
    for (const base of COBALT_INSTANCES) {
        try {
            console.log(`Trying Cobalt instance: ${base}`);

            // Try v10 endpoint (root)
            const response = await fetch(`${base}/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (data.status === 'error' || data.error) {
                // If it's a specific error from the API (e.g. valid JSON but error status), record it
                // but don't stop unless we want to? Usually we should try next instance if it's a server error.
                // If it's a content error (private video), all instances will likely fail. 
                // But let's assume it might be instance-specific (blocked IP).
                throw new Error(data.text || "Extraction failed");
            }

            // If we got here, success!
            return transformCobaltResponse(data, url);

        } catch (e: any) {
            console.warn(`Instance ${base} failed:`, e.message);
            lastError = e;
            // Continue to next instance
        }
    }

    // If all failed
    throw new Error(lastError?.message || "Failed to fetch media. All servers are busy or the link is private.");
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