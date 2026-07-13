const axios  = require('axios');

/**
 * wpSync.js — The Sync Engine (Phase 4 Bridge)
 *
 * Pushes property data from MongoDB → WordPress REST API using
 * HTTP Basic Auth with a WordPress Application Password.
 *
 * This module handles:
 *  - CREATE: POST /wp-json/wp/v2/properties
 *  - UPDATE: PUT  /wp-json/wp/v2/properties/{wpPostId}
 *  - DELETE: DELETE /wp-json/wp/v2/properties/{wpPostId}
 *
 * Architecture: prd.md Section 5 — Decoupled REST API Push Model
 */

// Build the Basic Auth header from WP credentials in .env
const getWPAuthHeader = () => {
  const credentials = `${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`;
  const encoded     = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
};

/**
 * Maps a MongoDB Property document → WordPress REST API payload.
 *
 * ACF field names must match exactly what was created in WordPress ACF:
 *  property_price, property_location, property_title_type,
 *  property_video_embed, property_gps, property_plots_remaining,
 *  property_badge, property_status, property_size, property_featured_image
 *
 * @param {Object} property - Mongoose Property document
 * @returns {Object} - WordPress REST API body
 */
const compileWPContent = (property) => {
  const mainImage = property.featuredImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200';
  const galleryHtml = (property.cloudinaryImages || []).map((img, idx) => `
    <div class="gw-thumb-item ${idx === 0 ? 'active' : ''}" onclick="gwSwapMedia(this, '${img}')">
        <img src="${img}" alt="Thumbnail ${idx + 1}">
    </div>
  `).join('');

  const whatsappMessage = encodeURIComponent(`Hi GWealth, I am interested in ${property.propertyName}. Please provide more information.`);

  return `
    <div id="gw-sp-container">
      <style>
        #gw-sp-container { width: 100%; max-width: 1000px; margin: 0 auto; font-family: 'Inter', sans-serif; color: #1e293b; animation: gwFadeIn 0.8s ease-out; }
        @keyframes gwFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        #gw-sp-container * { box-sizing: border-box; }
        .gw-main-viewport { position: relative; width: 100%; border-radius: 16px; overflow: hidden; background-color: #0f172a; margin-bottom: 24px; aspect-ratio: 16 / 9; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .gw-main-image { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity 0.4s ease; }
        .gw-badges { position: absolute; top: 20px; left: 20px; display: flex; gap: 10px; flex-wrap: wrap; z-index: 2; }
        .gw-badge { display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 50px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0px 8px 20px rgba(0,0,0,0.2); backdrop-filter: blur(4px); }
        .gw-badge-verified { background-color: rgba(212, 175, 55, 0.95); color: #1E1B4B; border: 1px solid #D4AF37; }
        .gw-badge-urgent { background-color: rgba(187, 0, 27, 0.95); color: #FFFFFF; border: 1px solid #bb001b; }
        
        .gw-video-overlay { position: absolute; bottom: 30px; right: 30px; z-index: 5; }
        .gw-pulse-btn { display: flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.8); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 700; text-decoration: none; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); transition: all 0.3s ease; box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); animation: gwPulse 2s infinite; }
        .gw-pulse-btn:hover { background: #D4AF37; color: #1E1B4B; transform: scale(1.05); animation: none; border-color: #D4AF37; }
        @keyframes gwPulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
        
        .gw-thumbnails-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .gw-thumb-item { width: 100%; aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; cursor: pointer; border: 3px solid transparent; transition: all 0.3s ease; opacity: 0.6; }
        .gw-thumb-item:hover { opacity: 0.9; transform: translateY(-3px); }
        .gw-thumb-item.active { border-color: #D4AF37; opacity: 1; box-shadow: 0 10px 20px rgba(212,175,55,0.2); }
        .gw-thumb-item img { width: 100%; height: 100%; object-fit: cover; }
        
        .gw-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 48px; }
        .gw-meta-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 8px; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .gw-meta-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
        .gw-meta-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .gw-meta-value { font-size: 16px; font-weight: 800; color: #1E1B4B; }
        .gw-meta-sub { font-size: 13px; font-weight: 600; color: #D4AF37; }
        
        .gw-status-card { background: linear-gradient(135deg, #1E1B4B 0%, #0B0A1C 100%); border: none; color: white; }
        .gw-status-card .gw-meta-title { color: #94a3b8; }
        .gw-status-card .gw-meta-value { color: #ffffff; }
        
        .gw-whatsapp-btn { background-color: #25D366; color: white; padding: 14px; border-radius: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 15px; margin-top: 12px; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3); }
        .gw-whatsapp-btn:hover { background-color: #1ea952; transform: translateY(-2px); color: white; box-shadow: 0 15px 25px rgba(37, 211, 102, 0.4); }
        
        .gw-property-desc { font-size: 17px; line-height: 1.8; margin-bottom: 40px; color: #475569; padding: 0 10px; }
        
        .gw-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 48px; }
        .gw-feature-item { display: flex; align-items: center; gap: 16px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #ffffff; font-weight: 700; color: #1e293b; font-size: 15px; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .gw-feature-item:hover { border-color: #D4AF37; background: #fffcf5; }
        .gw-feature-icon { width: 32px; height: 32px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        
        .gw-trust-shield { background: linear-gradient(135deg, #1E1B4B 0%, #2e2a6b 100%); border-radius: 16px; padding: 40px; color: #FFFFFF; box-shadow: 0 20px 40px rgba(30, 27, 75, 0.2); position: relative; overflow: hidden; }
        .gw-trust-shield::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 60%); pointer-events: none; }
        .gw-shield-header { margin-bottom: 32px; text-align: center; }
        .gw-shield-title { font-size: 26px; font-weight: 800; color: #D4AF37; margin-bottom: 8px; letter-spacing: 1px; }
        .gw-shield-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 32px; }
        .gw-shield-col h5 { font-size: 16px; font-weight: 800; color: #D4AF37; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .gw-shield-col p { font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0; }
      </style>

      <div class="gw-main-viewport">
        <img id="gw-active-media-${property._id}" src="${mainImage}" class="gw-main-image">
        <div class="gw-badges">
          ${property.badge ? `<span class="gw-badge gw-badge-verified">✓ ${property.badge}</span>` : ''}
          ${property.status ? `<span class="gw-badge gw-badge-urgent">${property.status}</span>` : ''}
        </div>
        ${property.cloudinaryVideoUrl ? `
        <div class="gw-video-overlay">
          <a href="${property.cloudinaryVideoUrl}" target="_blank" class="gw-pulse-btn">
              ▶ Watch Drone Walkthrough
          </a>
        </div>` : ''}
      </div>

      ${galleryHtml ? `<div class="gw-thumbnails-row">${galleryHtml}</div>` : ''}

      <div class="gw-meta-grid">
        ${property.titleType ? `
        <div class="gw-meta-card">
          <span class="gw-meta-title">Survey Status</span>
          <div class="gw-meta-value">${property.titleType}</div>
          ${property.surveyorName ? `<div class="gw-meta-sub">Surveyor: ${property.surveyorName}</div>` : ''}
        </div>` : ''}
        
        ${property.gpsCoordinates ? `
        <div class="gw-meta-card">
          <span class="gw-meta-title">GPS Coordinates</span>
          <div class="gw-meta-value">${property.gpsCoordinates}</div>
          <div class="gw-meta-sub" style="color: #64748b;">${property.location} Region</div>
        </div>` : ''}

        <div class="gw-meta-card gw-status-card">
          <span class="gw-meta-title">Investment Status</span>
          <div class="gw-meta-value">${property.status}</div>
          ${property.plotsRemaining ? `<div class="gw-meta-sub" style="color: #fbbf24;">${property.plotsRemaining} Plots Left</div>` : ''}
          <a href="https://wa.me/2348025326721?text=${whatsappMessage}" target="_blank" class="gw-whatsapp-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            WhatsApp Inquiry
          </a>
        </div>
      </div>

      ${property.description ? `<div class="gw-property-desc">${property.description}</div>` : ''}

      <div class="gw-features-grid">
        ${property.plotSize ? `
        <div class="gw-feature-item">
          <div class="gw-feature-icon">📏</div>
          Plot Size: ${property.plotSize}
        </div>` : ''}
        <div class="gw-feature-item">
          <div class="gw-feature-icon">📜</div>
          100% C of O Global Process
        </div>
        <div class="gw-feature-item">
          <div class="gw-feature-icon">⛰️</div>
          Dry, Table-flat Land
        </div>
        <div class="gw-feature-item">
          <div class="gw-feature-icon">🛡️</div>
          24/7 Gated Security Patrol
        </div>
      </div>

      <div class="gw-trust-shield">
        <div class="gw-shield-header">
          <div class="gw-shield-title">The GWealth Trust Shield</div>
          <div style="font-size: 15px; color: #cbd5e1;">Guaranteed legal protection for every plot owner.</div>
        </div>
        <div class="gw-shield-grid">
          <div class="gw-shield-col">
            <h5>✓ Zero Hidden Fees</h5>
            <p>The price you see covers primary paperwork and developmental levy.</p>
          </div>
          <div class="gw-shield-col">
            <h5>✓ C of O Priority</h5>
            <p>Institutional processing of your individual Deed of Assignment.</p>
          </div>
          <div class="gw-shield-col">
            <h5>✓ Refund Policy</h5>
            <p>Transparent refund structure if legal standards are not met.</p>
          </div>
        </div>
      </div>

      <script>
        function gwSwapMedia(element, imageUrl) {
            const activeImg = document.getElementById('gw-active-media-${property._id}');
            if(!activeImg) return;
            activeImg.style.opacity = '0';
            setTimeout(() => {
                activeImg.src = imageUrl;
                activeImg.style.opacity = '1';
            }, 300);
            const allThumbs = element.parentElement.querySelectorAll('.gw-thumb-item');
            allThumbs.forEach(thumb => thumb.classList.remove('active'));
            element.classList.add('active');
        }
      </script>
    </div>
  `;
};

