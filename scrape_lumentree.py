#!/usr/bin/env python3
"""
Script to bypass Cloudflare and scrape lumentree.net
"""

import cloudscraper
import json
import sys
from bs4 import BeautifulSoup

def method_1_cloudscraper():
    """Method 1: Using cloudscraper library"""
    print("=" * 60)
    print("METHOD 1: CloudScraper")
    print("=" * 60)
    
    try:
        # Create a cloudscraper instance
        scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'desktop': True
            }
        )
        
        # Add headers to mimic real browser
        scraper.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        # Make request
        url = 'https://lumentree.net/'
        print(f"Fetching: {url}")
        response = scraper.get(url, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Content Length: {len(response.text)}")
        
        if response.status_code == 200:
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Save full HTML
            with open('/tmp/lumentree_full.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("✅ Saved full HTML to: /tmp/lumentree_full.html")
            
            # Extract useful info
            print("\n" + "=" * 60)
            print("EXTRACTED INFORMATION:")
            print("=" * 60)
            
            title = soup.find('title')
            if title:
                print(f"Title: {title.get_text()}")
            
            # Find all links
            links = soup.find_all('a', href=True)
            print(f"\nFound {len(links)} links:")
            for link in links[:10]:  # First 10 links
                print(f"  - {link.get('href')}: {link.get_text()[:50]}")
            
            # Find scripts
            scripts = soup.find_all('script', src=True)
            print(f"\nFound {len(scripts)} external scripts")
            
            # Find meta tags
            metas = soup.find_all('meta')
            print(f"\nMeta tags: {len(metas)}")
            for meta in metas[:5]:
                print(f"  - {meta.attrs}")
            
            return True
            
        else:
            print(f"❌ Failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def method_2_curl_impersonate():
    """Method 2: Using curl with browser impersonation"""
    print("\n" + "=" * 60)
    print("METHOD 2: curl-impersonate")
    print("=" * 60)
    
    import subprocess
    
    try:
        # Try using curl with various flags
        cmd = [
            'curl', '-s', '-L',
            '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            '-H', 'Accept-Language: en-US,en;q=0.9',
            '-H', 'Accept-Encoding: gzip, deflate, br',
            '-H', 'Connection: keep-alive',
            '-H', 'Upgrade-Insecure-Requests: 1',
            '-H', 'Sec-Fetch-Dest: document',
            '-H', 'Sec-Fetch-Mode: navigate',
            '-H', 'Sec-Fetch-Site: none',
            '--compressed',
            'https://lumentree.net/'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0 and len(result.stdout) > 1000:
            with open('/tmp/lumentree_curl.html', 'w', encoding='utf-8') as f:
                f.write(result.stdout)
            print("✅ Saved curl result to: /tmp/lumentree_curl.html")
            print(f"Content length: {len(result.stdout)}")
            return True
        else:
            print(f"❌ Failed: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def method_3_requests_session():
    """Method 3: Using requests with session and cookies"""
    print("\n" + "=" * 60)
    print("METHOD 3: Requests with Session")
    print("=" * 60)
    
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    
    try:
        session = requests.Session()
        
        # Setup retry strategy
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        
        # Headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        
        response = session.get('https://lumentree.net/', headers=headers, timeout=30)
        
        print(f"Status: {response.status_code}")
        print(f"Content Length: {len(response.text)}")
        
        if response.status_code == 200 and 'cloudflare' not in response.text.lower():
            with open('/tmp/lumentree_requests.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("✅ Saved to: /tmp/lumentree_requests.html")
            return True
        else:
            print(f"❌ Still blocked or error")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def analyze_alternative_urls():
    """Check alternative URLs that might work"""
    print("\n" + "=" * 60)
    print("METHOD 4: Alternative URLs")
    print("=" * 60)
    
    import requests
    
    urls = [
        'http://lumentree.net/',
        'https://www.lumentree.net/',
        'http://www.lumentree.net/',
        'https://lumentree.co/',
        'http://lumentree.co/',
    ]
    
    for url in urls:
        try:
            print(f"\nTrying: {url}")
            response = requests.get(url, timeout=10, allow_redirects=True)
            print(f"  Status: {response.status_code}")
            print(f"  Final URL: {response.url}")
            print(f"  Content Length: {len(response.text)}")
            
            if response.status_code == 200 and 'cloudflare' not in response.text.lower():
                filename = f"/tmp/lumentree_{url.replace('://', '_').replace('/', '_')}.html"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                print(f"  ✅ Saved to: {filename}")
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")

def main():
    print("🚀 Starting Lumentree.net Scraping Attempts")
    print("=" * 60)
    
    results = {
        'cloudscraper': False,
        'curl': False,
        'requests': False,
        'alternatives': False
    }
    
    # Try all methods
    results['cloudscraper'] = method_1_cloudscraper()
    results['curl'] = method_2_curl_impersonate()
    results['requests'] = method_3_requests_session()
    analyze_alternative_urls()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print("=" * 60)
    for method, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{method}: {status}")
    
    print("\n" + "=" * 60)
    print("Check saved files in /tmp/lumentree_*.html")
    print("=" * 60)

if __name__ == '__main__':
    main()
