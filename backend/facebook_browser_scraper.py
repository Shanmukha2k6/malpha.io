"""
Facebook Video Scraper using Browser Automation (Playwright)
This scraper uses a real browser to extract video URLs from Facebook
"""

import asyncio
import re
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

async def scrape_facebook_video_playwright(url: str) -> Dict[str, Any]:
    """
    Scrape Facebook video using Playwright browser automation
    
    Args:
        url: Facebook video/reel URL
        
    Returns:
        dict with status, title, thumbnail, and video URL
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise Exception("Playwright not installed. Run: pip install playwright && playwright install chromium")
    
    video_url = None
    title = "Facebook Video"
    thumbnail = None
    video_urls_captured = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        try:
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1280, 'height': 720}
            )
            
            page = await context.new_page()
            
            # Capture ALL network responses for video content
            async def capture_response(response):
                resp_url = response.url
                content_type = response.headers.get('content-type', '')
                
                # Only capture actual video URLs
                if 'video' in content_type or '.mp4' in resp_url:
                    video_urls_captured.append(resp_url)
                    logger.info(f"Captured video URL: {resp_url[:80]}...")
            
            page.on('response', capture_response)
            
            logger.info(f"Navigating to: {url}")
            
            try:
                await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            except Exception as e:
                logger.warning(f"Navigation warning: {e}")
            
            # Wait for page to load
            await asyncio.sleep(1.5)
            
            # Try to close any popups/modals
            try:
                close_buttons = await page.query_selector_all('[aria-label="Close"], [aria-label="Decline optional cookies"], button:has-text("Not now")')
                for btn in close_buttons:
                    try:
                        await btn.click()
                        await asyncio.sleep(0.5)
                    except:
                        pass
            except:
                pass
            
            # Try to click on video element to trigger loading
            try:
                video_elem = await page.query_selector('video, [data-sigil*="video"], [aria-label*="video"]')
                if video_elem:
                    await video_elem.click()
                    await asyncio.sleep(1)
            except:
                pass
            
            # Get page content
            content = await page.content()
            
            # Extract title
            try:
                og_title = await page.query_selector('meta[property="og:title"]')
                if og_title:
                    title = await og_title.get_attribute('content') or title
            except:
                pass
            
            # Extract thumbnail
            try:
                og_image = await page.query_selector('meta[property="og:image"]')
                if og_image:
                    thumbnail = await og_image.get_attribute('content')
            except:
                pass
            
            # Extract video URL from page source - only patterns that indicate actual videos
            patterns = [
                r'"playable_url":"([^"]+)"',
                r'"playable_url_quality_hd":"([^"]+)"',
                r'"browser_native_hd_url":"([^"]+)"',
                r'"browser_native_sd_url":"([^"]+)"',
                r'"video_url":"([^"]+)"',
                r'hd_src:"([^"]+)"',
                r'sd_src:"([^"]+)"',
                r'(https://video-[^"\s]+\.fbcdn\.net/[^"\s]+\.mp4[^"\s]*)',
                r'(https://[^"\s]+\.fbcdn\.net/v/[^"\s]+\.mp4[^"\s]*)',
            ]
            
            for pattern in patterns:
                try:
                    matches = re.findall(pattern, content)
                    for match in matches:
                        if isinstance(match, tuple):
                            match = match[0]
                        # Decode and clean URL
                        decoded = match.encode().decode('unicode_escape')
                        decoded = decoded.replace('\\/', '/').replace('&amp;', '&')
                        
                        # Only accept if it has clear video indicators
                        if 'fbcdn' in decoded and ('.mp4' in decoded or 'video' in decoded.lower()):
                            video_url = decoded
                            logger.info(f"Found video URL from pattern: {pattern[:30]}...")
                            break
                except Exception as e:
                    continue
                
                if video_url:
                    break
            
            # Use captured network URLs if pattern matching failed
            if not video_url and video_urls_captured:
                for vurl in video_urls_captured:
                    # Only accept URLs with clear video indicators
                    if 'fbcdn' in vurl and ('.mp4' in vurl or 'video' in vurl.lower()):
                        video_url = vurl
                        logger.info("Using captured network video URL")
                        break
            
        finally:
            await browser.close()
    
    if not video_url:
        raise Exception("Could not extract video URL from Facebook page")
    
    return {
        'status': 'success',
        'title': title,
        'thumbnail': thumbnail,
        'duration': 0,
        'uploader': 'Facebook',
        'is_carousel': False,
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


def scrape_facebook_video_sync(url: str) -> Dict[str, Any]:
    """Synchronous wrapper for the async scraper"""
    return asyncio.run(scrape_facebook_video_playwright(url))


if __name__ == "__main__":
    import sys
    test_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.facebook.com/share/p/1DGqmJ8pUp/"
    print(f"Testing: {test_url}")
    try:
        result = scrape_facebook_video_sync(test_url)
        print(f"Success! Title: {result['title']}")
        print(f"Video URL: {result['formats'][0]['url'][:80]}...")
    except Exception as e:
        print(f"Error: {e}")
