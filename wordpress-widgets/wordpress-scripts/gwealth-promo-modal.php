<?php
/**
 * Title: GWealth Premium Promo Modal
 * Description: Fetches the currently active advertisement from the MERN backend and injects a beautifully animated glassmorphism modal overlay.
 * Setup: Add as a new snippet in WPCode, set Code Type to "PHP Snippet", and choose "Run Everywhere".
 */

// Prevent direct execution outside of WordPress core
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action('wp_footer', function() {
    // Only show on frontend, not in wp-admin
    if ( is_admin() ) return;
    ?>
    <style>
        /* GWealth Premium Modal CSS Tokens */
        #gw-promo-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.6); /* Slate 900 with opacity */
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        #gw-promo-modal-overlay.gw-active {
            opacity: 1;
            visibility: visible;
        }

        .gw-promo-modal-content {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset;
            width: 100%;
            max-width: 600px;
            position: relative;
            transform: scale(0.95) translateY(20px);
            opacity: 0;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        #gw-promo-modal-overlay.gw-active .gw-promo-modal-content {
            transform: scale(1) translateY(0);
            opacity: 1;
            transition-delay: 0.1s;
        }

        .gw-promo-close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            font-size: 18px;
            transition: background 0.2s ease, transform 0.2s ease;
            backdrop-filter: blur(4px);
        }

        .gw-promo-close-btn:hover {
            background: rgba(0,0,0,0.8);
            transform: scale(1.1);
        }

        .gw-promo-flyer-img {
            width: 100%;
            height: auto;
            max-height: 70vh;
            object-fit: contain;
            background: #0f172a;
            display: block;
        }

        .gw-promo-footer {
            padding: 20px;
            text-align: center;
            background: white;
            border-top: 1px solid #e2e8f0;
        }

        .gw-promo-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 15px 0;
        }

        .gw-promo-cta {
            display: inline-block;
            background: #2563eb; /* Primary Blue */
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.9rem;
            transition: background 0.2s ease, transform 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }

        .gw-promo-cta:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
            color: white;
        }
    </style>

    <div id="gw-promo-modal-overlay">
        <div class="gw-promo-modal-content">
            <button class="gw-promo-close-btn" id="gw-promo-close" aria-label="Close Advertisement">&times;</button>
            <img src="" alt="Advertisement Flyer" class="gw-promo-flyer-img" id="gw-promo-img">
            <div class="gw-promo-footer">
                <h3 class="gw-promo-title" id="gw-promo-title">Loading Special Offer...</h3>
                <a href="#" class="gw-promo-cta" id="gw-promo-link">Explore Now</a>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Wait a few seconds before popping up so the user can see the homepage first
            const POPUP_DELAY_MS = 2500; 

            // Only show once per session to avoid spamming
            if (sessionStorage.getItem('gw_promo_seen')) {
                return;
            }

            async function fetchAdvertisement() {
                try {
                    // Fallback to local if dev, otherwise use production
                    const apiUrl = window.GW_API_URL || 'https://api.gwealthrepublic.com';
                    
                    const response = await fetch(`${apiUrl}/api/advertisements/active`);
                    if (!response.ok) throw new Error("Promo API offline");
                    
                    const resData = await response.json();
                    const ad = resData.data;

                    if (ad && ad.isActive) {
                        // Populate modal data
                        document.getElementById('gw-promo-img').src = ad.imageUrl;
                        document.getElementById('gw-promo-img').alt = ad.title;
                        document.getElementById('gw-promo-title').innerText = ad.title;
                        
                        const ctaBtn = document.getElementById('gw-promo-link');
                        if (ad.actionUrl) {
                            ctaBtn.href = ad.actionUrl;
                            ctaBtn.style.display = 'inline-block';
                        } else {
                            // If no link, hide the button
                            ctaBtn.style.display = 'none';
                        }

                        // Trigger animation after delay
                        setTimeout(() => {
                            document.getElementById('gw-promo-modal-overlay').classList.add('gw-active');
                            sessionStorage.setItem('gw_promo_seen', 'true');
                        }, POPUP_DELAY_MS);
                    }
                } catch (error) {
                    console.warn("GWealth Promo Engine: No active advertisements found or API unreachable.");
                }
            }

            // Close mechanics
            const overlay = document.getElementById('gw-promo-modal-overlay');
            const closeBtn = document.getElementById('gw-promo-close');

            function closeModal() {
                overlay.classList.remove('gw-active');
            }

            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal(); // Close if clicked outside the content box
            });

            // Initialize
            fetchAdvertisement();
        });
    </script>
    <?php
});
