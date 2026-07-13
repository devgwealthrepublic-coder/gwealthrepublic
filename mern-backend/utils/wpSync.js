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
  const cloudinaryImages = property.cloudinaryImages || [];
  
  let galleryHtml = '';
  if (cloudinaryImages.length > 0) {
     galleryHtml = cloudinaryImages.map((img, idx) => `
        <div class="aspect-video rounded overflow-hidden shadow-sm border border-trust-slate">
            <img class="w-full h-full object-cover hover:opacity-90 cursor-pointer transition-opacity gw-gallery-img" data-alt="Thumbnail ${idx + 1}" src="${img}">
        </div>
     `).join('');
  }

  const whatsappMessage = encodeURIComponent(`Hi GWealth, I am interested in ${property.propertyName}. Please provide more information.`);

  const plotsText = property.plotsRemaining ? `(${property.plotsRemaining} Plots Left)` : '';

  return `
    <div id="gw-sp-container" class="bg-surface font-body-md text-on-surface">
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
                            "on-primary": "#ffffff",
                            "secondary-fixed-dim": "#ffb3ad",
                            "on-tertiary-fixed-variant": "#6d3900",
                            "on-tertiary-container": "#f6a967",
                            "inverse-surface": "#213145",
                            "error": "#ba1a1a",
                            "surface-container-high": "#dce9ff",
                            "surface-container-lowest": "#ffffff",
                            "surface-container": "#e5eeff",
                            "primary": "#27267d",
                            "tertiary-container": "#723c00",
                            "on-primary-container": "#b2b2ff",
                            "tertiary": "#512900",
                            "outline-variant": "#c7c5d3",
                            "on-tertiary-fixed": "#2e1500",
                            "on-surface-variant": "#464651",
                            "error-container": "#ffdad6",
                            "surface": "#FAFAFA",
                            "inverse-on-surface": "#eaf1ff",
                            "primary-fixed": "#e2dfff",
                            "on-error-container": "#93000a",
                            "tertiary-fixed": "#ffdcc2",
                            "surface-dim": "#cbdbf5",
                            "primary-container": "#3f3f95",
                            "trust-slate": "#E2E8F0",
                            "surface-bright": "#f8f9ff",
                            "on-error": "#ffffff",
                            "on-surface": "#0b1c30",
                            "on-secondary-container": "#fffbff",
                            "surface-tint": "#5454ab",
                            "background": "#f8f9ff",
                            "tertiary-fixed-dim": "#ffb77c",
                            "on-secondary-fixed": "#410004",
                            "on-primary-fixed-variant": "#3c3c92",
                            "primary-fixed-dim": "#c1c1ff",
                            "on-primary-fixed": "#0c0367",
                            "legal-ink": "#1E1B4B",
                            "surface-variant": "#d3e4fe",
                            "on-secondary-fixed-variant": "#930013",
                            "secondary": "#bb001b",
                            "on-background": "#0b1c30",
                            "surface-container-low": "#eff4ff",
                            "inverse-primary": "#c1c1ff",
                            "secondary-container": "#e02830",
                            "on-secondary": "#ffffff",
                            "on-tertiary": "#ffffff",
                            "verified-gold": "#D4AF37",
                            "surface-container-highest": "#d3e4fe",
                            "secondary-fixed": "#ffdad7",
                            "outline": "#777683"
                    },
                    "borderRadius": {
                            "DEFAULT": "4px",
                            "lg": "4px",
                            "xl": "4px",
                            "full": "9999px"
                    },
                    "spacing": {
                            "base": "8px",
                            "margin-desktop": "64px",
                            "margin-mobile": "16px",
                            "gutter": "24px",
                            "container-max": "1280px"
                    },
                    "fontFamily": {
                            "headline-lg-mobile": ["Montserrat"],
                            "label-md": ["Inter"],
                            "headline-lg": ["Montserrat"],
                            "body-md": ["Inter"],
                            "display-lg": ["Montserrat"],
                            "headline-md": ["Montserrat"],
                            "label-sm": ["Inter"],
                            "body-lg": ["Inter"]
                    },
                    "fontSize": {
                            "headline-lg-mobile": ["28px", {"lineHeight": "34px", "fontWeight": "700"}],
                            "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600"}],
                            "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "700"}],
                            "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                            "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                            "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                            "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
                            "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}]
                    }
                },
                },
            }
        }catch(_e){}
        </script>

        <!-- Main Structure -->
        <div class="pt-12 pb-20 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <!-- Hero & Media Section -->
            <section class="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-12">
            <div class="lg:col-span-8 space-y-gutter">
                <!-- Main Image Container -->
                <div class="relative group overflow-hidden rounded shadow-lg aspect-[16/9] lg:aspect-[3/2]">
                    <div class="absolute top-4 left-4 z-10 flex gap-2">
                        ${property.status ? \`<span class="bg-secondary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded">\${property.status}</span>\` : ''}
                        ${property.badge ? \`<span class="bg-primary-container text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1">
                            <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                            \${property.badge}
                        </span>\` : ''}
                    </div>
                    <img id="gw-main-display-image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="\${property.propertyName}" src="\${mainImage}">
                </div>
                <!-- Thumbnail Gallery -->
                <div class="grid grid-cols-3 gap-base">
                    \${galleryHtml}
                </div>
            </div>

            <!-- Lead Gen & Quick Stats Sidebar -->
            <div class="lg:col-span-4 space-y-gutter">
                <div class="bg-white p-gutter rounded shadow-sm border border-trust-slate">
                    <div class="mb-6">
                        <h1 class="font-headline-md text-headline-md text-primary mb-2">\${property.propertyName}</h1>
                        <p class="text-on-surface-variant font-body-md flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">location_on</span>
                            \${property.location} Region
                        </p>
                    </div>
                    
                    <div class="space-y-4 mb-8">
                        <div class="p-4 bg-surface-container-low rounded border border-surface-variant/50">
                            <p class="text-label-sm font-label-sm text-outline uppercase tracking-wider mb-1">Survey Status</p>
                            <div class="flex items-center justify-between">
                                <span class="font-headline-md text-on-surface flex items-center gap-2">
                                    \${property.titleType || 'N/A'}
                                    <span class="material-symbols-outlined text-verified-gold" style="font-variation-settings: 'FILL' 1;">verified_user</span>
                                </span>
                                <span class="text-label-sm font-label-sm text-primary">Surveyor: \${property.surveyorName || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="p-4 bg-surface-container-low rounded border border-surface-variant/50">
                            <p class="text-label-sm font-label-sm text-outline uppercase tracking-wider mb-1">GPS Coordinates</p>
                            <div class="flex items-center justify-between">
                                <span class="font-headline-md text-on-surface">\${property.gpsCoordinates || 'N/A'}</span>
                                <span class="text-label-sm font-label-sm text-primary">Location</span>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-error-container/30 rounded border border-error/10 mb-6">
                        <p class="text-label-sm font-bold text-error uppercase mb-1">Current Status</p>
                        <p class="text-body-md text-on-surface font-semibold">\${property.status || 'Investment'} \${plotsText}</p>
                    </div>

                    <a href="https://wa.me/2348025326721?text=\${whatsappMessage}" target="_blank" class="w-full bg-[#25D366] hover:bg-[#20bd5c] text-white py-4 rounded flex flex-col items-center justify-center transition-transform active:scale-95 group no-underline">
                        <span class="flex items-center gap-2 font-bold text-lg">
                            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.764-5.768zm3.393 8.235c-.146.411-.849.771-1.163.821-.291.046-.669.071-1.077-.105a6.974 6.974 0 01-2.923-1.895c-1.036-1.021-1.742-2.316-1.93-2.61-.189-.294-.016-.453.131-.601.134-.132.295-.344.444-.515.148-.172.197-.294.296-.491.099-.197.049-.369-.025-.515-.074-.148-.664-1.597-.91-2.187-.243-.578-.496-.499-.684-.509-.176-.009-.379-.011-.581-.011-.202 0-.531.076-.809.377-.278.301-1.062 1.038-1.062 2.53 0 1.492 1.085 2.934 1.237 3.135.152.201 2.136 3.261 5.172 4.57.721.311 1.284.497 1.721.636.726.23 1.386.198 1.908.121.581-.086 1.785-.731 2.037-1.439.253-.708.253-1.315.177-1.439-.076-.124-.278-.197-.581-.347z"></path></svg>
                            WhatsApp Hotline
                        </span>
                        <span class="text-[11px] opacity-90 uppercase tracking-widest font-bold mt-1">Secure Your Plot Now</span>
                    </a>
                </div>
            </div>
            </section>

            <!-- Property Description & Stats Grid -->
            <section class="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-20">
                <div class="lg:col-span-8">
                    <div class="mb-10">
                        <h2 class="font-headline-md text-headline-md text-primary mb-4 border-l-4 border-primary pl-4">Property Specifications</h2>
                        <p class="text-body-lg font-body-lg text-on-surface-variant mb-8">
                            \${property.description || 'This property represents the peak of institutional land security, offering a table-flat topography ready for immediate construction.'}
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="flex items-center p-4 bg-white border border-trust-slate rounded group hover:border-primary transition-colors">
                                <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span class="material-symbols-outlined">square_foot</span>
                                </div>
                                <div>
                                    <p class="text-label-sm font-label-sm text-outline uppercase">Plot Size</p>
                                    <p class="font-headline-md text-on-surface">\${property.plotSize || 'N/A'}</p>
                                </div>
                            </div>
                            <div class="flex items-center p-4 bg-white border border-trust-slate rounded group hover:border-primary transition-colors">
                                <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span class="material-symbols-outlined">description</span>
                                </div>
                                <div>
                                    <p class="text-label-sm font-label-sm text-outline uppercase">Documentation</p>
                                    <p class="font-headline-md text-on-surface text-lg">100% C of O Global Process</p>
                                </div>
                            </div>
                            <div class="flex items-center p-4 bg-white border border-trust-slate rounded group hover:border-primary transition-colors">
                                <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span class="material-symbols-outlined">landscape</span>
                                </div>
                                <div>
                                    <p class="text-label-sm font-label-sm text-outline uppercase">Topography</p>
                                    <p class="font-headline-md text-on-surface text-lg">Dry, Table-flat Land</p>
                                </div>
                            </div>
                            <div class="flex items-center p-4 bg-white border border-trust-slate rounded group hover:border-primary transition-colors">
                                <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span class="material-symbols-outlined">verified_user</span>
                                </div>
                                <div>
                                    <p class="text-label-sm font-label-sm text-outline uppercase">Security</p>
                                    <p class="font-headline-md text-on-surface text-lg">24/7 Gated Security Patrol</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- The GWealth Trust Shield Section -->
            <section class="bg-primary-container text-white p-8 md:p-12 rounded shadow-xl relative overflow-hidden trust-shield-glow">
                <!-- Decorative Shield Icon Background -->
                <div class="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
                    <span class="material-symbols-outlined text-[300px]" style="font-variation-settings: 'FILL' 1;">shield</span>
                </div>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="material-symbols-outlined text-verified-gold text-4xl" style="font-variation-settings: 'FILL' 1;">shield</span>
                        <h2 class="font-display-lg text-display-lg text-white m-0">The GWealth Trust Shield</h2>
                    </div>
                    <p class="text-on-primary-container font-body-lg mb-12 max-w-2xl">
                        Guaranteed legal protection for every plot owner. Our institutional framework ensures your investment is shielded from any external claims or legal ambiguities.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="space-y-4">
                            <h3 class="font-headline-md text-headline-md text-verified-gold m-0">Zero Hidden Fees</h3>
                            <p class="text-on-primary-container font-body-md opacity-90 m-0">
                                The price you see covers primary paperwork and developmental levy. We eliminate the "Omo Onile" anxiety through total transparency.
                            </p>
                        </div>
                        <div class="space-y-4">
                            <h3 class="font-headline-md text-headline-md text-verified-gold m-0">C of O Priority</h3>
                            <p class="text-on-primary-container font-body-md opacity-90 m-0">
                                Institutional processing of your individual Deed of Assignment. We handle the bureaucratic heavy lifting for you.
                            </p>
                        </div>
                        <div class="space-y-4">
                            <h3 class="font-headline-md text-headline-md text-verified-gold m-0">Refund Policy</h3>
                            <p class="text-on-primary-container font-body-md opacity-90 m-0">
                                Transparent refund structure if legal standards are not met. Your capital is protected by our corporate guarantee.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <script>
            // Micro-interactions for gallery
            document.querySelectorAll('.gw-gallery-img').forEach(img => {
                img.addEventListener('click', function() {
                    const mainImg = document.getElementById('gw-main-display-image');
                    const temp = mainImg.src;
                    const tempAlt = mainImg.getAttribute('data-alt');
                    mainImg.src = this.src;
                    mainImg.setAttribute('data-alt', this.getAttribute('data-alt'));
                    this.src = temp;
                    this.setAttribute('data-alt', tempAlt);
                });
            });
        </script>
    </div>
  \`;
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
