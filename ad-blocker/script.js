// ===== المتغيرات العامة =====
let stats = {
    adsBlocked: 0,
    trackersBlocked: 0,
    dataSaved: 0,
    timeSaved: 0
};

let settings = {
    blockAds: true,
    blockTrackers: true,
    blockPopups: true,
    blockMining: true
};

let whitelist = [];
let blockedItems = [];

// ===== قوائم النطاقات المحجوبة =====
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
    'ads.linkedin.com'
];

const TRACKER_DOMAINS = [
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
    'plausible.io',
    'heap.io'
];

const MINING_DOMAINS = [
    'coinhive.com',
    'coin-hive.com',
    'jsecoin.com',
    'authedmine.com',
    'ppoi.org',
    'gridcash.net',
    'crypto-loot.com',
    'cryptaloot.pro',
    'webmine.cz',
    'minero.cc'
];

// ===== تهيئة الصفحة =====
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadWhitelist();
    setupEventListeners();
    updateStatsDisplay();
    generateAdBlockCode();
    startSimulation();
});

// ===== تحميل الإعدادات =====
function loadSettings() {
    const savedSettings = localStorage.getItem('adBlockerSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        document.getElementById('blockAds').checked = settings.blockAds;
        document.getElementById('blockTrackers').checked = settings.blockTrackers;
        document.getElementById('blockPopups').checked = settings.blockPopups;
        document.getElementById('blockMining').checked = settings.blockMining;
    }

    const savedStats = localStorage.getItem('adBlockerStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

// ===== حفظ الإعدادات =====
function saveSettings() {
    localStorage.setItem('adBlockerSettings', JSON.stringify(settings));
    localStorage.setItem('adBlockerStats', JSON.stringify(stats));
}

// ===== تحميل القائمة البيضاء =====
function loadWhitelist() {
    const saved = localStorage.getItem('adBlockerWhitelist');
    if (saved) {
        whitelist = JSON.parse(saved);
        renderWhitelist();
    }
}

// ===== إعداد مستمعي الأحداث =====
function setupEventListeners() {
    // أزرار التبديل
    ['blockAds', 'blockTrackers', 'blockPopups', 'blockMining'].forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            settings[id] = e.target.checked;
            saveSettings();
        });
    });

    // زر إضافة القائمة البيضاء
    document.getElementById('addWhitelist').addEventListener('click', addToWhitelist);
    document.getElementById('whitelistInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addToWhitelist();
    });

    // تبويبات الفلتر
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            filterBlockedItems(e.target.dataset.filter);
        });
    });
}

// ===== إضافة للقائمة البيضاء =====
function addToWhitelist() {
    const input = document.getElementById('whitelistInput');
    const url = input.value.trim();
    
    if (url && !whitelist.includes(url)) {
        whitelist.push(url);
        localStorage.setItem('adBlockerWhitelist', JSON.stringify(whitelist));
        renderWhitelist();
        input.value = '';
    }
}

// ===== عرض القائمة البيضاء =====
function renderWhitelist() {
    const container = document.getElementById('whitelistContainer');
    container.innerHTML = whitelist.map(url => `
        <div class="whitelist-item">
            <span>✅ ${url}</span>
            <button class="remove-btn" onclick="removeFromWhitelist('${url}')">×</button>
        </div>
    `).join('');
}

// ===== حذف من القائمة البيضاء =====
function removeFromWhitelist(url) {
    whitelist = whitelist.filter(u => u !== url);
    localStorage.setItem('adBlockerWhitelist', JSON.stringify(whitelist));
    renderWhitelist();
}

// ===== تحديث عرض الإحصائيات =====
function updateStatsDisplay() {
    document.getElementById('adsBlocked').textContent = stats.adsBlocked.toLocaleString();
    document.getElementById('trackersBlocked').textContent = stats.trackersBlocked.toLocaleString();
    document.getElementById('dataSaved').textContent = stats.dataSaved.toFixed(1);
    document.getElementById('timeSaved').textContent = stats.timeSaved;
}

// ===== محاكاة حجب الإعلانات =====
function startSimulation() {
    // محاكاة حجب إعلانات كل ثانيتين
    setInterval(() => {
        if (settings.blockAds && Math.random() > 0.3) {
            const domains = AD_DOMAINS;
            const randomDomain = domains[Math.floor(Math.random() * domains.length)];
            blockItem('ads', randomDomain);
        }
    }, 2000);

    // محاكاة حجب متتبعات
    setInterval(() => {
        if (settings.blockTrackers && Math.random() > 0.5) {
            const domains = TRACKER_DOMAINS;
            const randomDomain = domains[Math.floor(Math.random() * domains.length)];
            blockItem('trackers', randomDomain);
        }
    }, 3000);

    // محاكاة حجب نوافذ منبثقة
    setInterval(() => {
        if (settings.blockPopups && Math.random() > 0.7) {
            blockItem('popups', 'popup-window-detected');
        }
    }, 5000);
}

// ===== حجب عنصر =====
function blockItem(type, url) {
    stats[`${type}Blocked`]++;
    stats.dataSaved += Math.random() * 0.5;
    stats.timeSaved += Math.floor(Math.random() * 3);
    
    const item = {
        type,
        url,
        time: new Date().toLocaleTimeString('ar-SA')
    };
    
    blockedItems.unshift(item);
    
    // حفظ آخر 100 عنصر فقط
    if (blockedItems.length > 100) {
        blockedItems = blockedItems.slice(0, 100);
    }
    
    updateStatsDisplay();
    renderBlockedItems();
    saveSettings();
    
    // تأثير بصري
    animateStatCard(type);
}

