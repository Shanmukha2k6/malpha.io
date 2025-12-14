"""
TikTok Video Scraper using Web Scraping (SSSTik) and API Fallback (TikWM)
Optimized for speed with parallel execution
"""

import requests
import logging
import re
import random
import time
import asyncio
from bs4 import BeautifulSoup
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Common User Agents to rotate
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

def get_random_ua():
    return random.choice(USER_AGENTS)

async def scrape_tiktok_ssstik(url: str) -> Optional[Dict[str, Any]]:
    """
    Scrape TikTok video using SSSTik.io (Web Scraping) - Async
    """
    logger.info(f"Scraping TikTok via SSSTik: {url}")
    
    try:
        # Run in thread since requests is blocking
        def _sync_scrape():
            session = requests.Session()
            headers = {
                'User-Agent': get_random_ua(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
            
            # 1. Get Homepage to get token (Fast timeout)
            resp = session.get('https://ssstik.io/en', headers=headers, timeout=5)
            if resp.status_code != 200:
                raise Exception(f"SSSTik homepage failed: {resp.status_code}")
                
            # 2. Extract Token
            tt = None
            match = re.search(r's_tt\s*=\s*["\']([^"\']+)["\']', resp.text)
            if match:
                tt = match.group(1)
            else:
                soup = BeautifulSoup(resp.text, 'html.parser')
                inp = soup.find('input', {'name': 'tt'})
                if inp: tt = inp.get('value')
            
            if not tt: tt = '0'
                 
            # 3. Post Video URL
            post_url = 'https://ssstik.io/abc?url=dl'
            data = {'id': url, 'locale': 'en', 'tt': tt}
            
            headers['Origin'] = 'https://ssstik.io'
            headers['Referer'] = 'https://ssstik.io/en'
            headers['Hx-Request'] = 'true'
            headers['Hx-Target'] = 'target'
            headers['Hx-Current-Url'] = 'https://ssstik.io/en'
            
            # 4. Post
            post_resp = session.post(post_url, data=data, headers=headers, timeout=10)
            
            if post_resp.status_code != 200:
                raise Exception(f"SSSTik post failed: {post_resp.status_code}")
                
            # 5. Parse Result
            soup = BeautifulSoup(post_resp.text, 'html.parser')
            
            download_url = None
            title = "TikTok Video"
            thumbnail = None
            author_name = "TikTok User"
            
            h2 = soup.find('h2')
            if h2: author_name = h2.text.strip()
            
            p_text = soup.find('p', class_='maintext')
            if p_text: title = p_text.text.strip()
            
            img = soup.find('img', class_='result_author')
            if img: thumbnail = img.get('src')
            
            links = soup.find_all('a')
            for l in links:
                href = l.get('href')
                if not href: continue
                text = l.text.lower()
                if 'without_watermark' in l.get('class', []) or 'without watermark' in text:
                    download_url = href
                    break
                if 'tiktokcdn' in href and 'mp3' not in text:
                    download_url = href
                    
            if not download_url:
                raise Exception("No download link found in SSSTik response")
                
            return {
                'status': 'success',
                'title': title,
                'thumbnail': thumbnail or '',
                'duration': 0,
                'uploader': author_name,
                'is_carousel': False,
                'formats': [{
                    'quality': 'HD (No Watermark)',
                    'ext': 'mp4',
                    'url': download_url,
                    'format_id': 'ssstik_hd',
                    'vcodec': 'h264',
                }]
            }

        return await asyncio.to_thread(_sync_scrape)
        
    except Exception as e:
        logger.warning(f"SSSTik scraping failed: {e}")
        return None

async def scrape_tiktok_tikwm(url: str) -> Optional[Dict[str, Any]]:
    """
    Scrape TikTok video using TikWM API - Async
    """
    try:
        def _sync_tikwm():
            api_url = 'https://www.tikwm.com/api/'
            data = {'url': url, 'hd': 1}
            logger.info(f"Fetching TikTok video via TikWM: {url}")
            
            response = requests.post(api_url, data=data, timeout=15)
            
            if response.status_code != 200:
                return None
            
            result = response.json()
            if result.get('code') != 0:
                return None
            
            video_data = result.get('data', {})
            video_url = video_data.get('hdplay') or video_data.get('play')
            
            if not video_url: return None
            
            return {
                'status': 'success',
                'title': video_data.get('title', 'TikTok Video'),
                'thumbnail': video_data.get('cover') or video_data.get('origin_cover'),
                'duration': video_data.get('duration', 0),
                'uploader': video_data.get('author', {}).get('nickname', 'TikTok'),
                'is_carousel': False,
                'formats': [{
                    'quality': 'HD',
                    'ext': 'mp4',
                    'url': video_url,
                    'format_id': 'hd',
                    'vcodec': 'h264',
                }]
            }

        return await asyncio.to_thread(_sync_tikwm)
        
    except Exception as e:
        logger.error(f"TikWM scraping failed: {str(e)}")
        return None

async def scrape_tiktok_video_async(url: str) -> Dict[str, Any]:
    """
    Main entry point - Optimized Race Strategy
    Runs both scrapers in parallel and returns the first success
    """
    logger.info("Starting optimized parallel scraping...")
    
    # Create tasks for both methods
    task1 = asyncio.create_task(scrape_tiktok_ssstik(url))
    task2 = asyncio.create_task(scrape_tiktok_tikwm(url))
    
    pending = {task1, task2}
    
    while pending:
        # Wait for the first one to complete
        done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
        
        for task in done:
            result = task.result()
            if result and result.get('status') == 'success':
                # Cancel remaining tasks to save resources
                for p in pending:
                    p.cancel()
                logger.info("One scraper succeeded, returning result instantly.")
                return result
                
    raise Exception("All TikTok scraping methods failed")

def scrape_tiktok_video(url: str) -> Dict[str, Any]:
    """Sync wrapper for compatibility"""
    return asyncio.run(scrape_tiktok_video_async(url))

if __name__ == "__main__":
    import sys
    test_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.tiktok.com/@zachking/video/6749520869598481669"
    import time
    start = time.time()
    try:
        result = scrape_tiktok_video(test_url)
        print(f"Success in {time.time() - start:.2f}s")
        print(f"Title: {result['title'][:50]}...")
    except Exception as e:
        print(f"Error: {e}")
