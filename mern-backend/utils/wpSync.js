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
const buildWPPayload = (property) => ({
  title:   property.propertyName,
  content: property.description || '',
  status:  'publish',
  acf: {
    property_price:          property.pricePerPlot,
    property_location:       property.location,
    property_title_type:     property.titleType,
    property_video_embed:    property.cloudinaryVideoUrl,
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
