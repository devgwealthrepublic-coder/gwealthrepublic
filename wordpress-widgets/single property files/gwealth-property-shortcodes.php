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
    <div class="w-full font-body-md mb-8">
        <div class="relative w-full rounded overflow-hidden bg-trust-slate mb-4 aspect-video shadow-sm">
            <img id="gw-active-media" src="<?php echo esc_url($main_img); ?>" alt="Property View" class="w-full h-full object-cover block">
            
            <div class="absolute top-4 left-4 flex gap-2 flex-wrap z-10">
                <?php if($badge): ?>
                    <span class="bg-verified-gold text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-md">
                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">verified</span> <?php echo esc_html($badge); ?>
                    </span>
                <?php endif; ?>
                <?php if($status): ?>
                    <span class="bg-secondary text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                        <?php echo esc_html($status); ?>
                    </span>
                <?php endif; ?>
            </div>

            <?php if($video_embed): ?>
                <button onclick="window.open('<?php echo esc_url($video_embed); ?>', '_blank')" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary px-6 py-3 rounded font-label-md text-sm flex items-center gap-2 shadow-lg hover:-translate-y-[52%] transition-all z-10">
                    <span class="material-symbols-outlined">play_circle</span> Drone Walkthrough
                </button>
            <?php endif; ?>
        </div>

        <?php if($gallery && is_array($gallery)): ?>
        <div class="grid grid-cols-4 gap-2 sm:gap-3">
            <?php 
            $count = 0;
            foreach($gallery as $img_url): 
                if($count >= 4) break; // Max 4 thumbs
                $active_class = ($count === 0) ? 'border-primary' : 'border-transparent';
            ?>
                <div class="relative w-full aspect-[4/3] rounded overflow-hidden cursor-pointer border-2 <?php echo $active_class; ?> transition-colors duration-300 gw-thumb-item" onclick="gwSwapMedia(this, '<?php echo esc_url($img_url); ?>')">
                    <img src="<?php echo esc_url($img_url); ?>" alt="Thumbnail <?php echo $count+1; ?>" class="w-full h-full object-cover block hover:scale-105 transition-transform duration-500">
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
                const allThumbs = document.querySelectorAll('.gw-thumb-item');
                allThumbs.forEach(thumb => {
                    thumb.classList.remove('border-primary');
                    thumb.classList.add('border-transparent');
                });
                element.classList.remove('border-transparent');
                element.classList.add('border-primary');
            }
        </script>
    </div>
    <?php
    return ob_get_clean();
}

