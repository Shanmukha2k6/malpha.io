"""
Facebook Photo Scraper
Direct HTML parsing to extract photo URLs
"""

import requests
import re
import json
import logging
from bs4 import BeautifulSoup
from urllib.parse import unquote

logger = logging.getLogger(__name__)

def get_facebook_photo(url: str, cookies_dict: dict = None) -> dict:
    """
    Scrape Facebook photo using direct HTML parsing
    
    Args:
        url: Facebook photo URL
        cookies_dict: Dictionary of cookies for authentication
        
    Returns:
        dict with status, title, and photo URL
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        logger.info(f"Fetching Facebook photo: {url}")
        
        # Fetch the page with cookies
        response = requests.get(url, headers=headers, cookies=cookies_dict, timeout=15, allow_redirects=True)
        
        logger.info(f"Response status: {response.status_code}, Final URL: {response.url}")
        
        if response.status_code != 200:
            raise Exception(f"Facebook returned status {response.status_code}")
        
        html = response.text
        
        # Method 1: Look for photo URLs in JSON data
        photo_url = None
        title = "Facebook Photo"
        
        # Pattern 1: Look for high-res image in JSON-LD or meta tags
        patterns = [
            r'"image":\s*{\s*"uri":\s*"([^"]+)"',
            r'"url":"(https://scontent[^"]+\.jpg[^"]*)"',
            r'"src":"(https://scontent[^"]+\.jpg[^"]*)"',
            r'(https://scontent[^"\'\\s]+\.jpg[^"\'\\s]*)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                if match and 'scontent' in match and '.jpg' in match:
                    photo_url = match
                    # Decode escaped unicode
                    try:
                        photo_url = photo_url.encode().decode('unicode_escape')
                    except:
                        pass
                    # Clean up the URL
                    photo_url = photo_url.replace('\\/', '/')
                    photo_url = photo_url.replace('\\u0026', '&')
                    photo_url = photo_url.replace('&amp;', '&')
                    
                    logger.info(f"Found photo URL with pattern: {pattern}")
                    break
            if photo_url:
                break
        
        # Method 2: Try BeautifulSoup for meta tags
        if not photo_url:
            soup = BeautifulSoup(html, 'html.parser')
            
            # Check og:image meta tag
            og_image = soup.find('meta', property='og:image')
            if og_image and og_image.get('content'):
                photo_url = og_image.get('content')
            
            # Get title
            og_title = soup.find('meta', property='og:title')
            if og_title:
                title = og_title.get('content', title)
        
        if not photo_url:
            raise Exception("Could not extract photo URL from Facebook page")
        
        # Clean and validate URL
        photo_url = unquote(photo_url)
        
        return {
            'status': 'success',
            'title': title,
            'thumbnail': photo_url,
            'duration': 0,
            'uploader': 'Facebook',
            'is_carousel': False,
            'formats': [{
                'quality': 'HD',
                'ext': 'jpg',
                'url': photo_url,
                'format_id': 'photo',
                'width': None,
                'height': None
            }]
        }
        
    except Exception as e:
        logger.warning(f"HTTP photo scraping failed: {e}, trying Playwright")
        
        # Fallback to Playwright for share URLs
        try:
            import asyncio
            from playwright.async_api import async_playwright
            
            async def scrape_with_playwright():
                async with async_playwright() as p:
                    browser = await p.chromium.launch(headless=True)
                    try:
                        page = await browser.new_page()
                        await page.goto(url, wait_until='domcontentloaded', timeout=20000)
                        await asyncio.sleep(1)
                        
                        content = await page.content()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        photo_url = None
                        title = "Facebook Photo"
                        
                        og_image = soup.find('meta', property='og:image')
                        if og_image and og_image.get('content'):
                            photo_url = og_image.get('content')
                        
                        og_title = soup.find('meta', property='og:title')
                        if og_title:
                            title = og_title.get('content', title)
                        
                        return photo_url, title
                    finally:
                        await browser.close()
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                photo_url, title = loop.run_until_complete(scrape_with_playwright())
            finally:
                loop.close()
            
            if photo_url:
                return {
                    'status': 'success',
                    'title': title,
                    'thumbnail': photo_url,
                    'duration': 0,
                    'uploader': 'Facebook',
                    'is_carousel': False,
                    'formats': [{
                        'quality': 'HD',
                        'ext': 'jpg',
                        'url': photo_url,
                        'format_id': 'photo',
                        'width': None,
                        'height': None
                    }]
                }
        except Exception as pw_error:
            logger.error(f"Playwright photo scraping also failed: {pw_error}")
        
        raise Exception(f"Failed to extract Facebook photo: {str(e)}")


def load_cookies_as_dict(cookie_file='cookies.txt'):
    """Load cookies from Netscape format file and return as dict"""
    cookies = {}
    try:
        with open(cookie_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                parts = line.split('\t')
                if len(parts) >= 7:
                    cookies[parts[5]] = parts[6]
    except Exception as e:
        logger.warning(f"Could not load cookies: {e}")
    return cookies
