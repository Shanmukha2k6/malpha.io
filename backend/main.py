"""
FastAPI Video Stream Extraction API
Serverless-ready backend for extracting video download links using yt-dlp
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import yt_dlp
import re
import requests
from bs4 import BeautifulSoup
import json
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, validator
import logging
from instagram_scraper import get_instagram_profile_picture, get_instagram_post
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
    Sanitize URL input to prevent shell injection attacks
    
    Args:
        url: User-submitted URL
        
    Returns:
        Sanitized URL string
        
    Raises:
        ValueError: If URL contains suspicious patterns
    """
    # Remove any shell metacharacters
    dangerous_chars = [';', '&', '|', '`', '$', '(', ')', '<', '>', '\n', '\r']
    
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
    
    return url.strip()


def extract_video_info(url: str) -> Dict[str, Any]:
    """
    Extract video information using yt-dlp or dedicated scrapers
    
    Args:
        url: Video URL to extract
        
    Returns:
        Dictionary containing video information and download links
        
    Raises:
        Exception: If extraction fails
    """
    # Try Instaloader for Instagram first (better for carousels/images)
    if "instagram.com" in url:
        try:
            logger.info(f"Attempting Instaloader extraction for {url}")
            return get_instagram_post(url)
        except Exception as e:
            logger.warning(f"Instaloader failed: {e}")
            # If it's a known unsupported type, don't waste time with yt-dlp
            if "Audio" in str(e) and "supported" in str(e):
                return {'status': 'error', 'message': str(e)}
            # Continue to yt-dlp fallback

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'format': 'best',
        # Don't download, just extract info
        'skip_download': True,
        # DISABLED for speed - formats from info dict
        'listformats': False,
        # Increased timeout to handle multi-story fetching
        'socket_timeout': 30,
        # Better user agent
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        # Additional headers
        'http_headers': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Sec-Fetch-Mode': 'navigate',
        },
        # Cookies file for authentication (enables Instagram stories, TikTok, etc.)
        'cookiefile': 'cookies.txt',
        # Platform-specific optimizations
        'extractor_args': {
            'instagram': {
                'include_stories': True,
            },
            'twitter': {
                'api': 'syndication',
            },
            'tiktok': {
                'api': 'mobile_api',  # Mobile API for better compatibility
            }
        },
        # Reduced retries for speed
        'retries': 3,
        'fragment_retries': 3,
        # Ignore errors so one bad story doesn't fail the whole batch
        'ignoreerrors': True,
        # Age limit bypass
        'age_limit': None,
        # Speed optimizations
        'nocheckcertificate': True,
        'geo_bypass': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # specific handling for playlists (like Instagram stories)
            if 'entries' in info:
                # It's a playlist or multiple stories
                entries = list(info['entries'])
                if entries:
                    # Treat the playlist itself as the "video" but offer each entry as a "format"
                    # This allows downloading ANY story from the list
                    
                    # Use playlist metadata
                    title = info.get('title', 'Instagram Stories')
                    uploader = info.get('uploader') or entries[0].get('uploader', 'Instagram')
                    thumbnail = entries[0].get('thumbnail', '')
                    duration = 0
                    
                    formats_list = []
                    
                    for i, entry in enumerate(entries):
                        # Filter out None entries (failed extractions due to ignoreerrors=True)
                        if not entry:
                            continue

                        # Get best url for this entry
                        url_direct = entry.get('url')
                        if not url_direct and 'formats' in entry:
                            # Find best format in entry
                            best_fmt =  sorted(entry['formats'], key=lambda x: x.get('height', 0))[-1]
                            url_direct = best_fmt.get('url')
                            
                        if url_direct:
                            # Create a "format" that is actually a story
                            story_title = entry.get('title', f'Story {i+1}')
                            # Check if it's video or image
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
                            
                    return {
                        'status': 'success',
                        'title': title,
                        'thumbnail': thumbnail,
                        'duration': duration,
                        'uploader': uploader,
                        'formats': formats_list
                    }
                else:
                    raise Exception("No stories found in this feed")

            # Extract relevant information
            title = info.get('title', 'Unknown Title')
            thumbnail = info.get('thumbnail', '')
            duration = info.get('duration', 0)
            uploader = info.get('uploader', 'Unknown')
            
            # Process formats
            formats_list = []
            seen_qualities = set()
            
            if 'formats' in info:
                for fmt in info['formats']:
                    # Only include formats with video
                    if fmt.get('vcodec') != 'none':
                        quality = fmt.get('format_note', 'unknown')
                        height = fmt.get('height', 0)
                        width = fmt.get('width', 0)
                        ext = fmt.get('ext', 'mp4')
                        filesize = fmt.get('filesize', 0) or fmt.get('filesize_approx', 0)
                        url_direct = fmt.get('url', '')
                        
                        # Create quality label
                        if height:
                            quality_label = f"{height}p"
                        else:
                            quality_label = quality
                        
                        # Avoid duplicates
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
                            })
            elif 'url' in info:
                # Direct URL fallback
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
            formats_list.sort(key=lambda x: x.get('height', 0), reverse=True)

            # FORCE SINGLE OUTPUT: If we found formats, only return the best one
            # This prevents the UI from showing multiple "cards" for the same video (just different qualities)
            if formats_list:
                formats_list = [formats_list[0]]
            
            return {
                'status': 'success',
                'title': title,
                'thumbnail': thumbnail,
                'duration': duration,
                'uploader': uploader,
                'formats': formats_list
            }
            
    except Exception as e:
        logger.error(f"Extraction error for URL {url}: {str(e)}")
        raise


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
            result = extract_video_info(clean_url)
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
    Extract TikTok video using third-party API
    
    Args:
        url: TikTok video URL
        
    Returns:
        JSON response with TikTok video download link
    """
    try:
        # Use SSSTik API (free, no auth needed)
        api_url = "https://ssstik.io/abc"
        
        # SSSTik expects form data
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        
        data = {
            'id': url,
            'locale': 'en',
            'tt': 'placeholder'  # Required by SSSTik
        }
        
        response = requests.post(api_url, headers=headers, data=data, params={'url': 'dl'}, timeout=15)
        
        if response.status_code == 200:
            # Parse response to extract download link
            # SSSTik returns HTML with download link
            import re
            # Look for download link in response
            match = re.search(r'href="(https://[^"]+\.mp4[^"]*)"', response.text)
            
            if match:
                download_url = match.group(1)
                return JSONResponse(content={
                    'status': 'success',
                    'title': 'TikTok Video',
                    'thumbnail': '',
                    'duration': 0,
                    'uploader': 'TikTok',
                    'formats': [{
                        'quality': 'HD',
                        'ext': 'mp4',
                        'url': download_url,
                        'filesize_mb': None
                    }]
                })
            else:
                raise Exception("Could not extract download link")
        else:
            raise Exception(f"API returned status {response.status_code}")
            
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
        result = get_facebook_profile_picture(url)
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
async def download_file(url: str, filename: str = "download", inline: bool = False):
    """
    Proxy file download to bypass CORS and force save, or serve inline for previews
    """
    try:
        # Basic validation
        if not url.startswith("http"):
            raise HTTPException(status_code=400, detail="Invalid URL")
            
        r = requests.get(url, stream=True, timeout=60)
        r.raise_for_status()
        
        # Get content type from upstream
        content_type = r.headers.get("content-type", "application/octet-stream")
        
        def iterfile():
            for chunk in r.iter_content(chunk_size=8192):
                yield chunk
        
        headers = {}
        if not inline:
            headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        
        return StreamingResponse(iterfile(), media_type=content_type, headers=headers)
        
    except Exception as e:
        logger.error(f"Download proxy failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# For serverless deployment (Vercel, AWS Lambda, etc.)
# The handler will be automatically detected by the platform
handler = app
