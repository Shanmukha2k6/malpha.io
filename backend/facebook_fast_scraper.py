"""
Fast Facebook Scraper using pre-warmed browser pool
"""

import asyncio
import re
import logging
from typing import Dict, Any, Optional
from playwright.async_api import async_playwright, Browser, Page

logger = logging.getLogger(__name__)

# Global browser instance for reuse
_browser: Optional[Browser] = None
_playwright = None


async def _get_browser() -> Browser:
    """Get or create a shared browser instance"""
    global _browser, _playwright
    
    if _browser is None or not _browser.is_connected():
        from playwright.async_api import async_playwright
        _playwright = await async_playwright().start()
        _browser = await _playwright.chromium.launch(headless=True)
        logger.info("Created new browser instance")
    
    return _browser


async def scrape_facebook_fast(url: str) -> Dict[str, Any]:
    """
    Fast Facebook scraping using reusable browser
    """
    browser = await _get_browser()
    page = None
    
    try:
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        # Future to capture video URL immediately
        video_found = asyncio.Future()
        
        async def handle_response(response):
            try:
                url = response.url
                if '.mp4' in url and 'fbcdn' in url and 'bytestart' not in url:
                    if not video_found.done():
                         video_found.set_result(url)
            except:
                pass

        page.on("response", handle_response)
        
        # ULTRA FAST: Race navigation vs video detection
        logger.info(f"Starting ultra-fast scrape for {url}")
        
        # Start navigation (don't await yet)
        navigation_task = asyncio.create_task(
            page.goto(url, wait_until='commit', timeout=5000)
        )
        
        # Race: which finishes first - navigation or video found?
        video_wait_task = asyncio.create_task(
            asyncio.wait_for(video_found, timeout=3.0)
        )
        
        done, pending = await asyncio.wait(
            [navigation_task, video_wait_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Cancel pending tasks
        for task in pending:
            task.cancel()
            try:
                await task
            except:
                pass
        
        # Check if we got video URL
        video_url = None
        if video_found.done():
            try:
                video_url = video_found.result()
                logger.info("Video captured via network - ULTRA FAST!")
            except:
                pass
        
        # If network capture failed, scan page content
        if not video_url:
            logger.info("Network capture failed, scanning page...")
            try:
                # Ensure page is at least loaded
                if not navigation_task.done():
                    await asyncio.wait_for(navigation_task, timeout=3.0)
                await page.wait_for_load_state('domcontentloaded', timeout=3000)
            except:
                pass
                
            content = await page.content()
            
            patterns = [
                r'"playable_url":"([^"]+)"',
                r'"playable_url_quality_hd":"([^"]+)"',
                r'"browser_native_hd_url":"([^"]+)"',
                r'(https://video-[^"\s]+\.fbcdn\.net/[^"\s]+\.mp4[^"\s]*)',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0]
                    decoded = match.encode().decode('unicode_escape').replace('\\/', '/')
                    if 'fbcdn' in decoded and ('.mp4' in decoded or 'video' in decoded):
                        video_url = decoded
                        break
                if video_url:
                    break

        await context.close()
        
        if video_url:
            # Return immediately without fetching metadata for speed
            return {
                'status': 'success',
                'title': 'Facebook Video',
                'thumbnail': None,
                'duration': 0,
                'uploader': 'Facebook',
                'is_carousel': False,
                'formats': [{
                    'quality': 'HD',
                    'ext': 'mp4',
                    'url': video_url,
                    'format_id': 'hd'
                }]
            }
             
        raise Exception("No video URL found")

    except Exception as e:
        if page:
            try:
                await page.context.close()
            except:
                pass
        raise


if __name__ == "__main__":
    import sys
    test_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.facebook.com/share/p/1DGqmJ8pUp/"
    
    async def test():
        print(f"Testing: {test_url}")
        import time
        start = time.time()
        result = await scrape_facebook_fast(test_url)
        print(f"Time: {time.time() - start:.2f}s")
        print(f"Status: {result['status']}")
        print(f"Ext: {result['formats'][0]['ext']}")
    
    asyncio.run(test())
