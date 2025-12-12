#!/usr/bin/env python3
"""
Advanced scraping with Playwright and Selenium
"""

import os
import sys
import time

def method_playwright():
    """Use Playwright to render JavaScript and bypass Cloudflare"""
    print("=" * 60)
    print("METHOD: Playwright with Stealth")
    print("=" * 60)
    
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            # Launch browser with specific options
            browser = p.chromium.launch(
                headless=True,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ]
            )
            
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            page = context.new_page()
            
            # Set extra headers
            page.set_extra_http_headers({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            })
            
            print("Navigating to lumentree.net...")
            try:
                response = page.goto('https://lumentree.net/', wait_until='networkidle', timeout=30000)
                print(f"Status: {response.status}")
                
                # Wait for any cloudflare challenge
                time.sleep(5)
                
                # Get content
                content = page.content()
                
                print(f"Content length: {len(content)}")
                
                # Save to file
                with open('/tmp/lumentree_playwright.html', 'w', encoding='utf-8') as f:
                    f.write(content)
                print("✅ Saved to: /tmp/lumentree_playwright.html")
                
                # Take screenshot
                page.screenshot(path='/tmp/lumentree_screenshot.png', full_page=True)
                print("✅ Screenshot saved to: /tmp/lumentree_screenshot.png")
                
                # Check if blocked
                if 'cloudflare' in content.lower() and 'blocked' in content.lower():
                    print("❌ Still blocked by Cloudflare")
                    return False
                else:
                    print("✅ Successfully bypassed!")
                    return True
                    
            except Exception as e:
                print(f"❌ Navigation error: {str(e)}")
                return False
            finally:
                browser.close()
                
    except ImportError:
        print("❌ Playwright not installed. Installing...")
        os.system('pip install playwright && playwright install chromium')
        print("Please run script again after installation.")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def method_selenium_undetected():
    """Use undetected-chromedriver"""
    print("\n" + "=" * 60)
    print("METHOD: Selenium Undetected ChromeDriver")
    print("=" * 60)
    
    try:
        import undetected_chromedriver as uc
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        options = uc.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        
        print("Starting undetected Chrome...")
        driver = uc.Chrome(options=options, version_main=None)
        
        try:
            print("Loading lumentree.net...")
            driver.get('https://lumentree.net/')
            
            # Wait for page load
            time.sleep(10)  # Give time for Cloudflare check
            
            # Get page source
            content = driver.page_source
            
            print(f"Content length: {len(content)}")
            
            # Save
            with open('/tmp/lumentree_selenium.html', 'w', encoding='utf-8') as f:
                f.write(content)
            print("✅ Saved to: /tmp/lumentree_selenium.html")
            
            # Screenshot
            driver.save_screenshot('/tmp/lumentree_selenium_screenshot.png')
            print("✅ Screenshot saved")
            
            # Check title
            title = driver.title
            print(f"Page title: {title}")
            
            if 'cloudflare' in content.lower() and 'blocked' in content.lower():
                print("❌ Still blocked")
                return False
            else:
                print("✅ Success!")
                return True
                
        finally:
            driver.quit()
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def analyze_railway_dashboard():
    """Analyze the working Railway dashboard instead"""
    print("\n" + "=" * 60)
    print("ALTERNATIVE: Analyze Working Railway Dashboard")
    print("=" * 60)
    
    import requests
    from bs4 import BeautifulSoup
    
    url = 'https://solar-monitor-dashboard-production.up.railway.app/'
    
    try:
        print(f"Fetching: {url}")
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ Status: {response.status_code}")
            print(f"Content length: {len(response.text)}")
            
            # Save
            with open('/tmp/railway_dashboard.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("✅ Saved to: /tmp/railway_dashboard.html")
            
            # Parse
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract info
            print("\n" + "=" * 60)
            print("DASHBOARD ANALYSIS:")
            print("=" * 60)
            
            title = soup.find('title')
            if title:
                print(f"Title: {title.get_text()}")
            
            # Find scripts
            scripts = soup.find_all('script')
            print(f"\nScript tags: {len(scripts)}")
            for i, script in enumerate(scripts[:5]):
                src = script.get('src', 'inline')
                print(f"  {i+1}. {src}")
            
            # Find stylesheets
            styles = soup.find_all('link', rel='stylesheet')
            print(f"\nStylesheets: {len(styles)}")
            for style in styles:
                print(f"  - {style.get('href')}")
            
            # Find main content areas
            forms = soup.find_all('form')
            print(f"\nForms: {len(forms)}")
            
            inputs = soup.find_all('input')
            print(f"Inputs: {len(inputs)}")
            
            # Find chart canvases
            canvases = soup.find_all('canvas')
            print(f"Canvas elements (for charts): {len(canvases)}")
            
            return True
        else:
            print(f"❌ Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("🚀 Advanced Scraping Methods for Lumentree.net")
    print("=" * 60)
    
    # Try playwright first
    # success = method_playwright()
    
    # if not success:
    #     print("\nTrying Selenium Undetected...")
    #     success = method_selenium_undetected()
    
    # Alternative: analyze working Railway dashboard
    print("\nAnalyzing working Railway dashboard instead...")
    analyze_railway_dashboard()
    
    print("\n" + "=" * 60)
    print("FILES SAVED:")
    print("=" * 60)
    os.system('ls -lh /tmp/lumentree*.html /tmp/railway*.html 2>/dev/null')
    os.system('ls -lh /tmp/lumentree*.png 2>/dev/null')

if __name__ == '__main__':
    main()