const buildWPPayload = (property) => ({
  title:   property.propertyName,
  content: compileWPContent(property),
  status:  'publish',
  acf: {
    property_price:          property.pricePerPlot,
    property_location:       property.location,
    property_title_type:     property.titleType,
    property_video_embed:    property.cloudinaryVideoUrl,
    property_video_duration: property.videoDuration,
    property_surveyor_name:  property.surveyorName,
    property_gps:            property.gpsCoordinates,
    property_plots_remaining: property.plotsRemaining,
    // Card display fields
    property_badge:          property.badge,
    property_status:         property.status,
    property_size:           property.plotSize,
    property_featured_image: property.featuredImage,
    // property_gallery removed: ACF expects IDs, but we already embedded the gallery into the HTML content above.
  },
});

/**
 * syncCreateToWordPress
 * Called after a new property is saved to MongoDB.
 * Creates a new WP post and returns the WordPress post ID.
 *
 * @param {Object} property - Mongoose Property document
 * @returns {number|null} WordPress post ID or null on failure
 */
const syncCreateToWordPress = async (property) => {
  try {
    const response = await axios.post(
      `${process.env.WP_BASE_URL}/wp-json/wp/v2/properties`,
      buildWPPayload(property),
      {
        headers: {
          Authorization:  getWPAuthHeader(),
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 seconds
      }
    );

    console.log(`✅ WP Sync: Property "${property.propertyName}" created. WP ID: ${response.data.id}`);
    return response.data.id;

  } catch (error) {
    // Log the error but DO NOT crash. Mark as pending for retry cron.
    console.error(
      `❌ WP Sync Create Failed for "${property.propertyName}":`,
      error.response?.data || error.message
    );
    return null;
  }
};

/**
 * syncUpdateToWordPress
 * Called when an existing property is edited in the MERN admin panel.
 * Updates the corresponding WP post via its stored wpPostId.
 *
 * @param {Object} property - Mongoose Property document (must have wpPostId)
 */
const syncUpdateToWordPress = async (property) => {
  if (!property.wpPostId) {
    console.warn(`⚠️ WP Sync Update: No wpPostId stored for "${property.propertyName}". Attempting create instead.`);
    const newId = await syncCreateToWordPress(property);
    return newId;
  }

  try {
    await axios.put(
      `${process.env.WP_BASE_URL}/wp-json/wp/v2/properties/${property.wpPostId}`,
      buildWPPayload(property),
      {
        headers: {
          Authorization:  getWPAuthHeader(),
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    console.log(`✅ WP Sync: Property "${property.propertyName}" updated. WP ID: ${property.wpPostId}`);

  } catch (error) {
    console.error(
      `❌ WP Sync Update Failed for "${property.propertyName}":`,
      error.response?.data || error.message
    );
  }
};

/**
 * syncDeleteFromWordPress
 * Called when a property is deleted from the MERN admin panel.
 * Permanently removes the WP post by its stored wpPostId.
 *
 * @param {number} wpPostId - The WordPress post ID
 * @param {string} propertyName - For logging only
 */
const syncDeleteFromWordPress = async (wpPostId, propertyName) => {
  if (!wpPostId) {
    console.warn(`⚠️ WP Sync Delete: No wpPostId for "${propertyName}". Nothing to delete from WordPress.`);
    return;
  }

  try {
    await axios.delete(
      `${process.env.WP_BASE_URL}/wp-json/wp/v2/properties/${wpPostId}?force=true`,
      {
        headers: {
          Authorization: getWPAuthHeader(),
        },
        timeout: 10000,
      }
    );

    console.log(`✅ WP Sync: Property "${propertyName}" deleted from WordPress. WP ID: ${wpPostId}`);

  } catch (error) {
    console.error(
      `❌ WP Sync Delete Failed for "${propertyName}":`,
      error.response?.data || error.message
    );
  }
};

/**
 * retrySyncPendingProperties
 * Cron job target — Called every 30 minutes to retry failed WP syncs.
 * See: prd.md Section 8 — Asynchronous API Error-Handling (The Fail-Safe Queue)
 *
 * @param {Model} Property - Mongoose Property model
 */
const retrySyncPendingProperties = async (Property) => {
  const pendingProperties = await Property.find({ wpSyncPending: true });

  if (pendingProperties.length === 0) return;

  console.log(`🔄 WP Sync Retry: Found ${pendingProperties.length} pending sync(s).`);

  for (const property of pendingProperties) {
    const wpId = await syncCreateToWordPress(property);

    if (wpId) {
      await Property.findByIdAndUpdate(property._id, {
        wpPostId:               wpId,
        isPublishedToWordPress: true,
        wpSyncPending:          false,
        wpSyncRetryCount:       0,
      });
    } else {
      await Property.findByIdAndUpdate(property._id, {
        $inc: { wpSyncRetryCount: 1 },
      });
    }
  }
};

module.exports = {
  syncCreateToWordPress,
  syncUpdateToWordPress,
  syncDeleteFromWordPress,
  retrySyncPendingProperties,
};
