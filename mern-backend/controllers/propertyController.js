const asyncHandler = require('express-async-handler');
const Property     = require('../models/Property');
const Notice       = require('../models/Notice');
const {
  syncCreateToWordPress,
  syncUpdateToWordPress,
  syncDeleteFromWordPress,
} = require('../utils/wpSync');

// ================================================================
//  @route  GET /api/properties
//  @desc   Get all properties with optional filtering & pagination
//  @access Public (WordPress frontend + anyone)
// ================================================================
const getProperties = asyncHandler(async (req, res) => {
  const {
    location,
    minPrice,
    maxPrice,
    titleType,
    status,
    sort    = 'newest',
    page    = 1,
    limit   = 6,
  } = req.query;

  // Build the MongoDB filter object
  const filter = {};

  if (location)  filter.location  = location;
  if (titleType) filter.titleType = new RegExp(titleType, 'i');
  if (status)    filter.status    = status;

  if (minPrice || maxPrice) {
    filter.pricePerPlot = {};
    if (minPrice) filter.pricePerPlot.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerPlot.$lte = Number(maxPrice);
  }

  // Sort mapping
  const sortMap = {
    newest:     { createdAt: -1 },
    oldest:     { createdAt:  1 },
    price_asc:  { pricePerPlot:  1 },
    price_desc: { pricePerPlot: -1 },
  };
  const sortQuery = sortMap[sort] || sortMap.newest;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Property.countDocuments(filter);

  const properties = await Property.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page:    Number(page),
    pages:   Math.ceil(total / Number(limit)),
    data:    properties,
  });
});

// ================================================================
//  @route  GET /api/properties/:id
//  @desc   Get single property by MongoDB _id
//  @access Public
// ================================================================
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  res.json({ success: true, data: property });
});

// ================================================================
//  @route  POST /api/properties
//  @desc   Create a new property listing
//  @access Admin only
//
//  Flow:
//   1. Save to MongoDB
//   2. Fire syncCreateToWordPress() — pushes to WP REST API
//   3. Save returned wpPostId back to MongoDB
// ================================================================
const createProperty = asyncHandler(async (req, res) => {
  const {
    propertyName,
    description,
    location,
    address,
    pricePerPlot,
    plotsRemaining,
    plotSize,
    titleType,
    surveyNumber,
    badge,
    status,
    gpsCoordinates,
    videoDuration,
    surveyorName,
    milestones,
    publishToWordPress,
  } = req.body;

  // Cloudinary URLs come from the upload middleware (set on req.files/req.file)
  const featuredImage    = req.files?.featuredImage?.[0]?.path || req.body.featuredImage || '';
  const cloudinaryVideoUrl = req.files?.videoFile?.[0]?.path || req.body.cloudinaryVideoUrl || '';
  const cloudinaryImages = req.files?.images
    ? req.files.images.map((f) => f.path)
    : (req.body.cloudinaryImages || []);

  // 1. Save to MongoDB
  const property = await Property.create({
    propertyName,
    description,
    location,
    address,
    pricePerPlot:      Number(pricePerPlot),
    plotsRemaining:    plotsRemaining ? Number(plotsRemaining) : null,
    plotSize,
    titleType,
    surveyNumber,
    badge,
    status,
    gpsCoordinates,
    featuredImage,
    cloudinaryImages,
    cloudinaryVideoUrl,
    videoDuration,
    surveyorName,
    milestones:         milestones ? JSON.parse(milestones) : [],
    wpSyncPending:      false,
  });

  // 2. Sync to WordPress (if the admin checked "Publish to gwealthrepublic.com")
  if (publishToWordPress === 'true' || publishToWordPress === true) {
    const wpId = await syncCreateToWordPress(property);

    if (wpId) {
      // 3. Store wpPostId so future edits/deletes know which WP post to target
      property.wpPostId               = wpId;
      property.isPublishedToWordPress = true;
      await property.save();
    } else {
      // WP sync failed — mark as pending for the retry cron job
      property.wpSyncPending = true;
      await property.save();
    }
  }

  // 4. Auto-generate a Notice for Partners
  try {
    await Notice.create({
      title: 'New Property Available',
      message: `${propertyName} is now available in the portal. Head to the Smart Link Generator to start sharing!`,
      type: 'success'
    });
  } catch (err) {
    console.error('Failed to create notice:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Property created successfully.',
    data:    property,
  });
});

// ================================================================
//  @route  PUT /api/properties/:id
//  @desc   Update an existing property
//  @access Admin only
//
//  Flow:
//   1. Update MongoDB document
//   2. If wpPostId exists → PUT to WordPress REST API
// ================================================================
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  const oldStatus = property.status;

  // Merge updated fields
  const updatableFields = [
    'propertyName', 'description', 'location', 'address',
    'pricePerPlot', 'plotsRemaining', 'plotSize', 'titleType',
    'surveyNumber', 'badge', 'status', 'gpsCoordinates',
    'videoDuration', 'surveyorName', 'milestones',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      property[field] = req.body[field];
    }
  });

  // Handle new media uploads if provided
  if (req.files?.featuredImage?.[0]) {
    property.featuredImage = req.files.featuredImage[0].path;
  }
  if (req.files?.videoFile?.[0]) {
    property.cloudinaryVideoUrl = req.files.videoFile[0].path;
  }
  if (req.files?.images) {
    property.cloudinaryImages = req.files.images.map((f) => f.path);
  }

  const newStatus = property.status;

  await property.save();

  // Auto-generate a Notice if status changed to Sold Out
  if (oldStatus !== 'Sold Out' && newStatus === 'Sold Out') {
    try {
      await Notice.create({
        title: 'Property Sold Out',
        message: `${property.propertyName} is officially sold out and is no longer available for marketing.`,
        type: 'urgent'
      });
    } catch (err) {
      console.error('Failed to create notice:', err);
    }
  }

  // Sync update to WordPress if it was previously published
  if (property.isPublishedToWordPress || req.body.publishToWordPress === 'true') {
    await syncUpdateToWordPress(property);
  }

  res.json({
    success: true,
    message: 'Property updated successfully.',
    data:    property,
  });
});

// ================================================================
//  @route  DELETE /api/properties/:id
//  @desc   Delete a property listing
//  @access Admin only
//
//  Flow:
//   1. Delete from WordPress (if wpPostId exists)
//   2. Delete from MongoDB
// ================================================================
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  // 1. Remove from WordPress first
  if (property.wpPostId) {
    await syncDeleteFromWordPress(property.wpPostId, property.propertyName);
  }

  // 2. Remove from MongoDB
  await property.deleteOne();

  res.json({
    success: true,
    message: `Property "${property.propertyName}" deleted successfully.`,
  });
});

// ================================================================
//  @route  POST /api/properties/:id/publish
//  @desc   Manually trigger WordPress sync for a property
//  @access Admin only
// ================================================================
const publishPropertyToWordPress = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  let wpId;

  if (property.wpPostId) {
    // Already exists in WP — update it
    await syncUpdateToWordPress(property);
    wpId = property.wpPostId;
  } else {
    // New sync — create in WP
    wpId = await syncCreateToWordPress(property);

    if (wpId) {
      property.wpPostId               = wpId;
      property.isPublishedToWordPress = true;
      property.wpSyncPending          = false;
      await property.save();
    }
  }

  res.json({
    success:  !!wpId,
    message:  wpId
      ? `Property synced to WordPress. WP Post ID: ${wpId}`
      : 'WordPress sync failed. Marked as pending for retry.',
    wpPostId: wpId || null,
  });
});

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  publishPropertyToWordPress,
};
