"""
Facebook Profile Picture Scraper
Robust web scraping implementation for Facebook
"""

from bs4 import BeautifulSoup
import requests
import logging
import re
import os
import http.cookiejar

logger = logging.getLogger(__name__)

def load_cookies(cookie_file='cookies.txt'):
    """Load cookies from Netscape format file"""
    try:
        if os.path.exists(cookie_file):
            cj = http.cookiejar.MozillaCookieJar(cookie_file)
            cj.load()
            return cj
    except Exception as e:
        logger.warning(f"Could not load cookies: {e}")
    return None

def get_facebook_profile_picture(profile_url: str) -> dict:
    """
    Scrape Facebook profile picture
    
    Args:
        profile_url: Facebook profile URL
        
    Returns:
        dict with status, username, and profile_pic_url
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        }
        
        # Ensure URL is correct
        if 'facebook.com' not in profile_url:
             profile_url = f"https://www.facebook.com/{profile_url}"
             
        # Load cookies
        cookies = load_cookies()
        
        response = requests.get(profile_url, headers=headers, cookies=cookies, timeout=15)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            profile_pic_url = None
            full_name = "Facebook User"
            
            # Method 1: Open Graph Meta Tags (Most reliable)
            meta_image = soup.find('meta', property='og:image')
            if meta_image and meta_image.get('content'):
                profile_pic_url = meta_image.get('content')
            
            # Method 2: Twitter Card
            if not profile_pic_url:
                meta_image = soup.find('meta', name='twitter:image')
                if meta_image and meta_image.get('content'):
                    profile_pic_url = meta_image.get('content')
            
            # Extract Name
            meta_title = soup.find('meta', property='og:title')
            if meta_title:
                full_name = meta_title.get('content', '').replace(' | Facebook', '')
            
            # Extract basic username from URL
            username = "facebook_user"
            try:
                if "profile.php" in profile_url:
                     username = full_name.replace(" ", "_").lower()
                else:
                     # https://www.facebook.com/username
                     path = profile_url.split("facebook.com/")[-1]
                     username = path.split("/")[0].split("?")[0]
            except:
                pass

            if profile_pic_url:
                # Facebook often puts a placeholder if not public, but let's return what we find
                return {
                    'status': 'success',
                    'username': username,
                    'full_name': full_name,
                    'profile_pic_url': profile_pic_url,
                    'profile_pic_url_hd': profile_pic_url # FB usually serves good quality via OG
                }
            else:
                # Check for login redirect or error page
                page_title = soup.title.string.lower() if soup.title else ""
                if "log into facebook" in response.text.lower() or "login" in response.url or "error" in page_title:
                     raise Exception("Facebook refused access. Your cookies might be missing crucial session data (c_user, xs).")
                     
                raise Exception("Could not find profile picture in page meta tags")
        else:
            raise Exception(f"Facebook returned status {response.status_code}")
            
    except Exception as e:
        logger.error(f"Facebook scraping failed: {str(e)}")
        raise