// ===== تأثير بصري للإحصائيات =====
function animateStatCard(type) {
    const cards = document.querySelectorAll('.stat-card');
    const index = type === 'ads' ? 0 : type === 'trackers' ? 1 : -1;
    
    if (index >= 0 && cards[index]) {
        cards[index].style.transform = 'scale(1.1)';
        setTimeout(() => {
            cards[index].style.transform = 'scale(1)';
        }, 200);
    }
}

// ===== عرض العناصر المحجوبة =====
function renderBlockedItems(filter = 'all') {
    const container = document.getElementById('blockedLog');
    const filtered = filter === 'all' 
        ? blockedItems 
        : blockedItems.filter(item => item.type === filter);
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🎉</span>
                <p>لا توجد عناصر محجوبة حالياً</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.slice(0, 50).map(item => `
        <div class="blocked-item">
            <div class="blocked-item-info">
                <span class="blocked-type ${item.type}">${getTypeLabel(item.type)}</span>
                <span class="blocked-url">${item.url}</span>
            </div>
            <span style="color: var(--text-secondary); font-size: 12px;">${item.time}</span>
        </div>
    `).join('');
}

// ===== تصفية العناصر المحجوبة =====
function filterBlockedItems(filter) {
    renderBlockedItems(filter);
}

// ===== الحصول على تسمية النوع =====
function getTypeLabel(type) {
    const labels = {
        ads: 'إعلان',
        trackers: 'متتبع',
        popups: 'نافذة منبثقة',
        mining: 'تعدين'
    };
    return labels[type] || type;
}

// ===== توليد كود الحجب =====
function generateAdBlockCode() {
    const code = `// 🛡️ حاصد الإعلانات - انسخ هذا الكود في Console المتصفح
(function() {
    'use strict';
    
    // قائمة النطاقات المحجوبة
    const BLOCKED_DOMAINS = [
        ${AD_DOMAINS.map(d => `'${d}'`).join(',\n        ')}
    ];
    
    const TRACKER_DOMAINS = [
        ${TRACKER_DOMAINS.map(d => `'${d}'`).join(',\n        ')}
    ];
    
    // حجب الطلبات
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0]?.url || args[0];
        if (shouldBlock(url)) {
            console.log('🚫 Blocked:', url);
            return Promise.resolve(new Response('', {status: 200}));
        }
        return originalFetch.apply(this, args);
    };
    
    // حجب XMLHttpRequest
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (shouldBlock(url)) {
            console.log('🚫 Blocked XHR:', url);
            this.abort();
            return;
        }
        return originalXHR.apply(this, [method, url, ...args]);
    };
    
    function shouldBlock(url) {
        if (!url) return false;
        const urlStr = url.toString().toLowerCase();
        return [...BLOCKED_DOMAINS, ...TRACKER_DOMAINS].some(domain => 
            urlStr.includes(domain.toLowerCase())
        );
    }
    
    // حجب العناصر المعروفة
    function blockElements() {
        const selectors = [
            '[class*="ad-"]', '[class*="ad_"]', '[class*="ads-"]',
            '[id*="ad-"]', '[id*="ad_"]', '[id*="ads-"]',
            '[class*="banner"]', '[class*="sponsor"]',
            'iframe[src*="ad"]', 'iframe[src*="banner"]',
            '[data-ad]', '[data-ads]', '.adsbygoogle'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
                console.log('🚫 Hidden element:', el);
            });
        });
    }
    
    // تشغيل الحجب
    blockElements();
    setInterval(blockElements, 2000);
    
    // مراقبة DOM للمحتوى الجديد
    const observer = new MutationObserver(blockElements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('🛡️ تم تفعيل حاصد الإعلانات بنجاح!');
})();`;
    
    document.getElementById('adBlockCode').textContent = code;
}

// ===== نسخ الكود =====
function copyCode() {
    const code = document.getElementById('adBlockCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = '✅ تم النسخ!';
        setTimeout(() => {
            btn.textContent = '📋 نسخ';
        }, 2000);
    });
}

// ===== تثبيت الإضافة =====
function installExtension(browser) {
    const urls = {
        chrome: 'https://chrome.google.com/webstore/detail/ad-blocker',
        firefox: 'https://addons.mozilla.org/firefox/addon/ad-blocker',
        edge: 'https://microsoftedge.microsoft.com/addons/detail/ad-blocker'
    };
    
    // في الواقع، سنوجه المستخدم لصفحة التثبيت
    alert(`سيتم توجيهك إلى صفحة تثبيت الإضافة على ${browser}`);
    // window.open(urls[browser], '_blank');
}

// ===== إنشاء البوكليت =====
function createBookmarklet() {
    const code = `javascript:(function(){
        var s=document.createElement('script');
        s.src='data:text/javascript,'+encodeURIComponent('(${generateAdBlockCode.toString()})()');
        document.head.appendChild(s);
    })()`;
    
    document.getElementById('bookmarklet').href = code;
}

// ===== تشغيل عند التحميل =====
window.addEventListener('load', createBookmarklet);