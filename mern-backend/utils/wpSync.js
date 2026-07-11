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

  return `
    <div id="gw-sp-container">
      <style>
        #gw-sp-container { width: 100%; max-width: 1000px; margin: 0 auto; font-family: 'Inter', sans-serif; color: #4a5568; }
        #gw-sp-container * { box-sizing: border-box; }
        .gw-main-viewport { position: relative; width: 100%; border-radius: 8px; overflow: hidden; background-color: #E2E8F0; margin-bottom: 16px; aspect-ratio: 16 / 9; }
        .gw-main-image { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gw-badges { position: absolute; top: 16px; left: 16px; display: flex; gap: 8px; flex-wrap: wrap; z-index: 2; }
        .gw-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; box-shadow: 0px 4px 12px rgba(0,0,0,0.15); }
        .gw-badge-verified { background-color: #D4AF37; color: #1E1B4B; }
        .gw-badge-urgent { background-color: #bb001b; color: #FFFFFF; }
        .gw-walkthrough-trigger { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.9); padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 14px; color: #27267d; border: none; cursor: pointer; box-shadow: 0px 8px 24px rgba(30,27,75,0.2); transition: transform 0.2s; }
        .gw-walkthrough-trigger:hover { transform: translate(-50%, -52%); background: #ffffff; }
        .gw-thumbnails-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .gw-thumb-item { width: 100%; aspect-ratio: 4 / 3; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid transparent; }
        .gw-thumb-item.active { border-color: #27267d; }
        .gw-thumb-item img { width: 100%; height: 100%; object-fit: cover; }
        
        .gw-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 48px; }
        .gw-meta-card { background-color: #FAFAFA; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .gw-meta-title { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; }
        .gw-meta-value { font-size: 15px; font-weight: 700; color: #1E1B4B; }
        .gw-meta-sub { font-size: 12px; font-weight: 600; color: #D4AF37; }
        
        .gw-property-desc { font-size: 16px; line-height: 1.8; margin-bottom: 32px; color: #334155; }
        
        .gw-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 48px; }
        .gw-feature-item { display: flex; align-items: center; gap: 12px; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; background-color: #FFFFFF; font-weight: 600; color: #1e293b; font-size: 14px;}
        
        .gw-trust-shield { background-color: #1E1B4B; border-radius: 8px; padding: 32px; color: #FFFFFF; }
        .gw-shield-header { margin-bottom: 24px; }
        .gw-shield-title { font-size: 20px; font-weight: 700; color: #D4AF37; margin-bottom: 4px; }
        .gw-shield-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; }
        .gw-shield-col h5 { font-size: 14px; font-weight: 700; color: #D4AF37; margin-bottom: 8px; }
        .gw-shield-col p { font-size: 13px; color: #E2E8F0; line-height: 1.5;}
      </style>

      <div class="gw-main-viewport">
        <img id="gw-active-media-${property._id}" src="${mainImage}" class="gw-main-image">
        <div class="gw-badges">
          ${property.badge ? `<span class="gw-badge gw-badge-verified">${property.badge}</span>` : ''}
          ${property.status ? `<span class="gw-badge gw-badge-urgent">${property.status}</span>` : ''}
        </div>
        ${property.cloudinaryVideoUrl ? `
        <button class="gw-walkthrough-trigger" onclick="window.open('${property.cloudinaryVideoUrl}', '_blank')">
            ▶ Watch Drone Walkthrough
        </button>` : ''}
      </div>

      <div class="gw-thumbnails-row">
        ${galleryHtml}
      </div>

      <div class="gw-meta-grid">
        <div class="gw-meta-card">
          <span class="gw-meta-title">Survey Status</span>
          <div class="gw-meta-value">${property.titleType || 'N/A'}</div>
          <div class="gw-meta-sub">Surveyor: ${property.surveyorName || 'N/A'}</div>
        </div>
        <div class="gw-meta-card">
          <span class="gw-meta-title">GPS Coordinates</span>
          <div class="gw-meta-value">${property.gpsCoordinates || 'N/A'}</div>
          <div class="gw-meta-sub" style="color: #718096;">${property.location} Region</div>
        </div>
        <div class="gw-meta-card" style="background-color: #f0fdf4; border-color: #bbf7d0;">
          <span class="gw-meta-title">Current Status</span>
          <div class="gw-meta-sub" style="color: #bb001b; margin-bottom: 8px;">
            ${property.status} (${property.plotsRemaining || 0} Plots Left)
          </div>
          <a href="https://wa.me/2340000000000" target="_blank" style="background-color: #25D366; color: white; padding: 12px; border-radius: 4px; text-decoration: none; display: block; text-align: center; font-weight: bold; font-size: 14px;">WhatsApp Hotline</a>
        </div>
      </div>

      <div class="gw-property-desc">
        ${property.description}
      </div>

      <div class="gw-features-grid">
        <div class="gw-feature-item">
          Plot Size: ${property.plotSize || 'N/A'}
        </div>
        <div class="gw-feature-item">
          100% C of O Global Process
        </div>
        <div class="gw-feature-item">
          Dry, Table-flat Land
        </div>
        <div class="gw-feature-item">
          24/7 Gated Security Patrol
        </div>
      </div>

      <div class="gw-trust-shield">
        <div class="gw-shield-header">
          <div class="gw-shield-title">The GWealth Trust Shield</div>
          <div style="font-size: 14px; color: #A0AEC0;">Guaranteed legal protection for every plot owner.</div>
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

      <script>
        function gwSwapMedia(element, imageUrl) {
            const activeImg = document.getElementById('gw-active-media-${property._id}');
            if(!activeImg) return;
            activeImg.src = imageUrl;
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
    // Gallery — pass as array of Cloudinary URLs
    property_gallery:        property.cloudinaryImages || [],
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
