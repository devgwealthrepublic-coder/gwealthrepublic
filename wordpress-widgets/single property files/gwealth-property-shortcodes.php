<?php

// Inject Tailwind CSS into the head of Single Property pages to ensure the MERN design renders perfectly
add_action('wp_head', 'gwealth_inject_tailwind_for_properties', 5);
function gwealth_inject_tailwind_for_properties() {
    if (is_singular('properties') || is_singular('property')) {
        ?>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script id="tailwind-config">
        try{
            tailwind.config = {
                darkMode: "class",
                theme: {
                extend: {
                    "colors": {
                            "primary": "#27267d",
                            "primary-container": "#3f3f95",
                            "on-primary-container": "#b2b2ff",
                            "trust-slate": "#E2E8F0",
                            "verified-gold": "#D4AF37",
                            "secondary": "#bb001b",
                            "surface": "#FAFAFA",
                            "on-surface": "#0b1c30",
                            "on-surface-variant": "#464651",
                            "error-container": "#ffdad6",
                            "error": "#ba1a1a",
                            "surface-container-low": "#eff4ff",
                            "surface-container": "#e5eeff"
                    },
                    "borderRadius": { "DEFAULT": "4px" },
                    "spacing": { "gutter": "24px", "container-max": "1280px" },
                    "fontFamily": {
                            "headline-md": ["Montserrat"],
                            "body-md": ["Inter"],
                            "body-lg": ["Inter"],
                            "label-sm": ["Inter"],
                            "display-lg": ["Montserrat"]
                    }
                }
                }
            }
        }catch(_e){}
        </script>
        <?php
    }
}

