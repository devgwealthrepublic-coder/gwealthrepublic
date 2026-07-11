const mongoose = require('mongoose');

/**
 * Property Schema — GWealth Nation
 *
 * Stores the single source of truth for all property listings.
 * Fields map directly to:
 *   - The WordPress ACF fields (for public WP display via sync engine)
 *   - The property card component (listing grid)
 *   - The single property details page
 */
const milestoneSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: String },  // e.g. "Sept 20, 2024" or "Pending"
  status:      { type: String, enum: ['completed', 'pending'], default: 'pending' },
}, { _id: false });

const propertySchema = new mongoose.Schema(
  {
    // ---- Core Identity -------------------------------------------------
    propertyName: {
      type:     String,
      required: [true, 'Property name is required'],
      trim:     true,
    },
    description: {
      type:    String,
      default: '',
    },

    // ---- Location & Address --------------------------------------------
    location: {
      type:     String,
      required: [true, 'Location is required'],
      enum:     ['Aba', 'Asaba', 'Port Harcourt', 'Abuja', 'Anambra'],
    },
    // Specific sub-address shown on property card  e.g. "Ike Amocha, Asaba"
    address: {
      type:    String,
      default: '',
    },
    gpsCoordinates: {
      type:    String,
      default: '',    // e.g. "4.8472° N, 7.0498° E"
    },

    // ---- Pricing & Inventory -------------------------------------------
    pricePerPlot: {
      type:     Number,
      required: [true, 'Price per plot is required'],
    },
    plotsRemaining: {
      type:    Number,
      default: null,
    },
    plotSize: {
      type:    String,
      default: '', // e.g. "465 SQM"
    },

    // ---- Legal & Title -------------------------------------------------
    titleType: {
      type:    String,
      default: '', // e.g. "Registered Survey", "C of O", "Power of Attorney"
    },
    surveyNumber: {
      type:    String,
      default: '', // e.g. "AK/2024/089"
    },

    // ---- Display Badges (Property Card) --------------------------------
    // Badge shown at the top of the property card image
    badge: {
      type:    String,
      enum:    ['Verified Asset', 'Legal Cleared', 'Premium Listing', 'Resolved', ''],
      default: 'Verified Asset',
    },
    // Availability/development status shown on the card
    status: {
      type:    String,
      enum:    ['Ready', 'In-Use', 'Investment', 'Budget Site'],
      default: 'Ready',
    },

    // ---- Media (All via Cloudinary CDN) --------------------------------
    // Main image shown on the property card in the grid
    featuredImage: {
      type:    String,
      default: '',    // Cloudinary URL
    },
    // Full gallery shown on the single property page
    cloudinaryImages: {
      type:    [String],
      default: [],    // Array of Cloudinary image URLs
    },
    // Drone walkthrough video on the single property page
    cloudinaryVideoUrl: {
      type:    String,
      default: '',    // Cloudinary video URL
    },

    // ---- Development Timeline ------------------------------------------
    milestones: {
      type:    [milestoneSchema],
      default: [],
    },

    // ---- WordPress Sync State ------------------------------------------
    // The WordPress post ID returned after a successful sync.
    // Used for future PUT (edit) and DELETE operations on WordPress.
    wpPostId: {
      type:    Number,
      default: null,
    },
    isPublishedToWordPress: {
      type:    Boolean,
      default: false,
    },
    // Tracks failed sync attempts for the retry cron job
    wpSyncPending: {
      type:    Boolean,
      default: false,
    },
    wpSyncRetryCount: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,  // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Property', propertySchema);