// 2. Details Shortcode
add_shortcode('gwealth_property_details', 'render_gwealth_property_details');
function render_gwealth_property_details() {
    $title_type = get_field('property_title_type') ?: 'Pending';
    $surveyor = get_field('property_surveyor_name') ?: 'Registered Surveyor';
    $gps = get_field('property_gps') ?: 'Coordinates Available on Request';
    $location = get_field('property_location') ?: 'Prime';
    $status = get_field('property_status') ?: 'Available';
    $plots = get_field('property_plots_remaining');
    $size = get_field('property_size') ?: '500 SQM';
    $whatsapp = get_field('property_whatsapp_number') ?: '2348000000000'; // fallback
    
    // Clean up WhatsApp number (handle ACF 'Number' field stripping leading zeros)
    $whatsapp_clean = preg_replace('/[^0-9]/', '', $whatsapp);
    
    // Auto-format for Nigerian numbers if country code is missing
    if (strlen($whatsapp_clean) === 10) {
        // e.g., 8031234567 (leading zero was stripped by ACF Number field)
        $whatsapp_clean = '234' . $whatsapp_clean;
    } elseif (strlen($whatsapp_clean) === 11 && substr($whatsapp_clean, 0, 1) === '0') {
        // e.g., 08031234567
        $whatsapp_clean = '234' . substr($whatsapp_clean, 1);
    }
    
    // Create a pre-filled message with the specific property title
    $whatsapp_text = urlencode('Hello GWealth, I am interested in acquiring plots at ' . get_the_title() . '.');
    $whatsapp_url = "https://wa.me/{$whatsapp_clean}?text={$whatsapp_text}";
    
    $plots_display = '';
    if ($plots === '0' || $plots === 0) {
        $plots_display = 'Sold Out';
    } elseif (!empty($plots)) {
        $plots_display = esc_html($plots) . ' Plots Left';
    } else {
        $plots_display = 'Selling Fast';
    }

    ob_start();
    ?>
    <div class="w-full font-body-md text-on-surface-variant">
        
        <!-- Meta Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            
            <!-- Survey Status -->
            <div class="bg-surface border border-trust-slate rounded p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                <span class="text-xs font-bold text-outline uppercase tracking-widest">Survey Status</span>
                <div class="font-headline-md text-primary text-base flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">description</span>
                    <?php echo esc_html($title_type); ?>
                </div>
                <div class="text-sm font-label-md text-on-surface-variant flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">person</span>
                    Surveyor: <?php echo esc_html($surveyor); ?>
                </div>
            </div>

            <!-- GPS Coordinates -->
            <div class="bg-surface border border-trust-slate rounded p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                <span class="text-xs font-bold text-outline uppercase tracking-widest">Location Details</span>
                <div class="font-headline-md text-primary text-base flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">location_on</span>
                    <?php echo esc_html($gps); ?>
                </div>
                <div class="text-sm font-label-md text-on-surface-variant flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">map</span>
                    <?php echo esc_html($location); ?> Region
                </div>
            </div>

            <!-- Current Status & WhatsApp -->
            <div class="bg-surface-container-low border border-primary-fixed-dim rounded p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                <span class="text-xs font-bold text-primary uppercase tracking-widest">Investment Status</span>
                <div class="font-headline-md text-secondary text-base flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary">local_fire_department</span>
                    <?php echo esc_html($status); ?> 
                    <?php if($plots_display): ?>
                        <span class="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full ml-1 whitespace-nowrap"><?php echo $plots_display; ?></span>
                    <?php endif; ?>
                </div>
                <!-- WhatsApp Button (w-fit prevents full width stretching) -->
                <a href="<?php echo $whatsapp_url; ?>" target="_blank" class="w-fit bg-[#25D366] text-white px-4 py-2 rounded font-label-md text-sm flex items-center gap-2 hover:bg-[#1DA851] transition-colors mt-auto">
                    <span class="material-symbols-outlined text-sm">chat</span>
                    WhatsApp Hotline
                </a>
            </div>

        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div class="flex items-center gap-4 border border-trust-slate rounded p-4 bg-white shadow-sm">
                <span class="material-symbols-outlined text-primary text-2xl">square_foot</span>
                <span class="text-sm font-label-md text-on-surface-variant">Plot Size: <?php echo esc_html($size); ?></span>
            </div>
            <div class="flex items-center gap-4 border border-trust-slate rounded p-4 bg-white shadow-sm">
                <span class="material-symbols-outlined text-primary text-2xl">gavel</span>
                <span class="text-sm font-label-md text-on-surface-variant">100% C of O Global Process</span>
            </div>
            <div class="flex items-center gap-4 border border-trust-slate rounded p-4 bg-white shadow-sm">
                <span class="material-symbols-outlined text-primary text-2xl">landscape</span>
                <span class="text-sm font-label-md text-on-surface-variant">Dry, Table-flat Land</span>
            </div>
            <div class="flex items-center gap-4 border border-trust-slate rounded p-4 bg-white shadow-sm">
                <span class="material-symbols-outlined text-primary text-2xl">shield_person</span>
                <span class="text-sm font-label-md text-on-surface-variant">24/7 Gated Security Patrol</span>
            </div>
        </div>

        <!-- Trust Shield -->
        <div class="bg-primary rounded p-8 text-white shadow-lg">
            <div class="flex items-start gap-4 mb-8">
                <span class="material-symbols-outlined text-verified-gold text-4xl">shield</span>
                <div>
                    <h4 class="font-headline-md text-white text-lg mb-1">The GWealth Trust Shield</h4>
                    <p class="text-white/80 text-sm">Guaranteed legal protection for every plot owner.</p>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/20">
                <div>
                    <h5 class="font-label-md text-verified-gold text-sm mb-2">Zero Hidden Fees</h5>
                    <p class="text-xs text-white/80 leading-relaxed">The price you see covers primary paperwork and developmental levy.</p>
                </div>
                <div>
                    <h5 class="font-label-md text-verified-gold text-sm mb-2">C of O Priority</h5>
                    <p class="text-xs text-white/80 leading-relaxed">Institutional processing of your individual Deed of Assignment.</p>
                </div>
                <div>
                    <h5 class="font-label-md text-verified-gold text-sm mb-2">Refund Policy</h5>
                    <p class="text-xs text-white/80 leading-relaxed">Transparent refund structure if legal standards are not met.</p>
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
    <button id="gwOpenBookingBtn" class="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded font-label-md text-lg hover:bg-primary-container transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2">
        <span class="material-symbols-outlined">calendar_today</span> Book an Inspection
    </button>

    <!-- Modal Background -->
    <div id="gwBookingModalOverlay" class="fixed inset-0 bg-inverse-surface/80 backdrop-blur-sm z-[999999] flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300">
        <!-- Modal Content -->
        <div id="gw-booking-widget" class="relative w-[90%] max-w-lg bg-surface rounded-lg p-8 shadow-2xl transform translate-y-4 transition-transform duration-300 max-h-[90vh] overflow-y-auto">
            <button id="gwCloseBookingBtn" class="absolute top-4 right-4 text-outline hover:text-secondary transition-colors">
                <span class="material-symbols-outlined text-3xl">close</span>
            </button>
            
            <h4 class="font-headline-md text-primary text-2xl mb-2">Book an Inspection</h4>
            <p class="text-sm text-on-surface-variant mb-6">Schedule a free site tour with our experts.</p>

            <form id="gwExcursionForm" class="space-y-4">
                <input type="hidden" id="gwReferralCode" name="referralCode" value="">

                <div>
                    <label for="gwProperty" class="block text-sm font-label-md text-primary mb-1">Selected Property</label>
                    <input type="text" id="gwProperty" name="property" value="<?php echo esc_attr($property_title); ?>" readonly class="w-full px-4 py-3 bg-surface-container border border-trust-slate rounded text-on-surface-variant font-label-md cursor-not-allowed focus:ring-0">
                </div>

                <div>
                    <label for="gwName" class="block text-sm font-label-md text-primary mb-1">Full Name</label>
                    <input type="text" id="gwName" name="clientName" placeholder="e.g. John Doe" required class="w-full px-4 py-3 border border-trust-slate rounded text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                </div>
                
                <div>
                    <label for="gwPhone" class="block text-sm font-label-md text-primary mb-1">Phone Number (WhatsApp Active)</label>
                    <input type="tel" id="gwPhone" name="phone" placeholder="+234..." required class="w-full px-4 py-3 border border-trust-slate rounded text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                </div>

                <div>
                    <label for="gwBranch" class="block text-sm font-label-md text-primary mb-1">Nearest GWealth Branch</label>
                    <select id="gwBranch" name="branch" required class="w-full px-4 py-3 border border-trust-slate rounded text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
                        <option value="" disabled selected>Select Branch</option>
                        <option value="Aba">Aba</option>
                        <option value="Asaba">Asaba</option>
                        <option value="Port Harcourt">Port Harcourt</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Anambra">Anambra</option>
                    </select>
                </div>

                <div>
                    <label for="gwDate" class="block text-sm font-label-md text-primary mb-1">Preferred Inspection Date</label>
                    <input type="date" id="gwDate" name="preferredDate" required class="w-full px-4 py-3 border border-trust-slate rounded text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                </div>

                <button type="submit" id="gwSubmitBtn" class="w-full bg-primary text-white py-4 rounded font-label-md text-lg hover:bg-primary-container transition-colors mt-4">Confirm Booking</button>
                <div id="gwFormMessage" class="mt-4 text-sm font-label-md hidden p-4 rounded text-left"></div>
            </form>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 0. Modal Logic
            const openBtn = document.getElementById('gwOpenBookingBtn');
            const closeBtn = document.getElementById('gwCloseBookingBtn');
            const modal = document.getElementById('gwBookingModalOverlay');
            const widget = document.getElementById('gw-booking-widget');

            if (openBtn && modal) {
                openBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.classList.remove('opacity-0', 'pointer-events-none');
                    widget.classList.remove('translate-y-4');
                });
            }
            if (closeBtn && modal) {
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.classList.add('opacity-0', 'pointer-events-none');
                    widget.classList.add('translate-y-4');
                });
            }
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal || e.target.closest('#gwCloseBookingBtn')) {
                        modal.classList.add('opacity-0', 'pointer-events-none');
                        widget.classList.add('translate-y-4');
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
                    msgBox.className = 'mt-4 text-sm font-label-md hidden p-4 rounded text-left';

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
                            msgBox.classList.add('bg-surface-container-low', 'text-[#166534]', 'border', 'border-[#bbf7d0]', 'block');
                            msgBox.classList.remove('hidden');
                            form.reset();
                            
                            // Auto close modal after 3 seconds
                            setTimeout(() => {
                                modal.classList.add('opacity-0', 'pointer-events-none');
                                widget.classList.add('translate-y-4');
                            }, 3000);
                        } else {
                            throw new Error(result.message || 'Failed to book inspection');
                        }
                    } catch (error) {
                        msgBox.innerText = error.message;
                        msgBox.classList.add('bg-error-container', 'text-error', 'border', 'border-[#fecaca]', 'block');
                        msgBox.classList.remove('hidden');
                    } finally {
                        btn.disabled = false;
                        btn.innerText = 'Confirm Booking';
                    }
                });
            }
        });
    </script>
    <?php
    return ob_get_clean();
}