// 1. Media Gallery Shortcode
add_shortcode('gwealth_property_media', 'render_gwealth_property_media');
function render_gwealth_property_media() {
    // Fetch ACF Fields
    $featured_image = get_field('property_featured_image');
    $badge = get_field('property_badge');
    $status = get_field('property_status');
    $gallery = get_field('property_gallery'); // Array of Cloudinary URLs
    $video_embed = get_field('property_video_embed');
    
    // Fallback Image
    $main_img = $featured_image ? $featured_image : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200';

    ob_start();
    ?>
    <div id="gw-sp-media-gallery">
        <style>
            #gw-sp-media-gallery { width: 100%; font-family: 'Lexend', sans-serif; margin-bottom: 32px; }
            #gw-sp-media-gallery * { box-sizing: border-box; margin: 0; padding: 0; }
            #gw-sp-media-gallery .gw-main-viewport { position: relative; width: 100%; border-radius: 4px; overflow: hidden; background-color: #E2E8F0; margin-bottom: 16px; aspect-ratio: 16 / 9; }
            #gw-sp-media-gallery .gw-main-image { width: 100%; height: 100%; object-fit: cover; display: block; }
            #gw-sp-media-gallery .gw-badges { position: absolute; top: 16px; left: 16px; display: flex; gap: 8px; flex-wrap: wrap; z-index: 2; }
            #gw-sp-media-gallery .gw-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15); }
            #gw-sp-media-gallery .gw-badge-verified { background-color: #D4AF37; color: #1E1B4B; }
            #gw-sp-media-gallery .gw-badge-urgent { background-color: #bb001b; color: #FFFFFF; }
            #gw-sp-media-gallery .gw-walkthrough-trigger { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.9); padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 14px; color: #27267d; display: flex; align-items: center; gap: 10px; cursor: pointer; border: none; box-shadow: 0px 8px 24px rgba(30, 27, 75, 0.2); transition: all 0.3s; z-index: 2; }
            #gw-sp-media-gallery .gw-walkthrough-trigger:hover { background: #FFFFFF; transform: translate(-50%, -52%); color: #1E1B4B; }
            #gw-sp-media-gallery .gw-thumbnails-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            #gw-sp-media-gallery .gw-thumb-item { position: relative; width: 100%; aspect-ratio: 4 / 3; border-radius: 4px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color 0.3s ease; }
            #gw-sp-media-gallery .gw-thumb-item.active { border-color: #27267d; }
            #gw-sp-media-gallery .gw-thumb-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
            #gw-sp-media-gallery .gw-thumb-item:hover img { transform: scale(1.05); }
            @media (max-width: 480px) { #gw-sp-media-gallery .gw-thumbnails-row { gap: 8px; } #gw-sp-media-gallery .gw-walkthrough-trigger { padding: 10px 16px; font-size: 12px; } }
        </style>

        <div class="gw-main-viewport">
            <img id="gw-active-media" src="<?php echo esc_url($main_img); ?>" alt="Property View" class="gw-main-image">
            
            <div class="gw-badges">
                <?php if($badge): ?>
                    <span class="gw-badge gw-badge-verified"><i class="fa-solid fa-shield-halved"></i> <?php echo esc_html($badge); ?></span>
                <?php endif; ?>
                <?php if($status): ?>
                    <span class="gw-badge gw-badge-urgent"><?php echo esc_html($status); ?></span>
                <?php endif; ?>
            </div>

            <?php if($video_embed): ?>
                <button class="gw-walkthrough-trigger" onclick="window.open('<?php echo esc_url($video_embed); ?>', '_blank')">
                    <i class="fa-solid fa-video"></i> Drone Walkthrough
                </button>
            <?php endif; ?>
        </div>

        <?php if($gallery && is_array($gallery)): ?>
        <div class="gw-thumbnails-row">
            <?php 
            $count = 0;
            foreach($gallery as $img_url): 
                if($count >= 4) break; // Max 4 thumbs
                $active_class = ($count === 0) ? 'active' : '';
            ?>
                <div class="gw-thumb-item <?php echo $active_class; ?>" onclick="gwSwapMedia(this, '<?php echo esc_url($img_url); ?>')">
                    <img src="<?php echo esc_url($img_url); ?>" alt="Thumbnail <?php echo $count+1; ?>">
                </div>
            <?php 
                $count++;
            endforeach; 
            ?>
        </div>
        <?php endif; ?>

        <script>
            function gwSwapMedia(element, imageUrl) {
                const activeImg = document.getElementById('gw-active-media');
                if(!activeImg) return;
                activeImg.src = imageUrl;
                const allThumbs = document.querySelectorAll('#gw-sp-media-gallery .gw-thumb-item');
                allThumbs.forEach(thumb => thumb.classList.remove('active'));
                element.classList.add('active');
            }
        </script>
    </div>
    <?php
    return ob_get_clean();
}

// 2. Details Shortcode
add_shortcode('gwealth_property_details', 'render_gwealth_property_details');
function render_gwealth_property_details() {
    $title_type = get_field('property_title_type');
    $surveyor = get_field('property_surveyor_name');
    $gps = get_field('property_gps');
    $location = get_field('property_location');
    $status = get_field('property_status');
    $plots = get_field('property_plots_remaining');
    $size = get_field('property_size');

    ob_start();
    ?>
    <div id="gw-sp-details-content">
        <style>
            #gw-sp-details-content { width: 100%; font-family: 'Lexend', sans-serif; color: #4a5568; }
            #gw-sp-details-content * { box-sizing: border-box; margin: 0; padding: 0; }
            #gw-sp-details-content .gw-meta-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 48px; }
            @media (min-width: 640px) { #gw-sp-details-content .gw-meta-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } }
            #gw-sp-details-content .gw-meta-card { background-color: #FAFAFA; border: 1px solid #E2E8F0; border-radius: 4px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
            #gw-sp-details-content .gw-meta-title { font-size: 11px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }
            #gw-sp-details-content .gw-meta-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; color: #1E1B4B; display: flex; align-items: center; gap: 8px; }
            #gw-sp-details-content .gw-meta-sub { font-size: 11px; font-weight: 600; color: #D4AF37; display: flex; align-items: center; gap: 4px; }
            #gw-sp-details-content .gw-meta-sub.danger { color: #bb001b; }
            #gw-sp-details-content .gw-whatsapp-btn { background-color: #25D366; color: #FFFFFF; border: none; padding: 10px 16px; border-radius: 4px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; text-decoration: none; margin-top: 4px; }
            
            #gw-sp-details-content .gw-features-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin: 48px 0; }
            @media (min-width: 480px) { #gw-sp-details-content .gw-features-grid { grid-template-columns: repeat(2, 1fr); } }
            #gw-sp-details-content .gw-feature-item { display: flex; align-items: center; gap: 12px; border: 1px solid #E2E8F0; border-radius: 4px; padding: 16px; background-color: #FFFFFF; }
            #gw-sp-details-content .gw-feature-icon { color: #27267d; font-size: 16px; }
            #gw-sp-details-content .gw-feature-text { font-size: 13px; font-weight: 500; color: #464651; }

            #gw-sp-details-content .gw-trust-shield { background-color: #1E1B4B; border-radius: 4px; padding: 32px; color: #FFFFFF; }
            #gw-sp-details-content .gw-shield-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
            #gw-sp-details-content .gw-shield-icon { font-size: 28px; color: #D4AF37; }
            #gw-sp-details-content .gw-shield-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
            #gw-sp-details-content .gw-shield-sub { font-size: 12px; color: #A0AEC0; }
            #gw-sp-details-content .gw-shield-grid { display: grid; grid-template-columns: 1fr; gap: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 24px; }
            @media (min-width: 640px) { #gw-sp-details-content .gw-shield-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
            #gw-sp-details-content .gw-shield-col h5 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; color: #D4AF37; margin-bottom: 6px; }
            #gw-sp-details-content .gw-shield-col p { font-size: 11px; color: #E2E8F0; line-height: 1.5; }
        </style>

        <div class="gw-meta-grid">
            <div class="gw-meta-card">
                <span class="gw-meta-title">Survey Status</span>
                <div class="gw-meta-value"><i class="fa-solid fa-file-signature text-[#27267d]"></i> <?php echo esc_html($title_type); ?></div>
                <div class="gw-meta-sub"><i class="fa-regular fa-clock"></i> Surveyor: <?php echo esc_html($surveyor); ?></div>
            </div>
            
            <div class="gw-meta-card">
                <span class="gw-meta-title">GPS Coordinates</span>
                <div class="gw-meta-value"><i class="fa-solid fa-location-crosshairs text-[#27267d]"></i> <?php echo esc_html($gps); ?></div>
                <div class="gw-meta-sub" style="color: #718096;"><?php echo esc_html($location); ?> Region</div>
            </div>

            <div class="gw-meta-card" style="background-color: #f0fdf4; border-color: #bbf7d0;">
                <span class="gw-meta-title">Current Status</span>
                <div class="gw-meta-sub danger" style="margin-bottom: 4px;">
                    <i class="fa-solid fa-fire"></i> <?php echo esc_html($status); ?> (<?php echo esc_html($plots); ?> Plots Left)
                </div>
                <a href="https://wa.me/2340000000000" target="_blank" class="gw-whatsapp-btn">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp Hotline
                </a>
            </div>
        </div>

        <div class="gw-features-grid">
            <div class="gw-feature-item">
                <i class="fa-solid fa-expand gw-feature-icon"></i>
                <span class="gw-feature-text">Plot Size: <?php echo esc_html($size); ?></span>
            </div>
            <div class="gw-feature-item">
                <i class="fa-solid fa-file-contract gw-feature-icon"></i>
                <span class="gw-feature-text">100% C of O Global Process</span>
            </div>
            <div class="gw-feature-item">
                <i class="fa-solid fa-layer-group gw-feature-icon"></i>
                <span class="gw-feature-text">Dry, Table-flat Land</span>
            </div>
            <div class="gw-feature-item">
                <i class="fa-solid fa-shield-halved gw-feature-icon"></i>
                <span class="gw-feature-text">24/7 Gated Security Patrol</span>
            </div>
        </div>

        <div class="gw-trust-shield">
            <div class="gw-shield-header">
                <i class="fa-solid fa-shield-halved gw-shield-icon"></i>
                <div>
                    <h4 class="gw-shield-title">The GWealth Trust Shield</h4>
                    <p class="gw-shield-sub">Guaranteed legal protection for every plot owner.</p>
                </div>
            </div>
            <div class="gw-shield-grid">
                <div class="gw-shield-col">
                    <h5>Zero Hidden Fees</h5>
                    <p>The price you see covers primary paperwork and developmental levy.</p>
                </div>
                <div class="gw-shield-col">
                    <h5>C of O Priority</h5>
                    <p>Institutional processing of your individual Deed of Assignment.</p>
                </div>
                <div class="gw-shield-col">
                    <h5>Refund Policy</h5>
                    <p>Transparent refund structure if legal standards are not met.</p>
                </div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

// 3. Booking Form Shortcode
add_shortcode('gwealth_booking_form', 'render_gwealth_booking_form');
function render_gwealth_booking_form() {
    $property_title = get_the_title();
    ob_start();
    ?>
    
    <!-- Trigger Button -->
    <button id="gwOpenBookingBtn" class="gw-open-booking-modal-btn">
        <i class="fa-solid fa-calendar-check"></i> Book an Inspection
    </button>

    <!-- Modal Background -->
    <div id="gwBookingModalOverlay" class="gw-booking-modal-overlay">
        <!-- Modal Content -->
        <div id="gw-booking-widget" class="gw-booking-modal-content">
            <button id="gwCloseBookingBtn" class="gw-close-modal-btn">&times;</button>
            
            <style>
                /* Trigger Button Styles */
                .gw-open-booking-modal-btn {
                    background-color: #27267d;
                    color: #ffffff;
                    border: none;
                    padding: 14px 28px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 800;
                    font-size: 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(39, 38, 125, 0.3);
                }
                .gw-open-booking-modal-btn:hover {
                    background-color: #1e1d61;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(39, 38, 125, 0.4);
                }

                /* Modal Overlay Styles */
                .gw-booking-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                .gw-booking-modal-overlay.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                /* Close Button */
                .gw-close-modal-btn {
                    position: absolute;
                    top: 16px; right: 16px;
                    background: transparent;
                    border: none;
                    font-size: 28px;
                    color: #64748b;
                    cursor: pointer;
                    line-height: 1;
                    transition: color 0.2s;
                    z-index: 10;
                }
                .gw-close-modal-btn:hover { color: #bb001b; }

                /* Form Widget inside Modal */
                #gw-booking-widget { 
                    position: relative;
                    width: 90%; max-width: 500px;
                    font-family: 'Lexend', sans-serif; 
                    background-color: #ffffff; 
                    border-radius: 12px; 
                    padding: 32px; 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2); 
                    transform: translateY(20px);
                    transition: transform 0.3s ease;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .gw-booking-modal-overlay.active #gw-booking-widget {
                    transform: translateY(0);
                }

                #gw-booking-widget * { box-sizing: border-box; }
                #gw-booking-widget .gw-form-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; color: #1E1B4B; margin-bottom: 8px; }
                #gw-booking-widget .gw-form-subtitle { font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
                #gw-booking-widget .gw-form-group { margin-bottom: 16px; text-align: left; }
                #gw-booking-widget label { display: block; font-size: 13px; font-weight: 700; color: #1E1B4B; margin-bottom: 6px; }
                #gw-booking-widget input, #gw-booking-widget select { width: 100%; padding: 12px 16px; border: 1px solid #CBD5E0; border-radius: 6px; font-family: 'Lexend', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
                #gw-booking-widget input:focus, #gw-booking-widget select:focus { border-color: #27267d; box-shadow: 0 0 0 3px rgba(39, 38, 125, 0.1); }
                #gw-booking-widget .gw-submit-btn { width: 100%; background-color: #27267d; color: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 16px; padding: 16px; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; margin-top: 16px; }
                #gw-booking-widget .gw-submit-btn:hover { background-color: #1e1d61; }
                #gw-booking-widget .gw-form-message { margin-top: 16px; font-size: 14px; font-weight: 700; display: none; padding: 16px; border-radius: 6px; text-align: left; }
                #gw-booking-widget .gw-msg-success { background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; display: block; }
                #gw-booking-widget .gw-msg-error { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; display: block; }
            </style>

            <h4 class="gw-form-title">Book an Inspection</h4>
            <p class="gw-form-subtitle">Schedule a free site tour with our experts.</p>

            <form id="gwExcursionForm">
                <input type="hidden" id="gwReferralCode" name="referralCode" value="">

                <div class="gw-form-group">
                    <label for="gwProperty">Selected Property</label>
                    <input type="text" id="gwProperty" name="property" value="<?php echo esc_attr($property_title); ?>" readonly style="background-color: #f1f5f9; color: #64748b; font-weight: 700; cursor: not-allowed;">
                </div>

                <div class="gw-form-group">
                    <label for="gwName">Full Name</label>
                    <input type="text" id="gwName" name="clientName" placeholder="e.g. John Doe" required>
                </div>
                
                <div class="gw-form-group">
                    <label for="gwPhone">Phone Number (WhatsApp Active)</label>
                    <input type="tel" id="gwPhone" name="phone" placeholder="+234..." required>
                </div>

                <div class="gw-form-group">
                    <label for="gwBranch">Nearest GWealth Branch</label>
                    <select id="gwBranch" name="branch" required>
                        <option value="" disabled selected>Select Branch</option>
                        <option value="Aba">Aba</option>
                        <option value="Asaba">Asaba</option>
                        <option value="Port Harcourt">Port Harcourt</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Anambra">Anambra</option>
                    </select>
                </div>

                <div class="gw-form-group">
                    <label for="gwDate">Preferred Inspection Date</label>
                    <input type="date" id="gwDate" name="preferredDate" required>
                </div>

                <button type="submit" class="gw-submit-btn" id="gwSubmitBtn">Confirm Booking</button>
                <div id="gwFormMessage" class="gw-form-message"></div>
            </form>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 0. Modal Logic
            const openBtn = document.getElementById('gwOpenBookingBtn');
            const closeBtn = document.getElementById('gwCloseBookingBtn');
            const modal = document.getElementById('gwBookingModalOverlay');

            if (openBtn && modal) {
                openBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.classList.add('active');
                });
            }
            if (closeBtn && modal) {
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.classList.remove('active');
                });
            }
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                    }
                });
            }

            // 1. Referral Tracking Logic
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref');
            
            if (refCode) {
                localStorage.setItem('gwealth_referral', refCode);
            }
            
            const storedRef = localStorage.getItem('gwealth_referral');
            if (storedRef) {
                const refInput = document.getElementById('gwReferralCode');
                if(refInput) refInput.value = storedRef;
            }

            // 2. Form Submission Logic
            const form = document.getElementById('gwExcursionForm');
            const btn = document.getElementById('gwSubmitBtn');
            const msgBox = document.getElementById('gwFormMessage');

            if (form) {
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    // Reset UI
                    btn.disabled = true;
                    btn.innerText = 'Submitting...';
                    msgBox.className = 'gw-form-message';
                    msgBox.style.display = 'none';

                    // Gather Data
                    const formData = {
                        clientName: document.getElementById('gwName').value,
                        phone: document.getElementById('gwPhone').value,
                        branch: document.getElementById('gwBranch').value,
                        preferredDate: document.getElementById('gwDate').value,
                        property: document.getElementById('gwProperty').value,
                        referralCode: document.getElementById('gwReferralCode').value || null
                    };

                    try {
                        const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('.local');
                        const API_BASE_URL = isLocal ? 'http://localhost:5000' : 'https://gwealth-backend.onrender.com'; 
                        const API_URL = `${API_BASE_URL}/api/excursions`;
                        
                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                        });

                        const result = await response.json();

                        if (response.ok && result.success) {
                            msgBox.innerText = 'Inspection booked successfully! A coordinator will contact you shortly.';
                            msgBox.classList.add('gw-msg-success');
                            form.reset();
                            
                            // Auto close modal after 3 seconds
                            setTimeout(() => {
                                modal.classList.remove('active');
                            }, 3000);
                        } else {
                            throw new Error(result.message || 'Failed to book inspection');
                        }
                    } catch (error) {
                        msgBox.innerText = error.message;
                        msgBox.classList.add('gw-msg-error');
                    } finally {
                        btn.disabled = false;
                        btn.innerText = 'Confirm Booking';
                        msgBox.style.display = 'block';
                    }
                });
            }
        });
    </script>
    </script>
    <?php
    return ob_get_clean();
}

