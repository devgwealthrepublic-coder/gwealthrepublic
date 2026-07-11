<?php
/**
 * GWealth Nation - Dynamic Property Shortcodes
 * 
 * INSTRUCTIONS:
 * 1. Install a free plugin like "WPCode" or "Code Snippets" in WordPress.
 * 2. Create a new PHP Snippet and paste this entire code.
 * 3. In Elementor's Single Post Template, use these two shortcodes:
 *    [gwealth_property_media]  (Place in the Left/Top column)
 *    [gwealth_property_details] (Place below or in the Right column)
 */

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
