"""
Instagram Profile Picture Scraper
Uses Instaloader for reliable data extraction
"""

import instaloader
import logging
import os
import re

logger = logging.getLogger(__name__)

def get_instagram_profile_picture(username: str) -> dict:
    """
    Scrape Instagram profile picture using Instaloader
    
    Args:
        username: Instagram username (without @)
        
    Returns:
        dict with status, username, full_name, and profile_pic_url
    """
    try:
        # Remove @ if present
        username = username.replace('@', '').strip()
        
        # Initialize Instaloader
        L = instaloader.Instaloader()
        
        # Try to load session from cookies.txt if available
        # Instaloader supports loading from file, but we'll try basic approach first completely anonymous
        # If that fails, we can add session loading logic
        
        # Load the profile
        profile = instaloader.Profile.from_username(L.context, username)
        
        return {
            'status': 'success',
            'username': profile.username,
            'full_name': profile.full_name,
            'profile_pic_url': profile.profile_pic_url,
            'profile_pic_url_hd': profile.profile_pic_url, # Instaloader usually gets high quality
            'is_private': profile.is_private,
            'is_verified': profile.is_verified,
            'biography': profile.biography,
        }
            
    except Exception as e:
        logger.error(f"Instaloader failed for {username}: {str(e)}")
        
        # Check for specific error types
        error_msg = str(e)
        if "Profile Not Found" in error_msg:
             raise Exception("User not found")
        elif "LoginRequired" in error_msg:
             raise Exception("Instagram requires login to view this profile. Please try again later.")
             
        raise Exception(f"Failed to fetch profile: {error_msg}")

def _load_cookies(L: instaloader.Instaloader):
    """Helper to load cookies from cookies.txt"""
    try:
        if os.path.exists("cookies.txt"):
             with open("cookies.txt", "r") as f:
                for line in f:
                    if line.startswith("#") or not line.strip():
                        continue
                    parts = line.strip().split("\t")
                    if len(parts) >= 7:
                        domain, name, value = parts[0], parts[5], parts[6]
                        if "instagram.com" in domain:
                            L.context._session.cookies.set(name, value, domain=domain)
        
        # User Agent is critical
        L.context._session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    except Exception as e:
        logger.warning(f"Failed to load cookies: {e}")

def get_instagram_post(url: str) -> dict:
    """
    Scrape Instagram post (Image, Video, Carousel)
    """
    try:
        # Check for unsupported audio collection pages
        if "/reels/audio/" in url:
            raise ValueError("Instagram Audio Collection pages are not currently supported. Please use a link to a specific Reel video.")

        # Extract shortcode
        # Standard IDs are 11 chars, sometimes 10 or 12. "audio" is 5.
        match = re.search(r'/(?:p|reels|reel)/([A-Za-z0-9_-]{10,})', url)
        if not match:
            # Fallback for older IDs or weird formats, but assume shortcode must be reasonable length
             match_fallback = re.search(r'/(?:p|reels|reel)/([A-Za-z0-9_-]+)', url)
             if match_fallback:
                 potential_code = match_fallback.group(1)
                 if potential_code.lower() == 'audio':
                     raise ValueError("Instagram Audio pages are not supported")
                 shortcode = potential_code
             else:
                raise ValueError("Invalid Instagram URL")
        else:
            shortcode = match.group(1)
        
        L = instaloader.Instaloader()
        _load_cookies(L)
        
        post = instaloader.Post.from_shortcode(L.context, shortcode)
        
        # Base info
        info = {
            'status': 'success',
            'title': post.caption if post.caption else f"Instagram Post {shortcode}",
            'uploader': post.owner_username,
            'thumbnail': post.url, # Default thumb
            'duration': post.video_duration if post.is_video else 0,
            'formats': []
        }
        
        # Handle formats (Single vs Sidecar)
        formats = []
        
        if post.typename == 'GraphSidecar':
            # Carousel
            for i, node in enumerate(post.get_sidecar_nodes()):
                is_video = node.is_video
                formats.append({
                    'quality': f"Slide {i+1} ({'Video' if is_video else 'Image'})",
                    'ext': 'mp4' if is_video else 'jpg',
                    'url': node.video_url if is_video else node.display_url,
                    'format_id': f'slide_{i+1}',
                    'width': node.dimensions[0] if hasattr(node, 'dimensions') else 0,
                    'height': node.dimensions[1] if hasattr(node, 'dimensions') else 0,
                })
        else:
            # Single Item
            is_video = post.is_video
            formats.append({
                'quality': "Best Quality",
                'ext': 'mp4' if is_video else 'jpg',
                'url': post.video_url if is_video else post.url,
                'format_id': 'original',
                'width': post.width,
                'height': post.height,
            })
            
        info['formats'] = formats
        
        # Fallback thumbnail if video
        if not info['thumbnail'] and formats:
            info['thumbnail'] = formats[0]['url']
            
        return info

    except Exception as e:
        logger.error(f"Instaloader post extraction failed: {str(e)}")
        raise e