// 4. Promo/Flyer Slider Shortcode
add_shortcode('gwealth_promo_slider', 'render_gwealth_promo_slider');
function render_gwealth_promo_slider($atts) {
    // Determine the API URL
    $api_url = 'https://gwealth-backend.onrender.com/api/advertisements/active';
    if (in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1']) || strpos($_SERVER['HTTP_HOST'], '.local') !== false) {
        $api_url = 'http://localhost:5000/api/advertisements/active';
    }

    $response = wp_remote_get($api_url, array('timeout' => 5));
    if (is_wp_error($response)) {
        return ''; // Fail silently
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (!$data || !$data['success'] || empty($data['data'])) {
        return ''; // No active flyers
    }

    $flyers = $data['data'];

    // Enqueue Swiper CSS/JS if not already present
    wp_enqueue_style('swiper-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', array(), '11.0.0');
    wp_enqueue_script('swiper-js', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', array(), '11.0.0', true);

    ob_start();
    ?>
    <div class="gw-promo-slider-container">
        <style>
            .gw-promo-slider-container {
                width: 100%;
                max-width: 1280px;
                margin: 0 auto;
                padding: 20px 0;
            }
            .gw-flyer-swiper {
                width: 100%;
                height: auto;
                border-radius: 8px;
                overflow: hidden;
            }
            .gw-flyer-slide {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: transparent;
            }
            .gw-flyer-img {
                width: 100%;
                height: auto;
                max-height: 80vh;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .gw-flyer-link {
                display: block;
                width: 100%;
                text-decoration: none;
            }
            /* Swiper navigation colors */
            .gw-promo-slider-container .swiper-button-next,
            .gw-promo-slider-container .swiper-button-prev {
                color: #27267d;
                background: rgba(255,255,255,0.8);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .gw-promo-slider-container .swiper-button-next:after,
            .gw-promo-slider-container .swiper-button-prev:after {
                font-size: 18px;
            }
            .gw-promo-slider-container .swiper-pagination-bullet-active {
                background: #27267d;
            }
        </style>

        <div class="swiper gw-flyer-swiper">
            <div class="swiper-wrapper">
                <?php foreach ($flyers as $flyer): 
                    $img_url = esc_url($flyer['imageUrl']);
                    $action_url = !empty($flyer['actionUrl']) ? esc_url($flyer['actionUrl']) : '';
                    $title = esc_attr($flyer['title']);
                ?>
                    <div class="swiper-slide gw-flyer-slide">
                        <?php if ($action_url): ?>
                            <a href="<?php echo $action_url; ?>" class="gw-flyer-link" target="_blank" rel="noopener noreferrer">
                                <img src="<?php echo $img_url; ?>" alt="<?php echo $title; ?>" class="gw-flyer-img">
                            </a>
                        <?php else: ?>
                            <img src="<?php echo $img_url; ?>" alt="<?php echo $title; ?>" class="gw-flyer-img">
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <!-- Pagination and Navigation -->
            <div class="swiper-pagination"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Swiper when it's ready
            const initSwiper = () => {
                if (typeof Swiper === 'undefined') {
                    setTimeout(initSwiper, 100);
                    return;
                }
                new Swiper('.gw-flyer-swiper', {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    loop: true,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false,
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    effect: 'fade', // Gives a nice crossfade for flyers
                    fadeEffect: {
                        crossFade: true
                    }
                });
            };
            initSwiper();
        });
    </script>
    <?php
    return ob_get_clean();
}
