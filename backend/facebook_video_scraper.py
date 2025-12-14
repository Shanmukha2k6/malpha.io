"""
Facebook Video/Reel Scraper
Direct web scraping to extract video CDN URLs
"""

import requests
import re
import json
import logging
from bs4 import BeautifulSoup
from urllib.parse import unquote

logger = logging.getLogger(__name__)

def get_facebook_video(url: str) -> dict:
    """
    Scrape Facebook video/reel using direct HTML parsing
    
    Args:
        url: Facebook video/reel URL
        
    Returns:
        dict with status, title, and video URL
    """
    import http.cookiejar
    import os
    
    try:
        original_url = url
        
        # Load cookies for authenticated requests
        cookies = {}
        try:
            if os.path.exists('cookies.txt'):
                cj = http.cookiejar.MozillaCookieJar('cookies.txt')
                cj.load()
                cookies = {c.name: c.value for c in cj if 'facebook' in c.domain}
        except:
            pass
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        
        # Single request first
        logger.info(f"Fetching Facebook URL: {url}")
        response = requests.get(url, headers=headers, cookies=cookies, timeout=10, allow_redirects=True)
        html = response.text
        
        # If 400 error and it's a share URL, try mobile version
        if response.status_code != 200 and '/share/' in url:
            mobile_headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
            }
            response = requests.get(url, headers=mobile_headers, cookies=cookies, timeout=10, allow_redirects=True)
            html = response.text
        
        if response.status_code != 200:
            raise Exception(f"Facebook returned status {response.status_code}")
        
        html = html or response.text
        
        # Method 1: Look for video URLs in JSON-LD or meta tags
        video_url = None
        title = "Facebook Video"
        thumbnail = None
        
        # Try to find video URL in various formats
        patterns = [
            # HD/SD playable URLs
            r'"playable_url":"([^"]+)"',
            r'"playable_url_quality_hd":"([^"]+)"',
            r'"browser_native_hd_url":"([^"]+)"',
            r'"browser_native_sd_url":"([^"]+)"',
            r'hd_src:"([^"]+)"',
            r'sd_src:"([^"]+)"',
            r'"videoUrl":"([^"]+)"',
            # New patterns for share URLs
            r'"video_url":"([^"]+)"',
            r'playable_url_quality_hd\\":\\"([^"]+)\\"',
            r'playable_url\\":\\"([^"]+)\\"',
            r'"src":"(https://[^"]*video[^"]*\.mp4[^"]*)"',
            r'src="(https://[^"]*video[^"]*\.mp4[^"]*)"',
            # Look for any fbcdn video URLs
            r'(https://video[^"\'\\s]+\.fbcdn\.net/[^"\'\\s]+)',
            r'(https://[^"\'\\s]*\.fbcdn\.net/[^"\'\\s]*video[^"\'\\s]*)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                if match and ('video' in match or 'fbcdn' in match):
                    video_url = match
                    # Decode escaped unicode
                    try:
                        video_url = video_url.encode().decode('unicode_escape')
                    except:
                        pass
                    # Clean up the URL
                    video_url = video_url.replace('\\/', '/')
                    video_url = video_url.replace('\\u0025', '%')
                    video_url = video_url.replace('&amp;', '&')
                    
                    # Validate it looks like a video URL
                    if 'fbcdn.net' in video_url or '.mp4' in video_url:
                        logger.info(f"Found video URL with pattern: {pattern}")
                        break
            if video_url:
                break
        
        # Try BeautifulSoup for meta tags
        if not video_url:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Check og:video meta tag
            og_video = soup.find('meta', property='og:video')
            if og_video and og_video.get('content'):
                video_url = og_video.get('content')
            
            # Check og:video:secure_url
            if not video_url:
                og_video_secure = soup.find('meta', property='og:video:secure_url')
                if og_video_secure and og_video_secure.get('content'):
                    video_url = og_video_secure.get('content')
            
            # Get title
            og_title = soup.find('meta', property='og:title')
            if og_title:
                title = og_title.get('content', title)
            
            # Get thumbnail
            og_image = soup.find('meta', property='og:image')
            if og_image:
                thumbnail = og_image.get('content')
        
        if not video_url:
            raise Exception("Could not extract video URL from Facebook page")
        
        # Clean and validate URL
        video_url = unquote(video_url)
        
        return {
            'status': 'success',
            'title': title,
            'thumbnail': thumbnail,
            'duration': 0,
            'uploader': 'Facebook',
            'is_carousel': False,  # Single video, not a carousel
            'formats': [{
                'quality': 'HD',
                'ext': 'mp4',
                'url': video_url,
                'format_id': 'hd',
                'vcodec': 'h264',
                'width': 1280,
                'height': 720
            }]
        }
        
    except Exception as e:
        logger.error(f"Facebook video scraping failed: {str(e)}")
        raise Exception(f"Failed to extract Facebook video: {str(e)}")
