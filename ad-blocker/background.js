// قائمة النطاقات المحجوبة
const AD_DOMAINS = [
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'adservice.google.com',
    'pagead2.googlesyndication.com',
    'facebook.com/tr',
    'analytics.google.com',
    'ads.yahoo.com',
    'adnxs.com',
    'adskeeper.com',
    'taboola.com',
    'outbrain.com',
    'mgid.com',
    'propellerads.com',
    'popads.net',
    'popcash.net',
    'exoclick.com',
    'trafficjunky.com',
    'juicyads.com',
    'adsterra.com',
    'media.net',
    'amazon-adsystem.com',
    'ads-twitter.com',
    'ads.linkedin.com',
    'google-analytics.com',
    'hotjar.com',
    'mixpanel.com',
    'amplitude.com',
    'segment.com',
    'fullstory.com',
    'crazyegg.com',
    'mouseflow.com',
    'clarity.ms',
    'matomo.org',
    'coinhive.com',
    'coin-hive.com',
    'jsecoin.com',
    'authedmine.com'
];

// إحصائيات
let stats = {
    adsBlocked: 0,
    trackersBlocked: 0
};

// حجب الطلبات
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = details.url.toLowerCase();
        
        const shouldBlock = AD_DOMAINS.some(domain => 
            url.includes(domain.toLowerCase())
        );
        
        if (shouldBlock) {
            stats.adsBlocked++;
            updateBadge();
            
            // حفظ الإحصائيات
            chrome.storage.local.set({ stats: stats });
            
            return { cancel: true };
        }
        
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// تحديث شارة الإضافة
function updateBadge() {
    const total = stats.adsBlocked + stats.trackersBlocked;
    chrome.action.setBadgeText({ 
        text: total > 999 ? '999+' : total.toString() 
    });
    chrome.action.setBadgeBackgroundColor({ color: '#ff6b6b' });
}

// استقبال الرسائل من content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getStats') {
        sendResponse(stats);
    } else if (request.type === 'blockItem') {
        stats.adsBlocked++;
        updateBadge();
        chrome.storage.local.set({ stats: stats });
        sendResponse({ success: true });
    }
    return true;
});

// تحميل الإحصائيات المحفوظة
chrome.storage.local.get(['stats'], function(result) {
    if (result.stats) {
        stats = result.stats;
        updateBadge();
    }
});