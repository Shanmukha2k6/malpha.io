import { MediaData, MediaType } from "../types";

// Public instance of Cobalt API (allows CORS)
const COBALT_API_URL = "https://api.cobalt.tools/api/json";

export const scrapeInstagram = async (url: string): Promise<MediaData> => {
    // Validate URL basic pattern
    if (!url.startsWith('http')) {
        throw new Error("Please enter a valid URL starting with http:// or https://");
    }

    // Allowed domains validation
    const allowedDomains = [
        "instagram.com", "instagr.am",
        "facebook.com", "fb.watch", "fb.com"
    ];

    // Check if URL matches any allowed domain
    const isAllowed = allowedDomains.some(domain => url.toLowerCase().includes(domain));

    if (!isAllowed) {
        throw new Error("Only Instagram and Facebook URLs are supported.");
    }

    try {
        console.log(`Fetching from Cobalt API: ${COBALT_API_URL}`);

        const response = await fetch(COBALT_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url
            })
        });

        const data = await response.json();

        if (data.status === 'error' || data.error) {
            throw new Error(data.text || "Extraction failed. The link might be private or invalid.");
        }

        return transformCobaltResponse(data, url);

    } catch (e: any) {
        console.error("External scraping failed:", e);
        throw new Error(e.message || "Failed to fetch video. Please try again later.");
    }
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