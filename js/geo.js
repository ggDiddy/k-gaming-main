/* ============================================================
   KONCEPT GAMING — GEO DETECTION
   Detects CA / DE and shows geo-targeted banner
   ============================================================ */

(function () {
    'use strict';

    const GEO_KEY = 'kg_geo_dismissed';
    const GEO_CACHE_KEY = 'kg_geo_country';
    const GEO_CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

    const GEO_CONFIG = {
        CA: {
            flag: '🍁',
            label: 'Canadian Player Detected',
            sub: 'We have exclusive offers in CAD with Interac deposits just for you!',
            btnText: 'View CA Offers',
            btnHref: 'pages/ca-offers.html',
            btnColor: '#cc0000',
            accentColor: '#cc0000',
        },
        DE: {
            flag: '🇩🇪',
            label: 'Deutschen Spieler erkannt',
            sub: 'Wir haben exklusive Angebote in EUR mit Sofort-Zahlung für Sie!',
            btnText: 'DE Angebote anzeigen',
            btnHref: 'pages/de-offers.html',
            btnColor: '#cc0000',
            accentColor: '#f39c12',
        },
    };

    // Resolve path prefix depending on current page depth
    function resolvePath(href) {
        const depth = (window.location.pathname.match(/\//g) || []).length;
        // If we're in /pages/ subfolder, go up one level
        if (window.location.pathname.includes('/pages/')) {
            return '../' + href.replace('pages/', '');
        }
        return href;
    }

    function getCached() {
        try {
            const raw = sessionStorage.getItem(GEO_CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.ts > GEO_CACHE_TTL) return null;
            return parsed.country;
        } catch (e) {
            return null;
        }
    }

    function setCache(country) {
        try {
            sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ country, ts: Date.now() }));
        } catch (e) { /* ignore */ }
    }

    function isDismissed() {
        return sessionStorage.getItem(GEO_KEY) === '1';
    }

    function dismiss() {
        sessionStorage.setItem(GEO_KEY, '1');
    }

    function createBanner(config, country) {
        if (isDismissed()) return;

        const existing = document.getElementById('kg-geo-banner');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.id = 'kg-geo-banner';
        bar.innerHTML = `
            <div class="kg-geo-inner">
                <span class="kg-geo-flag">${config.flag}</span>
                <div class="kg-geo-text">
                    <strong>${config.label}</strong>
                    <span>${config.sub}</span>
                </div>
                <a href="${resolvePath(config.btnHref)}" class="kg-geo-btn" style="background:${config.btnColor}">
                    ${config.btnText}
                </a>
                <button class="kg-geo-close" aria-label="Close" title="Dismiss">✕</button>
            </div>
        `;

        // Inject styles once
        if (!document.getElementById('kg-geo-style')) {
            const style = document.createElement('style');
            style.id = 'kg-geo-style';
            style.textContent = `
                #kg-geo-banner {
                    position: fixed;
                    bottom: 0; left: 0; right: 0;
                    z-index: 9999;
                    background: #0d0d0d;
                    border-top: 2px solid ${config.accentColor};
                    box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
                    transform: translateY(100%);
                    transition: transform 0.45s cubic-bezier(0.165,0.84,0.44,1);
                }
                #kg-geo-banner.kg-show {
                    transform: translateY(0);
                }
                .kg-geo-inner {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1.5rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    flex-wrap: wrap;
                }
                .kg-geo-flag {
                    font-size: 1.75rem;
                    flex-shrink: 0;
                }
                .kg-geo-text {
                    flex: 1;
                    min-width: 0;
                }
                .kg-geo-text strong {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.15rem;
                }
                .kg-geo-text span {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.55);
                    line-height: 1.4;
                }
                .kg-geo-btn {
                    display: inline-block;
                    padding: 0.6rem 1.4rem;
                    border-radius: 25px;
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-decoration: none;
                    white-space: nowrap;
                    flex-shrink: 0;
                    box-shadow: 0 4px 16px rgba(204,0,0,0.35);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kg-geo-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(204,0,0,0.5);
                }
                .kg-geo-close {
                    background: none;
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    color: rgba(255,255,255,0.5);
                    font-size: 0.75rem;
                    cursor: pointer;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    padding: 0;
                }
                .kg-geo-close:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-color: rgba(255,255,255,0.3);
                }
                @media (max-width: 600px) {
                    .kg-geo-text span { display: none; }
                    .kg-geo-inner { gap: 0.75rem; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(bar);

        // Animate in after short delay
        requestAnimationFrame(() => {
            setTimeout(() => bar.classList.add('kg-show'), 80);
        });

        bar.querySelector('.kg-geo-close').addEventListener('click', () => {
            bar.classList.remove('kg-show');
            dismiss();
            setTimeout(() => bar.remove(), 500);
        });

        // Auto-dismiss after 12s
        setTimeout(() => {
            if (bar.parentNode) {
                bar.classList.remove('kg-show');
                setTimeout(() => { if (bar.parentNode) bar.remove(); }, 500);
            }
        }, 12000);
    }

    function handleCountry(country) {
        setCache(country);
        const config = GEO_CONFIG[country];
        if (config) createBanner(config, country);
    }

    function detectByTimezone() {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (tz.startsWith('America/') && tz.includes('Toronto')) return 'CA';
            if (tz.startsWith('America/') && (tz.includes('Vancouver') || tz.includes('Edmonton') || tz.includes('Winnipeg') || tz.includes('Halifax'))) return 'CA';
            if (tz.startsWith('Europe/Berlin') || tz === 'Europe/Vienna' || tz === 'Europe/Zurich') return 'DE';
        } catch (e) { /* */ }
        return null;
    }

    function init() {
        // If already on a geo page, do nothing
        const path = window.location.pathname;
        if (path.includes('ca-offers') || path.includes('de-offers')) return;

        // Check cache first
        const cached = getCached();
        if (cached) {
            handleCountry(cached);
            return;
        }

        // Try timezone heuristic first (no network request)
        const tzCountry = detectByTimezone();
        if (tzCountry) {
            handleCountry(tzCountry);
            return;
        }

        // Fallback: IP geolocation API
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        fetch('https://ipapi.co/json/', { signal: controller.signal })
            .then((r) => r.json())
            .then((data) => {
                clearTimeout(timeout);
                const country = (data.country_code || '').toUpperCase();
                handleCountry(country);
            })
            .catch(() => {
                clearTimeout(timeout);
                // Silent fail — no banner shown
            });
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
