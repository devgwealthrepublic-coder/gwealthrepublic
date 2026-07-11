const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary SDK Configuration.
 * Uses credentials from .env file.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Custom Multer Storage Engine for Cloudinary v2
 *
 * multer-storage-cloudinary only supports cloudinary v1, so we build our own.
 * This class implements multer's StorageEngine interface using
 * cloudinary v2's upload_stream API.
 *
 * Usage:
 *   multer({ storage: new CloudinaryStorage({ folder: '...', resource_type: 'image' }) })
 */
class CloudinaryStorage {
  constructor(options = {}) {
    this.folder        = options.folder        || 'gwealth-uploads';
    this.resourceType  = options.resource_type || 'image';
    this.transformation = options.transformation || [];
    this.allowedFormats = options.allowed_formats || null;
  }

  /**
   * _handleFile — Called by multer for each uploaded file.
   * Pipes the incoming file stream directly to Cloudinary upload_stream.
   */
  _handleFile(req, file, cb) {
    const uploadOptions = {
      folder:        this.folder,
      resource_type: this.resourceType,
    };

    if (this.transformation?.length) {
      uploadOptions.transformation = this.transformation;
    }
    if (this.allowedFormats) {
      uploadOptions.allowed_formats = this.allowedFormats;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return cb(error);

        // Attach Cloudinary result to the file object
        // req.file.path and req.files[n].path will be the Cloudinary CDN URL
        cb(null, {
          path:        result.secure_url,
          filename:    result.public_id,
          size:        result.bytes,
          format:      result.format,
          width:       result.width,
          height:      result.height,
          cloudinaryId: result.public_id,
        });
      }
    );

    // Pipe multer's file stream into Cloudinary
    file.stream.pipe(uploadStream);
  }

  /**
   * _removeFile — Called by multer if an error occurs mid-upload.
   * Cleans up the already-uploaded file from Cloudinary.
   */
  _removeFile(req, file, cb) {
    if (file.cloudinaryId) {
      cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: this.resourceType }, cb);
    } else {
      cb(null);
    }
  }
}

/**
 * Pre-configured storage instances for different upload types
 */
const imageStorage = new CloudinaryStorage({
  folder:          'gwealth-properties/images',
  resource_type:   'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation:  [
    { quality: 'auto', fetch_format: 'auto' },
    { width: 1200, crop: 'limit' },
  ],
});

/**
 * Video storage — auto-compresses drone footage for 3G/4G mobile streaming.
 * Architecture: prd.md Section 8 — Bandwidth Preservation (The Video Rule)
 */
const videoStorage = new CloudinaryStorage({
  folder:          'gwealth-properties/videos',
  resource_type:   'video',
  allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
  transformation:  [
    { quality: 'auto:low', fetch_format: 'mp4' },
    { width: 1280, crop: 'limit' },
  ],
});

module.exports = { cloudinary, imageStorage, videoStorage };
