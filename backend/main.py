"""
FastAPI Video Stream Extraction API
Serverless-ready backend for extracting video download links using yt-dlp
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import asyncio
import yt_dlp
import re
import requests
from bs4 import BeautifulSoup
import json
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, validator
import logging
from instagram_scraper import get_instagram_profile_picture, get_instagram_post, get_instagram_stories
from facebook_scraper import get_facebook_profile_picture

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Video Stream Extraction API",
    description="High-performance serverless API for extracting video download links",
    version="1.0.0"
)

# CORS configuration for public access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VideoInfo(BaseModel):
    """Response model for video information"""
    status: str
    title: str
    thumbnail: str
    duration: Optional[int]
    uploader: Optional[str]
    formats: List[Dict[str, Any]]


class ErrorResponse(BaseModel):
    """Response model for errors"""
    status: str
    message: str
    details: Optional[str] = None


def sanitize_url(url: str) -> str:
    """
    Sanitize URL input to prevent shell injection attacks and enforce allowed domains
    """
    # Remove any shell metacharacters (but allow & for query params)
    dangerous_chars = [';', '|', '`', '$', '(', ')', '<', '>', '\n', '\r']
    
    for char in dangerous_chars:
        if char in url:
            raise ValueError(f"URL contains invalid character: {char}")
    
    # Basic URL validation
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(url):
        raise ValueError("Invalid URL format")

    # Allowed domains check
    allowed_domains = [
        "instagram.com", "instagr.am",
        "facebook.com", "fb.watch", "fb.com",
        "tiktok.com", "vm.tiktok.com", "vt.tiktok.com",
        "pinterest.com", "pin.it"
    ]
    
    # Simple domain check
    domain_match = False
    for domain in allowed_domains:
        if domain in url.lower():
            domain_match = True
            break
            
    if not domain_match:
        raise ValueError("Only Instagram, Facebook, TikTok, and Pinterest URLs are supported.")
    
    return url.strip()


async def _extract_with_ytdlp(url: str) -> Dict[str, Any]:
    """
    Internal helper to extract using yt-dlp
    """
    # Special handling for Facebook
    is_facebook = 'facebook.com' in url or 'fb.watch' in url
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'format': 'best[ext=mp4]/best' if is_facebook else 'best',  # Force mp4 for Facebook
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'cookiefile': 'cookies.txt',
        'extractor_args': {
            'instagram': {'include_stories': True},
            'facebook': {'source': 'mbasic'},  # Use mbasic for better reliability
            'twitter': {'api': 'syndication'},
            'tiktok': {'api': 'mobile_api'}
        },
        'retries': 3,  # Increased retries
        'fragment_retries': 3,
        'ignoreerrors': True,
        'age_limit': None,
        'nocheckcertificate': True,
        'geo_bypass': True,
    }
    
    # Run yt-dlp in a thread to avoid blocking
    def run_ytdlp_sync():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    import traceback
    try:
        info = await asyncio.to_thread(run_ytdlp_sync)
        if not info:
             raise Exception("yt-dlp failed to extract info")
        
        # specific handling for playlists (like Instagram stories)
        if 'entries' in info:
            logger.info("Found entries in yt-dlp info")
            entries = list(info['entries'])
            if entries:
                title = info.get('title', 'Instagram Stories')
                uploader = info.get('uploader') or entries[0].get('uploader', 'Instagram')
                thumbnail = entries[0].get('thumbnail', '')
                duration = 0
                
                formats_list = []
                
                for i, entry in enumerate(entries):
                    if not entry: continue

                    url_direct = entry.get('url')
                    if not url_direct and 'formats' in entry:
                        # SAFELY Filter formats
                        valid_formats = [f for f in entry.get('formats', []) if f and isinstance(f, dict)]
                        if valid_formats:
                            # Use safe get with default
                            best_fmt = sorted(valid_formats, key=lambda x: x.get('height', 0) or 0)[-1]
                            url_direct = best_fmt.get('url')
                        
                    if url_direct:
                        story_title = entry.get('title', f'Story {i+1}')
                        is_video = entry.get('vcodec') != 'none' or entry.get('ext') == 'mp4'
                        type_label = "Video" if is_video else "Image"
                        
                        formats_list.append({
                            'quality': f"Story {i+1} ({type_label})",
                            'ext': entry.get('ext', 'mp4'),
                            'width': entry.get('width'),
                            'height': entry.get('height'),
                            'filesize': entry.get('filesize'),
                            'filesize_mb': round(entry.get('filesize', 0) / (1024 * 1024), 2) if entry.get('filesize') else None,
                            'url': url_direct,
                            'format_id': f'story_{i+1}',
                            'note': story_title
                        })

                logger.info(f"Processed {len(formats_list)} entries")
                return {
                    'status': 'success',
                    'title': title,
                    'thumbnail': thumbnail,
                    'duration': duration,
                    'uploader': uploader,
                    'formats': formats_list
                }
            else:
                 logger.warning("Entries list was empty")

        # Extract relevant information
        logger.info("Processing as single video (no entries)")
        title = info.get('title', 'Unknown Title')
        thumbnail = info.get('thumbnail', '')
        duration = info.get('duration', 0)
        uploader = info.get('uploader', 'Unknown')
        
        formats_list = []
        seen_qualities = set()
        
        if 'formats' in info:
            for fmt in info.get('formats', []):
                 if not fmt: continue # Safety check
                 
                 # Strictly filter out known image extensions
                 ext = fmt.get('ext', 'mp4')
                 if ext in ['jpg', 'png', 'webp', 'jpeg']:
                     continue
                 
                 # Filter out items that are explicitly NOT video
                 # Some formats might have vcodec='none' but are actual videos (rare), usually they are audio only
                 # If both vcodec and acodec are none, it's likely a dummy or image
                 vcodec = fmt.get('vcodec', 'none')
                 acodec = fmt.get('acodec', 'none')
                 
                 if vcodec == 'none' and acodec == 'none':
                     continue
                     
                 # If it has no width/height and vcodec is none, likely audio only or garbage
                 if vcodec == 'none' and (not fmt.get('width') or fmt.get('width') == 0):
                     # Allow audio-only? User wants video for Reels.
                     # Let's skip audio-only for Reels unless requested
                     continue

                 quality = fmt.get('format_note', 'unknown')
                 height = fmt.get('height', 0)
                 width = fmt.get('width', 0)
                 filesize = fmt.get('filesize', 0) or fmt.get('filesize_approx', 0)
                 url_direct = fmt.get('url', '')
                 
                 if height: quality_label = f"{height}p"
                 else: quality_label = quality or 'Unknown'
                 
                 quality_key = f"{quality_label}_{ext}"
                 if quality_key not in seen_qualities and url_direct:
                    seen_qualities.add(quality_key)
                    formats_list.append({
                        'quality': quality_label,
                        'ext': ext,
                        'width': width,
                        'height': height,
                        'filesize': filesize,
                        'filesize_mb': round(filesize / (1024 * 1024), 2) if filesize else None,
                        'url': url_direct,
                        'format_id': fmt.get('format_id', ''),
                        'vcodec': vcodec # Pass this for debugging if needed
                    })
                    
        # Fallback: If no formats found but we have a direct url property
        if not formats_list and info.get('url'):
             logger.info("No formats found, using root 'url' property as fallback")
             formats_list.append({
                'quality': 'HD',
                'ext': info.get('ext', 'mp4'),
                'width': info.get('width'),
                'height': info.get('height'),
                'filesize': info.get('filesize'),
                'filesize_mb': None,
                'url': info['url'],
                'format_id': 'direct_fallback',
            })
        elif 'url' in info:
             formats_list.append({
                'quality': 'HD',
                'ext': info.get('ext', 'mp4'),
                'width': info.get('width'),
                'height': info.get('height'),
                'filesize': info.get('filesize'),
                'filesize_mb': None,
                'url': info['url'],
                'format_id': 'direct',
            })
        
        # Sort by quality (height) descending
        formats_list.sort(key=lambda x: x.get('height', 0) or 0, reverse=True)

        # IMPORTANT: For single videos (reels), only return the BEST format
        # to prevent the frontend from displaying duplicates.
        # Multi-item content like carousels/stories are handled in the 'entries' block above.
        # This ensures single reels don't show up as multiple items.
        if is_facebook and formats_list:
            # For Facebook, keep only the best quality format
            formats_list = [formats_list[0]]
            logger.info(f"Facebook single video: returning only best format: {formats_list[0].get('quality')}")
        
        return {
            'status': 'success',
            'title': title,
            'thumbnail': thumbnail,
            'duration': duration,
            'uploader': uploader,
            'formats': formats_list,
            'is_carousel': False  # Explicitly mark as not a carousel
        }
    
    except Exception as e:
        logger.error(f"yt-dlp extraction error for URL {url}: {str(e)}\n{traceback.format_exc()}")
        raise e


async def extract_video_info(url: str) -> Dict[str, Any]:
    """
    Extract video information using parallel strategies for speed
    """
    # Facebook-specific handling with direct scraping
    if "facebook.com" in url or "fb.watch" in url:
        logger.info(f"Detected Facebook URL: {url}")
        
        resolved_url = url
        
        # Resolve share URLs to get the actual destination
        if '/share/' in url:
            try:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                resp = requests.get(url, headers=headers, allow_redirects=True, timeout=15)
                if resp.status_code == 200:
                    resolved_url = resp.url
                    logger.info(f"Resolved share URL to: {resolved_url}")
            except Exception as e:
                logger.warning(f"Could not resolve share URL: {e}")
        
        # Check if it's a photo URL (either original or resolved)
        is_photo = '/photo' in resolved_url or 'fbid=' in resolved_url or '/photo' in url
        
        if is_photo:
            logger.info("Detected Facebook photo URL, trying photo scraper")
            try:
                from facebook_photo_scraper import get_facebook_photo, load_cookies_as_dict
                cookies = load_cookies_as_dict('cookies.txt')
                # Use resolved URL if available
                photo_url = resolved_url if 'photo' in resolved_url or 'fbid=' in resolved_url else url
                result = await asyncio.to_thread(get_facebook_photo, photo_url, cookies)
                if result and result.get('status') == 'success':
                    logger.info("Facebook photo scraping successful")
                    return result
            except Exception as e:
                logger.warning(f"Facebook photo scraping failed: {e}, falling back to yt-dlp")
        
        # Try video scraper for reels/videos
        else:
            logger.info("Trying Facebook video scraper")
            
            # Try 1: Fast scraper with reusable browser (fastest after first run)
            try:
                from facebook_fast_scraper import scrape_facebook_fast
                result = await scrape_facebook_fast(url)
                if result and result.get('status') == 'success':
                    logger.info("Facebook fast scraping successful")
                    return result
            except Exception as e:
                logger.warning(f"Facebook fast scraping failed: {e}")
            
            # Try 3: Maybe it's actually a photo? Try photo scraper as fallback
            try:
                logger.info("Video scrapers failed, trying photo scraper as fallback")
                from facebook_photo_scraper import get_facebook_photo, load_cookies_as_dict
                cookies = load_cookies_as_dict('cookies.txt')
                result = await asyncio.to_thread(get_facebook_photo, url, cookies)
                if result and result.get('status') == 'success':
                    logger.info("Facebook photo scraping successful (fallback)")
                    return result
            except Exception as e:
                logger.warning(f"Facebook photo scraping fallback also failed: {e}, falling back to yt-dlp")
    
    if "instagram.com" in url:
        # Check if it is a story URL and extract username
        # Pattern: instagram.com/stories/username/12345/
        story_match = re.search(r'instagram\.com/stories/([^/]+)/', url)
        if story_match:
             username = story_match.group(1)
             logger.info(f"Detected story URL for user {username}, fetching all stories")
             try:
                 return await asyncio.to_thread(get_instagram_stories, username)
             except Exception as e:
                 logger.error(f"Failed to fetch stories for {username}: {e}")
                 # Fallback to standard extraction? No, standard extraction will likely fail on story ID if login is required.
                 # But we can try just in case.
                 pass

        logger.info(f"Starting Instagram extraction for {url}")
        
        # Try Instaloader FIRST - it properly handles carousels
        try:
            result = await asyncio.to_thread(get_instagram_post, url)
            if result and result.get('status') == 'success':
                logger.info(f"Instaloader succeeded with {len(result.get('formats', []))} formats")
                return result
        except Exception as e:
            logger.warning(f"Instaloader failed: {e}, trying yt-dlp")
        
        # Fallback to yt-dlp if Instaloader fails
        try:
            result = await _extract_with_ytdlp(url)
            if result:
                return result
        except Exception as e:
            logger.warning(f"yt-dlp also failed: {e}")
        
        raise Exception("All extraction methods failed")

    # TikTok handling
    if "tiktok.com" in url:
        logger.info(f"Detected TikTok URL: {url}")
        try:
            from tiktok_scraper import scrape_tiktok_video_async
            # Try new hybrid scraper (SSSTik + TikWM)
            result = await scrape_tiktok_video_async(url)
            if result and result.get('status') == 'success':
                logger.info("TikTok scraping successful")
                return result
        except Exception as e:
            logger.warning(f"TikTok scraper failed: {e}, falling back to yt-dlp")
            
    # Non-Instagram/Facebook/TikTok URLs (or fallback)
    return await _extract_with_ytdlp(url)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Video Stream Extraction API",
        "version": "1.0.0"
    }


@app.get("/api/extract")
async def extract_video(
    url: str = Query(..., description="Video URL to extract")
) -> JSONResponse:
    """
    Extract video information and download links
    
    Args:
        url: Video URL (YouTube, Instagram, TikTok, etc.)
        
    Returns:
        JSON response with video info and download links
    """
    try:
        # Sanitize URL input
        try:
            clean_url = sanitize_url(url)
        except ValueError as e:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Invalid URL",
                    "details": str(e)
                }
            )
        
        # Extract video information
        try:
            result = await extract_video_info(clean_url)
            return JSONResponse(content=result)
            
        except Exception as e:
            logger.error(f"Extraction failed: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "message": "Extraction failed",
                    "details": "Unable to extract video information. The video may be private, deleted, or the platform may have changed."
                }
            )
            
    except Exception as e:
        # Catch-all for any unexpected errors
        logger.error(f"Unexpected error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Internal server error",
                "details": "An unexpected error occurred"
            }
        )


@app.post("/api/extract")
async def extract_video_post(
    request: Dict[str, str]
) -> JSONResponse:
    """
    POST version of extract endpoint
    
    Args:
        request: JSON body with 'url' field
        
    Returns:
        JSON response with video info and download links
    """
    url = request.get('url')
    if not url:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": "Missing URL parameter"
            }
        )
    
    return await extract_video(url=url)


@app.get("/api/tiktok")
async def extract_tiktok(
    url: str = Query(..., description="TikTok video URL")
) -> JSONResponse:
    """
    Extract TikTok video using yt-dlp
    
    Args:
        url: TikTok video URL
        
    Returns:
        JSON response with TikTok video download link
    """
    try:
        # Try TikWM API scraper first
        try:
            logger.info("Trying TikWM API for TikTok")
            from tiktok_scraper import scrape_tiktok_video_async
            result = await scrape_tiktok_video_async(url)
            if result and result.get('status') == 'success':
                logger.info("TikTok scraping successful")
                return JSONResponse(content=result)
        except Exception as e:
            logger.warning(f"TikWM scraper failed: {e}, trying yt-dlp")
        
        # Fallback to yt-dlp
        result = await _extract_with_ytdlp(url)
        
        if result and result.get('status') == 'success':
            return JSONResponse(content=result)
        else:
            raise Exception("All TikTok extraction methods failed")
            
    except Exception as e:
        logger.error(f"TikTok extraction failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "TikTok extraction failed",
                "details": "Unable to extract TikTok video. The video may be private or deleted."
            }
        )


@app.get("/api/instagram-profile")
async def get_instagram_profile_pic(
    username: str = Query(..., description="Instagram username")
) -> JSONResponse:
    """
    Get Instagram profile picture using web scraping
    
    Args:
        username: Instagram username (without @)
        
    Returns:
        JSON response with profile picture URL
    """
    try:
        result = get_instagram_profile_picture(username)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Instagram profile extraction failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Profile picture extraction failed",
                "details": f"Unable to get profile picture for @{username}. Make sure the account exists and is public."
            }
        )


@app.get("/api/facebook-profile")
async def get_facebook_profile_pic(
    url: str = Query(..., description="Facebook profile URL")
) -> JSONResponse:
    """
    Get Facebook profile picture using web scraping
    
    Args:
        url: Facebook profile URL
        
    Returns:
        JSON response with profile picture URL
    """
    try:
        result = await asyncio.to_thread(get_facebook_profile_picture, url)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Facebook profile extraction failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Profile picture extraction failed",
                "details": "Unable to get Facebook profile picture. Ensure the profile is public."
            }
        )


@app.get("/api/download")
def download_file(url: str, filename: str = "download", inline: bool = False):
    """
    Proxy file download to bypass CORS and force save, or serve inline for previews
    """
    try:
        # Basic validation
        if not url.startswith("http"):
            raise HTTPException(status_code=400, detail="Invalid URL")
            
        # Headers logic
        # Use a high-quality recent User-Agent
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
        
        # TikTok/SSSTik specific headers
        # cover both tikcdn.io and any other potential cdn domains like tiktokcdn.com if needed
        if 'tikcdn.io' in url or 'tiktokcdn' in url or 'ttcdn' in url:
            headers['Referer'] = 'https://ssstik.io/en'
            headers['Origin'] = 'https://ssstik.io'
            
        r = requests.get(url, stream=True, timeout=120, headers=headers)
        r.raise_for_status()
        
        # Get content type from upstream
        content_type = r.headers.get("content-type", "application/octet-stream")
        
        # FIX: If upstream is generic octet-stream, try to guess from filename
        if content_type == 'application/octet-stream' or 'binary' in content_type:
            if filename.endswith('.mp4'):
                content_type = 'video/mp4'
            elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif filename.endswith('.png'):
                content_type = 'image/png'
            elif filename.endswith('.mp3'):
                content_type = 'audio/mpeg'
        
        def iterfile():
            for chunk in r.iter_content(chunk_size=8192):
                yield chunk
        
        response_headers = {}
        if not inline:
            response_headers["Content-Disposition"] = f'attachment; filename="{filename}"'
            
        # Forward content-length if available
        if "content-length" in r.headers:
            response_headers["Content-Length"] = r.headers["content-length"]
        
        return StreamingResponse(iterfile(), media_type=content_type, headers=response_headers)
        
    except Exception as e:
        logger.error(f"Download proxy failed: {e}")
        # Return a generic error to client but log the detail
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")


# For serverless deployment (Vercel, AWS Lambda, etc.)
# The handler will be automatically detected by the platform
handler = app
