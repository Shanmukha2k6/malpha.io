"""
Facebook Profile Picture Scraper
Robust web scraping implementation for Facebook using Playwright
"""

from bs4 import BeautifulSoup
import requests
import logging
import re
import os
import http.cookiejar
import asyncio

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


async def _scrape_profile_with_playwright(profile_url: str) -> dict:
    """Use Playwright to scrape Facebook profile picture"""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise Exception("Playwright not installed")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            page = await context.new_page()
            
            await page.goto(profile_url, wait_until='domcontentloaded', timeout=20000)
            await asyncio.sleep(1)
            
            # Close popups
            try:
                close_btns = await page.query_selector_all('[aria-label="Close"], button:has-text("Not now")')
                for btn in close_btns:
                    try:
                        await btn.click()
                        await asyncio.sleep(0.3)
                    except:
                        pass
            except:
                pass
            
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            profile_pic_url = None
            full_name = "Facebook User"
            
            # Get profile picture from og:image
            meta_image = soup.find('meta', property='og:image')
            if meta_image and meta_image.get('content'):
                profile_pic_url = meta_image.get('content')
            
            # Get name
            meta_title = soup.find('meta', property='og:title')
            if meta_title:
                full_name = meta_title.get('content', '').replace(' | Facebook', '').replace(' - Facebook', '')
            
            # Extract username
            username = "facebook_user"
            try:
                if "profile.php" in profile_url:
                    username = full_name.replace(" ", "_").lower()
                else:
                    path = profile_url.split("facebook.com/")[-1]
                    username = path.split("/")[0].split("?")[0]
            except:
                pass
            
            return {
                'status': 'success',
                'username': username,
                'full_name': full_name,
                'profile_pic_url': profile_pic_url,
                'profile_pic_url_hd': profile_pic_url
            }
        finally:
            await browser.close()


def get_facebook_profile_picture(profile_url: str) -> dict:
    """
    Scrape Facebook profile picture
    
    Args:
        profile_url: Facebook profile URL
        
    Returns:
        dict with status, username, and profile_pic_url
    """
    # Ensure URL is correct
    if 'facebook.com' not in profile_url:
        profile_url = f"https://www.facebook.com/{profile_url}"
    
    # Try Playwright first
    try:
        # Create a new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(_scrape_profile_with_playwright(profile_url))
            if result and result.get('profile_pic_url'):
                return result
        finally:
            loop.close()
    except Exception as e:
        logger.warning(f"Playwright scraping failed: {e}, trying requests")
    
    # Fallback to requests
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
        
        cookies = load_cookies()
        response = requests.get(profile_url, headers=headers, cookies=cookies, timeout=15)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            profile_pic_url = None
            full_name = "Facebook User"
            
            meta_image = soup.find('meta', property='og:image')
            if meta_image and meta_image.get('content'):
                profile_pic_url = meta_image.get('content')
            
            meta_title = soup.find('meta', property='og:title')
            if meta_title:
                full_name = meta_title.get('content', '').replace(' | Facebook', '')
            
            username = "facebook_user"
            try:
                if "profile.php" in profile_url:
                    username = full_name.replace(" ", "_").lower()
                else:
                    path = profile_url.split("facebook.com/")[-1]
                    username = path.split("/")[0].split("?")[0]
            except:
                pass

            if profile_pic_url:
                return {
                    'status': 'success',
                    'username': username,
                    'full_name': full_name,
                    'profile_pic_url': profile_pic_url,
                    'profile_pic_url_hd': profile_pic_url
                }
            else:
                raise Exception("Could not find profile picture")
        else:
            raise Exception(f"Facebook returned status {response.status_code}")
            
    except Exception as e:
        logger.error(f"Facebook scraping failed: {str(e)}")
        raise
