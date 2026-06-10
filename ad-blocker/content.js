// 🛡️ حاصد الإعلانات - Content Script

(function() {
    'use strict';
    
    // أنماط عناصر الإعلانات
    const AD_SELECTORS = [
        // أنماط شائعة للإعلانات
        '[class*="ad-"]',
        '[class*="ad_"]',
        '[class*="ads-"]',
        '[class*="ads_"]',
        '[class*="advert"]',
        '[class*="banner"]',
        '[class*="sponsor"]',
        '[id*="ad-"]',
        '[id*="ad_"]',
        '[id*="ads-"]',
        '[id*="ads_"]',
        '[id*="advert"]',
        '[id*="banner"]',
        '[id*="sponsor"]',
        
        // Google Ads
        '.adsbygoogle',
        '[data-ad-client]',
        '[data-ad-slot]',
        'ins.adsbygoogle',
        
        // إطارات الإعلانات
        'iframe[src*="ad"]',
        'iframe[src*="banner"]',
        'iframe[src*="sponsor"]',
        'iframe[src*="doubleclick"]',
        'iframe[src*="googlesyndication"]',
        'iframe[src*="googleadservices"]',
        
        // عناصر أخرى
        '[data-ad]',
        '[data-ads]',
        '[data-adunit]',
        '.ad-container',
        '.ad-wrapper',
        '.ad-unit',
        '.advertisement',
        '.sponsored-content',
        '.promoted-content'
    ];
    
    // حجب العناصر
    function blockElements() {
        let blocked = 0;
        
        AD_SELECTORS.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (el.style.display !== 'none') {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.height = '0';
                        el.style.overflow = 'hidden';
                        blocked++;
                    }
                });
            } catch (e) {
                // تجاهل الأخطاء
            }
        });
        
        // إرسال إحصائيات للخلفية
        if (blocked > 0) {
            chrome.runtime.sendMessage({ 
                type: 'blockItem', 
                count: blocked 
            });
        }
        
        return blocked;
    }
    
    // حجب النوافذ المنبثقة
    function blockPopups() {
        // حجب window.open
        const originalOpen = window.open;
        window.open = function(...args) {
            console.log('🚫 Blocked popup:', args[0]);
            chrome.runtime.sendMessage({ type: 'blockItem' });
            return null;
        };
        
        // حجب beforeunload
        window.addEventListener('beforeunload', function(e) {
            if (document.querySelector('[class*="popup"]') || 
                document.querySelector('[class*="modal-ad"]')) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    // حجب تعدين العملات
    function blockMining() {
        const miningScripts = [
            'coinhive.com',
            'coin-hive.com',
            'jsecoin.com',
            'authedmine.com',
            'ppoi.org',
            'gridcash.net',
            'crypto-loot.com',
            'cryptaloot.pro'
        ];
        
        // مراقبة العناصر المضافة
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'SCRIPT') {
                        const src = node.src || '';
                        const isMining = miningScripts.some(domain => 
                            src.toLowerCase().includes(domain)
                        );
                        
                        if (isMining) {
                            node.remove();
                            console.log('🚫 Blocked mining script:', src);
                            chrome.runtime.sendMessage({ type: 'blockItem' });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
    
    // تشغيل الحجب
    function init() {
        blockElements();
        blockPopups();
        blockMining();
        
        // مراقبة DOM للمحتوى الجديد
        const domObserver = new MutationObserver(() => {
            blockElements();
        });
        
        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // حجب دوري
        setInterval(blockElements, 3000);
    }
    
    // بدء التنفيذ
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('🛡️ Ad Blocker Content Script Loaded');
})();