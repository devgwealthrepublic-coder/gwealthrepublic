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
        /* GWealth Ultra-Premium Modal CSS Tokens */
        #gw-promo-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.85); /* Deep slate blur */
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.5s ease, visibility 0.5s ease;
            font-family: 'Inter', sans-serif;
        }

        #gw-promo-modal-overlay.gw-active {
            opacity: 1;
            visibility: visible;
        }

        .gw-promo-modal-content {
            background: linear-gradient(145deg, #1E1B4B 0%, #0B0A1C 100%);
            border-radius: 20px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.2) inset;
            width: 100%;
            max-width: 500px;
            position: relative;
            transform: scale(0.9) translateY(30px);
            opacity: 0;
            transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        #gw-promo-modal-overlay.gw-active .gw-promo-modal-content {
            transform: scale(1) translateY(0);
            opacity: 1;
            transition-delay: 0.15s;
        }

        .gw-promo-close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255, 255, 255, 0.1);
            color: #D4AF37;
            border: 1px solid rgba(212, 175, 55, 0.3);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            font-size: 20px;
            transition: all 0.3s ease;
            backdrop-filter: blur(4px);
        }

        .gw-promo-close-btn:hover {
            background: #D4AF37;
            color: #1E1B4B;
            transform: rotate(90deg);
        }

        .gw-promo-image-wrapper {
            width: 100%;
            position: relative;
        }

        .gw-promo-flyer-img {
            width: 100%;
            height: auto;
            max-height: 60vh;
            object-fit: cover;
            display: block;
            border-bottom: 2px solid #D4AF37;
        }

        .gw-promo-footer {
            padding: 32px 24px;
            text-align: center;
            position: relative;
            z-index: 2;
        }

        .gw-promo-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .gw-promo-subtitle {
            font-size: 0.95rem;
            color: #A0AEC0;
            margin-bottom: 24px;
        }

        .gw-promo-cta {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37 0%, #AA8A2A 100%);
            color: #1E1B4B;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 50px;
            font-weight: 800;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
            border: 2px solid transparent;
        }

        .gw-promo-cta:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 25px rgba(212, 175, 55, 0.4);
            background: transparent;
            border-color: #D4AF37;
            color: #D4AF37;
        }
    </style>

    <div id="gw-promo-modal-overlay">
        <div class="gw-promo-modal-content">
            <button class="gw-promo-close-btn" id="gw-promo-close" aria-label="Close">&times;</button>
            <div class="gw-promo-image-wrapper">
                <img src="" alt="Premium Real Estate Offer" class="gw-promo-flyer-img" id="gw-promo-img">
            </div>
            <div class="gw-promo-footer">
                <h3 class="gw-promo-title" id="gw-promo-title">Loading Offer...</h3>
                <p class="gw-promo-subtitle">Exclusive opportunity for GWealth investors.</p>
                <a href="#" class="gw-promo-cta" id="gw-promo-link">Claim Offer Now</a>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Wait a few seconds before popping up so the user can see the homepage first
            const POPUP_DELAY_MS = 2500; 

            // Check for test mode
            const urlParams = new URLSearchParams(window.location.search);
            const isTestMode = urlParams.has('test_promo');

            // Only show once per session to avoid spamming
            if (!isTestMode && sessionStorage.getItem('gw_promo_seen')) {
                return;
            }

            async function fetchAdvertisement() {
                try {
                    // Dynamically determine the backend URL based on environment
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('.local');
                    const defaultApiUrl = isLocal ? 'http://localhost:5000/api' : 'https://gwealth-backend.onrender.com/api';
                    const apiUrl = window.GW_API_URL || defaultApiUrl;
                    
                    const response = await fetch(`${apiUrl}/advertisements/active`);
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
