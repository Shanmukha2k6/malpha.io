import { MediaData, MediaType } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const scrapeInstagram = async (url: string): Promise<MediaData> => {
    // Validate URL basic pattern
    if (!url.startsWith('http')) {
        throw new Error("Please enter a valid URL starting with http:// or https://");
    }

    // Determine endpoint based on URL
    let endpoint = `${API_BASE_URL}/api/extract`;
    let isProfile = false;

    // Smart routing for Instagram Profiles
    if (url.includes('instagram.com') && !url.includes('/p/') && !url.includes('/reel/') && !url.includes('/stories/')) {
        // It might be a profile (simple heuristic: no /p/, /reel/, /stories/)
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(p => p);
        if (parts.length === 1 && parts[0] !== 'api' && parts[0] !== 'explore') {
            endpoint = `${API_BASE_URL}/api/instagram-profile?username=${parts[0]}`;
            isProfile = true;
        }
    }

    // Smart routing for Facebook Profiles
    if (url.includes('facebook.com') && !url.includes('/watch') && !url.includes('/video')) {
        // Basic check, might need refinement
        if (!url.includes('/groups/') && !url.includes('/story.php')) {
            endpoint = `${API_BASE_URL}/api/facebook-profile?url=${encodeURIComponent(url)}`;
            isProfile = true;
        }
    }

    try {
        console.log(`Fetching from: ${endpoint}`);
        // For extract endpoint, we pass url as param
        const fetchUrl = isProfile ? endpoint : `${endpoint}?url=${encodeURIComponent(url)}`;

        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.message || data.details || "Extraction failed");
        }

        return transformBackendResponse(data, url, isProfile);

    } catch (e: any) {
        console.error("Backend scraping failed:", e);
        throw new Error(e.message || "Failed to connect to backend server. Make sure it is running on port 8000.");
    }
};

const transformBackendResponse = (data: any, originalUrl: string, isProfile: boolean): MediaData => {
    // Handle Profile Picture Response
    if (isProfile) {
        return {
            id: `profile_${Date.now()}`,
            type: MediaType.IMAGE,
            username: data.username || "User",
            fullName: data.full_name || "Instagram User",
            avatarUrl: data.profile_pic_url,
            mediaUrl: data.profile_pic_url_hd || data.profile_pic_url,
            mirrorUrl: data.profile_pic_url,
            caption: `${data.full_name || data.username}'s Profile Picture`,
            thumbnailUrl: data.profile_pic_url,
            stats: { likes: "N/A", views: "N/A" },
            hashtags: [],
            timestamp: new Date().toISOString(),
            sources: [{ uri: data.profile_pic_url_hd || data.profile_pic_url, title: "HD Profile Picture" }]
        };
    }

    // Handle Video/Post Response
    let mediaType = MediaType.REEL; // Default (Video/Reel)
    // Determine type from formats or URL
    if (data.formats && data.formats.length > 0) {
        if (data.formats[0].ext === 'jpg' || data.formats[0].ext === 'png') {
            mediaType = MediaType.IMAGE;
        }
    }

    // Map formats to sources
    const sources = (data.formats || []).map((fmt: any) => ({
        uri: fmt.url,
        title: fmt.quality || fmt.format_id || "Download"
    }));

    // Find best download URL (first one is usually best due to backend sorting)
    const bestUrl = sources.length > 0 ? sources[0].uri : "";

    return {
        id: `media_${Date.now()}`,
        type: mediaType,
        username: data.uploader || "Unknown",
        fullName: data.uploader || "Unknown",
        avatarUrl: "https://cdn-icons-png.flaticon.com/512/87/87390.png", // Placeholder
        mediaUrl: bestUrl,
        mirrorUrl: bestUrl,
        caption: data.title || "No Title",
        thumbnailUrl: data.thumbnail || "https://placehold.co/600x400?text=No+Thumbnail",
        stats: { likes: "N/A", views: typeof data.duration === 'number' ? `${data.duration}s` : "N/A" },
        hashtags: [],
        timestamp: new Date().toISOString(),
        sources: sources
    };
};